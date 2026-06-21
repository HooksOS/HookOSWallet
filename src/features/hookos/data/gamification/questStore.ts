/**
 * `useQuestsStore` — the HookOS Quest list for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/hookosTokensStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers. Reads are on-chain; the browse loop is
 * capped at `ONCHAIN_QUEST_CAP` and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookosQuest } from '../../core/types';
import { browseQuests, getActiveQuestIds } from './questReads';

const ONCHAIN_QUEST_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type QuestsParams = {
  chainId: HookosChainId;
};

type QuestsData = {
  chainId: HookosChainId;
  quests: HookosQuest[];
};

type QuestsState = {
  /** `null` while the first fetch is in flight, otherwise the quest list. */
  getQuests: () => HookosQuest[] | null;
  getQuest: (questId: number) => HookosQuest | null;
};

export const useQuestsStore = createQueryStore<QuestsData, QuestsParams, QuestsState>(
  {
    fetcher: fetchQuests,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getQuests: () => get().getData()?.quests ?? null,
    getQuest: questId => get().getData()?.quests.find(q => q.questId === questId) ?? null,
  })
);

async function fetchQuests({ chainId }: QuestsParams, abortController: AbortController | null): Promise<QuestsData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const ids = await getActiveQuestIds(chainId, options);
  if (ids.length > ONCHAIN_QUEST_CAP) {
    logger.warn('[hookos/questStore]: capping on-chain quest reads', { chainId, totalQuests: ids.length, cap: ONCHAIN_QUEST_CAP });
  }

  const quests = await browseQuests(chainId, ONCHAIN_QUEST_CAP, options);
  return { chainId, quests };
}
