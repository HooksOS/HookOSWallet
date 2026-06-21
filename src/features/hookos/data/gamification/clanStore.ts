/**
 * `useClansStore` — the HookOS clan list for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/hookosTokensStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers. Reads are on-chain; the browse loop is
 * capped at `ONCHAIN_CLAN_CAP` and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookosClan } from '../../core/types';
import { browseClans, getClanCount } from './clanReads';

const ONCHAIN_CLAN_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type ClansParams = {
  chainId: HookosChainId;
};

type ClansData = {
  chainId: HookosChainId;
  clans: HookosClan[];
};

type ClansState = {
  /** `null` while the first fetch is in flight, otherwise the clan list. */
  getClans: () => HookosClan[] | null;
  getClan: (clanId: number) => HookosClan | null;
};

export const useClansStore = createQueryStore<ClansData, ClansParams, ClansState>(
  {
    fetcher: fetchClans,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getClans: () => get().getData()?.clans ?? null,
    getClan: clanId => get().getData()?.clans.find(c => c.clanId === clanId) ?? null,
  })
);

async function fetchClans({ chainId }: ClansParams, abortController: AbortController | null): Promise<ClansData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const total = Number(await getClanCount(chainId, options));
  if (total > ONCHAIN_CLAN_CAP) {
    logger.warn('[hookos/clanStore]: capping on-chain clan reads', { chainId, totalClans: total, cap: ONCHAIN_CLAN_CAP });
  }

  const clans = await browseClans(chainId, ONCHAIN_CLAN_CAP, options);
  return { chainId, clans };
}
