/**
 * `useNftStore` — a wallet's HookOS NFT collection (LP positions + achievements) for a chain.
 *
 * Follows the `createQueryStore` shape used by `data/protocol/hookosTokensStore.ts`: reactive
 * params, `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store.
 *
 * Reads are fully on-chain (HookOSNFT). The collection is only fetched once a non-zero `address`
 * is supplied (callers re-target via `useNftStore.getState().fetch({ chainId, address })`).
 */
import { type Address } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { ZERO_ADDRESS } from '../../core/addresses';
import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookosNftCollection } from '../../core/types';
import { getNftCollection } from './nftReads';

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type NftParams = {
  chainId: HookosChainId;
  address: Address;
};

type NftData = {
  chainId: HookosChainId;
  collection: HookosNftCollection | null;
};

type NftState = {
  /** `null` while the first fetch is in flight, otherwise the connected wallet's collection (or null). */
  getCollection: () => HookosNftCollection | null;
};

export const useNftStore = createQueryStore<NftData, NftParams, NftState>(
  {
    fetcher: fetchNftCollection,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
      address: ZERO_ADDRESS,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getCollection: () => get().getData()?.collection ?? null,
  })
);

async function fetchNftCollection(
  { chainId, address }: NftParams,
  abortController: AbortController | null
): Promise<NftData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  let collection: HookosNftCollection | null = null;
  if (address !== ZERO_ADDRESS) {
    try {
      collection = await getNftCollection(chainId, address, options);
    } catch (error) {
      logger.warn('[hookos/nftStore]: collection read failed', {
        chainId,
        address,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { chainId, collection };
}
