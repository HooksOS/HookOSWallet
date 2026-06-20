/**
 * `useHooksStore` — the HookOS hooks marketplace (HookRegistry) list for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/hookosTokensStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store.
 *
 * Reads are on-chain (the registry has no batch list method). The browse loop is capped at
 * `ONCHAIN_HOOK_CAP`, and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { type Hex } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookEntry } from '../../core/types';
import { browseHooks, getHookCount } from './hooksReads';

/** Hard cap on per-hook on-chain reads, to bound work. */
const ONCHAIN_HOOK_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type HooksParams = {
  chainId: HookosChainId;
};

type HooksData = {
  chainId: HookosChainId;
  hooks: HookEntry[];
};

type HooksState = {
  /** `null` while the first fetch is in flight, otherwise the hook list. */
  getHooks: () => HookEntry[] | null;
  getHook: (hookId: Hex) => HookEntry | null;
};

export const useHooksStore = createQueryStore<HooksData, HooksParams, HooksState>(
  {
    fetcher: fetchHooks,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getHooks: () => get().getData()?.hooks ?? null,
    getHook: hookId => {
      const hooks = get().getData()?.hooks;
      if (!hooks?.length) return null;
      const target = hookId.toLowerCase();
      return hooks.find(hook => hook.hookId.toLowerCase() === target) ?? null;
    },
  })
);

async function fetchHooks({ chainId }: HooksParams, abortController: AbortController | null): Promise<HooksData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const total = Number(await getHookCount(chainId, options));
  if (total > ONCHAIN_HOOK_CAP) {
    logger.warn('[hookos/hooksStore]: capping on-chain hook reads', { chainId, totalHooks: total, cap: ONCHAIN_HOOK_CAP });
  }

  const hooks = await browseHooks(chainId, ONCHAIN_HOOK_CAP, options);
  return { chainId, hooks };
}
