/**
 * `useStakingStore` — a wallet's HookOS staking position + the pool-wide staking stats for a chain.
 *
 * Follows the `createQueryStore` shape used by `data/protocol/hookosTokensStore.ts`: reactive
 * params, `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store.
 *
 * Reads are fully on-chain (HookStaking). The pool stats are fetched regardless of `address`; the
 * per-wallet position is only fetched once a non-zero `address` is supplied (callers re-target via
 * `useStakingStore.getState().fetch({ chainId, address })`). HookStaking is not deployed on Base —
 * this vertical defaults to MegaETH.
 */
import { type Address } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { ZERO_ADDRESS } from '../../core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookStakePosition, type HookStakingPool } from '../../core/types';
import { getStakePosition, getStakingPool } from './stakingReads';

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type StakingParams = {
  chainId: HookosChainId;
  address: Address;
};

type StakingData = {
  chainId: HookosChainId;
  pool: HookStakingPool | null;
  position: HookStakePosition | null;
};

type StakingState = {
  /** Pool-wide staking stats, or `null` before the first successful fetch. */
  getPool: () => HookStakingPool | null;
  /** `null` while the first fetch is in flight, otherwise the connected wallet's position (or null). */
  getPosition: () => HookStakePosition | null;
};

export const useStakingStore = createQueryStore<StakingData, StakingParams, StakingState>(
  {
    fetcher: fetchStaking,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.megaeth,
      address: ZERO_ADDRESS,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getPool: () => get().getData()?.pool ?? null,
    getPosition: () => get().getData()?.position ?? null,
  })
);

async function fetchStaking(
  { chainId, address }: StakingParams,
  abortController: AbortController | null
): Promise<StakingData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  let pool: HookStakingPool | null = null;
  try {
    pool = await getStakingPool(chainId, options);
  } catch (error) {
    logger.warn('[hookos/stakingStore]: pool read failed', {
      chainId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  let position: HookStakePosition | null = null;
  if (address !== ZERO_ADDRESS) {
    try {
      position = await getStakePosition(chainId, address, options);
    } catch (error) {
      logger.warn('[hookos/stakingStore]: position read failed', {
        chainId,
        address,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { chainId, pool, position };
}
