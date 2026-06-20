/**
 * Pure on-chain read functions for the HookOS Arena (PvP token battles).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `ARENA_READ_ABI` in `core/protocolAbis.ts`. Failures throw a namespaced
 * `RainbowError`. The Arena has no batch list method, so `browseBattles` loops `battleCount` ->
 * `battles(i)`. Writes (createBattle/placeWager/claimWinnings) live in the wallet's signer/RAP path.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { ARENA_READ_ABI } from '../../core/protocolAbis';
import { type Battle, BattleSide, BattleStatus } from '../../core/types';

function getArena(chainId: HookosChainId): Address {
  const { Arena } = getProtocolAddresses(chainId);
  if (Arena === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/arenaReads]: Arena is not deployed on chain ${chainId}`);
  }
  return Arena;
}

function toStatus(raw: number | bigint): BattleStatus {
  const v = Number(raw);
  return v >= BattleStatus.Open && v <= BattleStatus.Cancelled ? (v as BattleStatus) : BattleStatus.Open;
}

type BattleTuple = readonly [
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
  pot: bigint,
  teamAPot: bigint,
  teamBPot: bigint,
  minWager: bigint,
  maxWager: bigint,
  startTime: bigint,
  endTime: bigint,
  round: number,
  status: number,
  winner: number,
  wagerCount: bigint,
];

function mapBattle(battleId: number, t: BattleTuple): Battle {
  return {
    battleId,
    tokenA: t[0],
    tokenB: t[1],
    pot: t[2],
    teamAPot: t[3],
    teamBPot: t[4],
    minWager: t[5],
    maxWager: t[6],
    startTime: Number(t[7]),
    endTime: Number(t[8]),
    round: Number(t[9]),
    status: toStatus(t[10]),
    winner: Number(t[11]) === BattleSide.TeamB ? BattleSide.TeamB : BattleSide.TeamA,
    wagerCount: Number(t[12]),
  };
}

/** Total number of battles created on `chainId`. */
export async function getBattleCount(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<bigint> {
  const arena = getArena(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({ address: arena, abi: ARENA_READ_ABI, functionName: 'battleCount' });
}

/** Reads a single battle by id. */
export async function getBattle(
  chainId: HookosChainId,
  battleId: number,
  options?: { signal?: AbortSignal }
): Promise<Battle> {
  const arena = getArena(chainId);
  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: arena,
    abi: ARENA_READ_ABI,
    functionName: 'battles',
    args: [BigInt(battleId)],
  });
  return mapBattle(battleId, tuple);
}

/** True if `player` has already wagered on `battleId`. */
export async function hasWageredOnBattle(
  chainId: HookosChainId,
  battleId: number,
  player: Address,
  options?: { signal?: AbortSignal }
): Promise<boolean> {
  const arena = getArena(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({
    address: arena,
    abi: ARENA_READ_ABI,
    functionName: 'hasWagered',
    args: [BigInt(battleId), player],
  });
}

/** Browses up to `limit` battles, most-recent first. Skips entries whose read fails. */
export async function browseBattles(
  chainId: HookosChainId,
  limit: number,
  options?: { signal?: AbortSignal }
): Promise<Battle[]> {
  const total = Number(await getBattleCount(chainId, options));
  const take = Math.min(total, limit);
  const battles: Battle[] = [];

  for (let i = total - 1; i >= total - take; i--) {
    try {
      battles.push(await getBattle(chainId, i, options));
    } catch {
      // Skip battles whose on-chain read fails; the list stays best-effort.
    }
  }
  return battles;
}
