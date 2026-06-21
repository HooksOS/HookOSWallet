/**
 * Pure on-chain read functions for the HookOS LaunchWars contract (token-launch competitions).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `LAUNCHWARS_READ_ABI` in `core/gamificationAbis.ts`. Failures (not deployed) throw a
 * namespaced `RainbowError`. Reads cover the current season pointer, per-season info, the token
 * leaderboard, and a single token's full launch entry. Writes (register/score) live in the wallet's
 * signer/RAP path, not here.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { LAUNCHWARS_READ_ABI } from '../../core/gamificationAbis';
import { type LaunchWarsEntry, type LaunchWarsLeaderboardEntry, type LaunchWarsSeason } from '../../core/types';

function getLaunchWars(chainId: HookosChainId): Address {
  const { LaunchWars } = getProtocolAddresses(chainId);
  if (LaunchWars === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/launchWarsReads]: LaunchWars is not deployed on chain ${chainId}`);
  }
  return LaunchWars;
}

/** The current (active) season id. */
export async function getCurrentSeasonId(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<number> {
  const launchWars = getLaunchWars(chainId);
  const client = createHookosPublicClient(chainId, options);
  const seasonId = await client.readContract({ address: launchWars, abi: LAUNCHWARS_READ_ABI, functionName: 'currentSeasonId' });
  return Number(seasonId);
}

type SeasonTuple = readonly [
  name: string,
  startsAt: bigint,
  endsAt: bigint,
  prizePool: bigint,
  settled: boolean,
  tokenCount: bigint,
];

function mapSeason(seasonId: number, t: SeasonTuple): LaunchWarsSeason {
  return {
    seasonId,
    name: t[0],
    startsAt: Number(t[1]),
    endsAt: Number(t[2]),
    prizePool: t[3],
    settled: t[4],
    tokenCount: Number(t[5]),
  };
}

/** Reads the season header (name, window, prize pool, settled flag, token count). */
export async function getSeasonInfo(
  chainId: HookosChainId,
  seasonId: number,
  options?: { signal?: AbortSignal }
): Promise<LaunchWarsSeason> {
  const launchWars = getLaunchWars(chainId);
  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: launchWars,
    abi: LAUNCHWARS_READ_ABI,
    functionName: 'getSeasonInfo',
    args: [BigInt(seasonId)],
  });
  return mapSeason(seasonId, tuple);
}

/** Reads the top `count` tokens on a season's leaderboard, ordered by composite score. */
export async function getSeasonLeaderboard(
  chainId: HookosChainId,
  seasonId: number,
  count: number,
  options?: { signal?: AbortSignal }
): Promise<LaunchWarsLeaderboardEntry[]> {
  const launchWars = getLaunchWars(chainId);
  const client = createHookosPublicClient(chainId, options);
  const [tokens, scores] = await client.readContract({
    address: launchWars,
    abi: LAUNCHWARS_READ_ABI,
    functionName: 'getSeasonLeaderboard',
    args: [BigInt(seasonId), BigInt(count)],
  });

  return tokens.map((token, i) => ({
    token,
    score: scores[i] ?? 0n,
    rank: i + 1,
  }));
}

/** Reads a single token's full launch entry within a season. */
export async function getLaunchEntry(
  chainId: HookosChainId,
  seasonId: number,
  token: Address,
  options?: { signal?: AbortSignal }
): Promise<LaunchWarsEntry> {
  const launchWars = getLaunchWars(chainId);
  const client = createHookosPublicClient(chainId, options);
  const e = await client.readContract({
    address: launchWars,
    abi: LAUNCHWARS_READ_ABI,
    functionName: 'getLaunchEntry',
    args: [BigInt(seasonId), token],
  });

  return {
    token: e.tokenAddress,
    creator: e.creator,
    volume: e.volume,
    tvl: e.tvl,
    holders: Number(e.holders),
    hookCount: Number(e.hookCount),
    socialScore: e.socialScore,
    compositeScore: e.compositeScore,
    rank: Number(e.rank),
    registered: e.registered,
  };
}
