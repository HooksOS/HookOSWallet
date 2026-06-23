/**
 * `useReputationStore` — a wallet's HookOS reputation profile + the leaderboard for a chain.
 *
 * Follows the `createQueryStore` shape used by `data/protocol/hookosTokensStore.ts`: reactive
 * params, `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store.
 *
 * Reads are fully on-chain (ReputationSystem). The leaderboard is fetched regardless of `address`;
 * the per-wallet profile is only fetched once a non-zero `address` is supplied (callers re-target
 * via `useReputationStore.getState().fetch({ chainId, address })`).
 */
import { type Address } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';
import { userAssetsStoreManager } from '@/state/assets/userAssetsStoreManager';

import { ZERO_ADDRESS } from '../../core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type ReputationLeaderboardEntry, type ReputationProfile } from '../../core/types';
import { getReputationLeaderboard, getReputationProfile } from './reputationReads';

/** How many leaderboard entries to request. The contract returns up to its own `MAX_LEADERBOARD`. */
const LEADERBOARD_COUNT = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type ReputationParams = {
  chainId: HookosChainId;
  address: Address;
};

type ReputationData = {
  chainId: HookosChainId;
  profile: ReputationProfile | null;
  leaderboard: ReputationLeaderboardEntry[];
};

type ReputationState = {
  /** `null` while the first fetch is in flight, otherwise the connected wallet's profile (or null). */
  getProfile: () => ReputationProfile | null;
  /** Leaderboard entries, or `[]` before the first successful fetch. */
  getLeaderboard: () => ReputationLeaderboardEntry[];
};

export const useReputationStore = createQueryStore<ReputationData, ReputationParams, ReputationState>(
  {
    fetcher: fetchReputation,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
      // Reactive: track the connected wallet so the profile refetches on account switch
      // (falls back to ZERO_ADDRESS when no wallet is connected → leaderboard-only fetch).
      address: $ => ($(userAssetsStoreManager).address || ZERO_ADDRESS) as Address,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getProfile: () => get().getData()?.profile ?? null,
    getLeaderboard: () => get().getData()?.leaderboard ?? [],
  })
);

async function fetchReputation(
  { chainId, address }: ReputationParams,
  abortController: AbortController | null
): Promise<ReputationData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const leaderboard = await getReputationLeaderboard(chainId, LEADERBOARD_COUNT, options);

  let profile: ReputationProfile | null = null;
  if (address !== ZERO_ADDRESS) {
    try {
      profile = await getReputationProfile(chainId, address, options);
    } catch (error) {
      logger.warn('[hookos/reputationStore]: profile read failed', {
        chainId,
        address,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { chainId, profile, leaderboard };
}
