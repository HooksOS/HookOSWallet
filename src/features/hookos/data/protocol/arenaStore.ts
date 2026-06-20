/**
 * `useArenaStore` — the HookOS Arena battle list for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/hookosTokensStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers. Reads are on-chain; the browse loop is
 * capped at `ONCHAIN_BATTLE_CAP` and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type Battle } from '../../core/types';
import { browseBattles, getBattleCount } from './arenaReads';

const ONCHAIN_BATTLE_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type ArenaParams = {
  chainId: HookosChainId;
};

type ArenaData = {
  chainId: HookosChainId;
  battles: Battle[];
};

type ArenaState = {
  /** `null` while the first fetch is in flight, otherwise the battle list. */
  getBattles: () => Battle[] | null;
  getBattle: (battleId: number) => Battle | null;
};

export const useArenaStore = createQueryStore<ArenaData, ArenaParams, ArenaState>(
  {
    fetcher: fetchBattles,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getBattles: () => get().getData()?.battles ?? null,
    getBattle: battleId => get().getData()?.battles.find(b => b.battleId === battleId) ?? null,
  })
);

async function fetchBattles({ chainId }: ArenaParams, abortController: AbortController | null): Promise<ArenaData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const total = Number(await getBattleCount(chainId, options));
  if (total > ONCHAIN_BATTLE_CAP) {
    logger.warn('[hookos/arenaStore]: capping on-chain battle reads', { chainId, totalBattles: total, cap: ONCHAIN_BATTLE_CAP });
  }

  const battles = await browseBattles(chainId, ONCHAIN_BATTLE_CAP, options);
  return { chainId, battles };
}
