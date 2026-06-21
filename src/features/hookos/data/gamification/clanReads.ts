/**
 * Pure on-chain read functions for the HookOS ClanSystem contract (guilds / teams).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `CLAN_READ_ABI` in `core/gamificationAbis.ts`. Failures throw a namespaced
 * `RainbowError`. The leaderboard returns clan ids ordered by volume, so `browseClans` resolves the
 * id list then loops `getClanInfo`. Writes (createClan/joinClan) live in the wallet's signer/RAP path.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { CLAN_READ_ABI } from '../../core/gamificationAbis';
import { type ClanMembership, ClanRank, type HookosClan } from '../../core/types';

function getClanSystem(chainId: HookosChainId): Address {
  const { ClanSystem } = getProtocolAddresses(chainId);
  if (ClanSystem === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/clanReads]: ClanSystem is not deployed on chain ${chainId}`);
  }
  return ClanSystem;
}

function toClanRank(raw: number | bigint): ClanRank {
  const value = Number(raw);
  if (value <= ClanRank.None) return ClanRank.None;
  if (value >= ClanRank.Leader) return ClanRank.Leader;
  return value as ClanRank;
}

type ClanTuple = readonly [
  name: string,
  tag: string,
  description: string,
  logoURI: string,
  leader: Address,
  memberCount: bigint,
  officerCount: bigint,
  treasuryBalance: bigint,
  totalVolume: bigint,
  totalLaunches: bigint,
  totalXP: bigint,
  active: boolean,
];

function mapClan(clanId: number, t: ClanTuple): HookosClan {
  return {
    clanId,
    name: t[0],
    tag: t[1],
    description: t[2],
    logoURI: t[3],
    leader: t[4],
    memberCount: Number(t[5]),
    officerCount: Number(t[6]),
    treasuryBalance: t[7],
    totalVolume: t[8],
    totalLaunches: Number(t[9]),
    totalXP: t[10],
    active: t[11],
  };
}

/** Total number of clans created on `chainId`. */
export async function getClanCount(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<bigint> {
  const clanSystem = getClanSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({ address: clanSystem, abi: CLAN_READ_ABI, functionName: 'clanCount' });
}

/** The top `count` clan ids ordered by volume (descending). */
export async function getClanLeaderboardIds(
  chainId: HookosChainId,
  count: number,
  options?: { signal?: AbortSignal }
): Promise<number[]> {
  const clanSystem = getClanSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  const [clanIds] = await client.readContract({
    address: clanSystem,
    abi: CLAN_READ_ABI,
    functionName: 'getLeaderboard',
    args: [BigInt(count)],
  });
  return clanIds.map(Number);
}

/** Reads a single clan by id. */
export async function getClanInfo(
  chainId: HookosChainId,
  clanId: number,
  options?: { signal?: AbortSignal }
): Promise<HookosClan> {
  const clanSystem = getClanSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: clanSystem,
    abi: CLAN_READ_ABI,
    functionName: 'getClanInfo',
    args: [BigInt(clanId)],
  });
  return mapClan(clanId, tuple);
}

/** The connected wallet's clan membership. */
export async function getClanMembership(
  chainId: HookosChainId,
  wallet: Address,
  options?: { signal?: AbortSignal }
): Promise<ClanMembership> {
  const clanSystem = getClanSystem(chainId);
  const client = createHookosPublicClient(chainId, options);
  const [inClan, clanId, rank] = await client.readContract({
    address: clanSystem,
    abi: CLAN_READ_ABI,
    functionName: 'getMemberInfo',
    args: [wallet],
  });
  return { inClan, clanId: Number(clanId), rank: toClanRank(rank) };
}

/** Browses up to `limit` clans, leaderboard order. Skips entries whose read fails. */
export async function browseClans(
  chainId: HookosChainId,
  limit: number,
  options?: { signal?: AbortSignal }
): Promise<HookosClan[]> {
  const ids = await getClanLeaderboardIds(chainId, limit, options);
  const clans: HookosClan[] = [];

  for (const id of ids) {
    try {
      clans.push(await getClanInfo(chainId, id, options));
    } catch {
      // Skip clans whose on-chain read fails; the list stays best-effort.
    }
  }
  return clans;
}
