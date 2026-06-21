/**
 * Pure on-chain read functions for the HookOS BattlePass.
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with the tightly-scoped ABI in `core/gamificationAbis.ts`. Returns are mapped to the
 * shared domain types in `core/types.ts`. Failures (not deployed) throw a namespaced `RainbowError`.
 *
 * Read-method names/shapes mirror the BattlePass contract (`protocol/contracts/contracts/
 * gamification/BattlePass.sol`). Writes (mintPass) intentionally live in the wallet's signer/RAP
 * path, not here.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { BATTLEPASS_READ_ABI } from '../../core/gamificationAbis';
import { type BattlePassProgress, type BattlePassSeason } from '../../core/types';

/** Resolves the BattlePass address for `chainId`, throwing when it is not deployed. */
function getBattlePass(chainId: HookosChainId): Address {
  const { BattlePass } = getProtocolAddresses(chainId);
  if (BattlePass === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/battlePassReads]: BattlePass is not deployed on chain ${chainId}`);
  }
  return BattlePass;
}

/** Reads the id of the current (latest) season. */
export async function getCurrentSeasonId(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<number> {
  const BattlePass = getBattlePass(chainId);

  const client = createHookosPublicClient(chainId, options);
  const seasonId = await client.readContract({
    address: BattlePass,
    abi: BATTLEPASS_READ_ABI,
    functionName: 'currentSeasonId',
  });

  return Number(seasonId);
}

/** Raw `getSeasonInfo` tuple, mapped into a `BattlePassSeason` by `mapSeason`. */
type SeasonTuple = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];

function mapSeason(seasonId: number, t: SeasonTuple): BattlePassSeason {
  return {
    seasonId,
    startTime: Number(t[0]),
    endTime: Number(t[1]),
    maxTiers: Number(t[2]),
    proPassPrice: t[3],
    totalParticipants: Number(t[4]),
    totalXPDistributed: t[5],
    totalPrizePool: t[6],
    active: t[7],
  };
}

/** Reads the aggregate stats for `seasonId`. */
export async function getBattlePassSeason(
  chainId: HookosChainId,
  seasonId: number,
  options?: { signal?: AbortSignal }
): Promise<BattlePassSeason> {
  const BattlePass = getBattlePass(chainId);

  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: BattlePass,
    abi: BATTLEPASS_READ_ABI,
    functionName: 'getSeasonInfo',
    args: [BigInt(seasonId)],
  });

  return mapSeason(seasonId, tuple);
}

/** Reads `wallet`'s pass + streak progress for `seasonId` (pass fields are zeroed when unminted). */
export async function getBattlePassProgress(
  chainId: HookosChainId,
  seasonId: number,
  wallet: Address,
  options?: { signal?: AbortSignal }
): Promise<BattlePassProgress> {
  const BattlePass = getBattlePass(chainId);

  const client = createHookosPublicClient(chainId, options);
  const [passId, streak] = await Promise.all([
    client.readContract({
      address: BattlePass,
      abi: BATTLEPASS_READ_ABI,
      functionName: 'getUserPass',
      args: [BigInt(seasonId), wallet],
    }),
    client.readContract({
      address: BattlePass,
      abi: BATTLEPASS_READ_ABI,
      functionName: 'getStreak',
      args: [wallet],
    }),
  ]);

  const currentStreak = Number(streak[0]);
  const longestStreak = Number(streak[1]);
  const multiplierBps = Number(streak[2]);

  const id = Number(passId);
  if (id === 0) {
    return {
      hasPass: false,
      passId: 0,
      tier: 0,
      xp: 0n,
      isPro: false,
      xpNeeded: 0n,
      xpCurrent: 0n,
      currentStreak,
      longestStreak,
      multiplierBps,
    };
  }

  const [info, nextTier] = await Promise.all([
    client.readContract({
      address: BattlePass,
      abi: BATTLEPASS_READ_ABI,
      functionName: 'getPassInfo',
      args: [passId],
    }),
    client.readContract({
      address: BattlePass,
      abi: BATTLEPASS_READ_ABI,
      functionName: 'getXPForNextTier',
      args: [passId],
    }),
  ]);

  const [, tier, xp, isPro] = info;
  const [needed, current] = nextTier;

  return {
    hasPass: true,
    passId: id,
    tier: Number(tier),
    xp,
    isPro,
    xpNeeded: needed,
    xpCurrent: current,
    currentStreak,
    longestStreak,
    multiplierBps,
  };
}
