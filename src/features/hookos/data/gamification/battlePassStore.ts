/**
 * `useBattlePassStore` — a wallet's HookOS BattlePass progress + the current season for a chain.
 *
 * Follows the `createQueryStore` shape used by `data/protocol/hookosTokensStore.ts`: reactive
 * params, `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store.
 *
 * Reads are fully on-chain (BattlePass). The season is fetched regardless of `address`; the
 * per-wallet progress is only fetched once a non-zero `address` is supplied (callers re-target
 * via `useBattlePassStore.getState().fetch({ chainId, address })`).
 */
import { type Address } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { ZERO_ADDRESS } from '../../core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type BattlePassProgress, type BattlePassSeason } from '../../core/types';
import { getBattlePassProgress, getBattlePassSeason, getCurrentSeasonId } from './battlePassReads';

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type BattlePassParams = {
  chainId: HookosChainId;
  address: Address;
};

type BattlePassData = {
  chainId: HookosChainId;
  season: BattlePassSeason | null;
  progress: BattlePassProgress | null;
};

type BattlePassState = {
  /** Current season aggregates, or `null` before the first successful fetch. */
  getSeason: () => BattlePassSeason | null;
  /** `null` while the first fetch is in flight, otherwise the connected wallet's progress (or null). */
  getProgress: () => BattlePassProgress | null;
};

export const useBattlePassStore = createQueryStore<BattlePassData, BattlePassParams, BattlePassState>(
  {
    fetcher: fetchBattlePass,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
      address: ZERO_ADDRESS,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getSeason: () => get().getData()?.season ?? null,
    getProgress: () => get().getData()?.progress ?? null,
  })
);

async function fetchBattlePass(
  { chainId, address }: BattlePassParams,
  abortController: AbortController | null
): Promise<BattlePassData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const seasonId = await getCurrentSeasonId(chainId, options);

  let season: BattlePassSeason | null = null;
  try {
    season = await getBattlePassSeason(chainId, seasonId, options);
  } catch (error) {
    logger.warn('[hookos/battlePassStore]: season read failed', {
      chainId,
      seasonId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  let progress: BattlePassProgress | null = null;
  if (address !== ZERO_ADDRESS) {
    try {
      progress = await getBattlePassProgress(chainId, seasonId, address, options);
    } catch (error) {
      logger.warn('[hookos/battlePassStore]: progress read failed', {
        chainId,
        address,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { chainId, season, progress };
}
