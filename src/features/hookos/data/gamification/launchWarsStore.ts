/**
 * `useLaunchWarsStore` — the LaunchWars leaderboard + current season for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/eventsStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers. Reads are on-chain; the leaderboard read
 * is capped at `ONCHAIN_LAUNCHWARS_CAP` and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type LaunchWarsLeaderboardEntry, type LaunchWarsSeason } from '../../core/types';
import { getCurrentSeasonId, getSeasonInfo, getSeasonLeaderboard } from './launchWarsReads';

const ONCHAIN_LAUNCHWARS_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type LaunchWarsParams = {
  chainId: HookosChainId;
};

type LaunchWarsData = {
  chainId: HookosChainId;
  seasonId: number;
  season: LaunchWarsSeason | null;
  entries: LaunchWarsLeaderboardEntry[];
};

type LaunchWarsState = {
  /** `null` while the first fetch is in flight, otherwise the leaderboard entries. */
  getEntries: () => LaunchWarsLeaderboardEntry[] | null;
  /** The current season header, or `null` before the first successful fetch. */
  getSeason: () => LaunchWarsSeason | null;
  /** The current season id, or `0` before the first successful fetch. */
  getSeasonId: () => number;
};

export const useLaunchWarsStore = createQueryStore<LaunchWarsData, LaunchWarsParams, LaunchWarsState>(
  {
    fetcher: fetchLaunchWars,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getEntries: () => get().getData()?.entries ?? null,
    getSeason: () => get().getData()?.season ?? null,
    getSeasonId: () => get().getData()?.seasonId ?? 0,
  })
);

async function fetchLaunchWars({ chainId }: LaunchWarsParams, abortController: AbortController | null): Promise<LaunchWarsData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const seasonId = await getCurrentSeasonId(chainId, options);

  let season: LaunchWarsSeason | null = null;
  let entries: LaunchWarsLeaderboardEntry[] = [];
  try {
    season = await getSeasonInfo(chainId, seasonId, options);
    entries = await getSeasonLeaderboard(chainId, seasonId, ONCHAIN_LAUNCHWARS_CAP, options);
  } catch (error) {
    logger.warn('[hookos/launchWarsStore]: season read failed', {
      chainId,
      seasonId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (season && season.tokenCount > ONCHAIN_LAUNCHWARS_CAP) {
    logger.warn('[hookos/launchWarsStore]: capping on-chain leaderboard reads', {
      chainId,
      tokenCount: season.tokenCount,
      cap: ONCHAIN_LAUNCHWARS_CAP,
    });
  }

  return { chainId, seasonId, season, entries };
}
