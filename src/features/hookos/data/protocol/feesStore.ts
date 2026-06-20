/**
 * `useFeesStore` — the HookOS FeeRouter overview + recipient split for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/hookosTokensStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store. Reads are fully on-chain.
 */
import { time } from '@/framework/core/utils/time';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type FeeOverview, type FeeShare } from '../../core/types';
import { getFeeOverview, getFeeShares } from './feesReads';

const STALE_TIME = time.minutes(1);
const CACHE_TIME = time.minutes(10);

type FeesParams = {
  chainId: HookosChainId;
};

type FeesData = {
  chainId: HookosChainId;
  overview: FeeOverview;
  shares: FeeShare[];
};

type FeesState = {
  /** `null` while the first fetch is in flight, otherwise the router overview. */
  getOverview: () => FeeOverview | null;
  /** Recipient split, or `[]` before the first successful fetch. */
  getShares: () => FeeShare[];
};

export const useFeesStore = createQueryStore<FeesData, FeesParams, FeesState>(
  {
    fetcher: fetchFees,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getOverview: () => get().getData()?.overview ?? null,
    getShares: () => get().getData()?.shares ?? [],
  })
);

async function fetchFees({ chainId }: FeesParams, abortController: AbortController | null): Promise<FeesData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const [overview, shares] = await Promise.all([getFeeOverview(chainId, options), getFeeShares(chainId, options)]);
  return { chainId, overview, shares };
}
