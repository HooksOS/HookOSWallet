/**
 * `useLaunchEntryStore` — a single token's full LaunchWars entry within a season.
 *
 * Follows the `createQueryStore` shape used by `data/gamification/reputationStore.ts`: reactive
 * params (re-targeted via `useLaunchEntryStore.getState().fetch({ chainId, seasonId, token })`),
 * `fetcher`, `staleTime`/`cacheTime`, and a selector helper. The entry is only fetched once a
 * non-zero `token` is supplied; read failures are logged and resolve to a `null` entry.
 */
import { type Address } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { ZERO_ADDRESS } from '../../core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type LaunchWarsEntry } from '../../core/types';
import { getLaunchEntry } from './launchWarsReads';

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type LaunchEntryParams = {
  chainId: HookosChainId;
  seasonId: number;
  token: Address;
};

type LaunchEntryData = {
  entry: LaunchWarsEntry | null;
};

type LaunchEntryState = {
  /** `null` while the first fetch is in flight or when no entry exists for the token. */
  getEntry: () => LaunchWarsEntry | null;
};

export const useLaunchEntryStore = createQueryStore<LaunchEntryData, LaunchEntryParams, LaunchEntryState>(
  {
    fetcher: fetchLaunchEntry,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
      seasonId: 0,
      token: ZERO_ADDRESS,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getEntry: () => get().getData()?.entry ?? null,
  })
);

async function fetchLaunchEntry(
  { chainId, seasonId, token }: LaunchEntryParams,
  abortController: AbortController | null
): Promise<LaunchEntryData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  if (token === ZERO_ADDRESS) {
    return { entry: null };
  }

  try {
    const entry = await getLaunchEntry(chainId, seasonId, token, options);
    return { entry };
  } catch (error) {
    logger.warn('[hookos/launchEntryStore]: entry read failed', {
      chainId,
      seasonId,
      token,
      error: error instanceof Error ? error.message : String(error),
    });
    return { entry: null };
  }
}
