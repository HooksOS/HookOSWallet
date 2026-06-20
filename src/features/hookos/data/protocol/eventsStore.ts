/**
 * `useEventsStore` — the HookOS Events list + current season for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/hookosTokensStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers. Reads are on-chain; the browse loop is
 * capped at `ONCHAIN_EVENT_CAP` and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookosEvent } from '../../core/types';
import { browseEvents, getCurrentSeason, getEventCount } from './eventsReads';

const ONCHAIN_EVENT_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type EventsParams = {
  chainId: HookosChainId;
};

type EventsData = {
  chainId: HookosChainId;
  currentSeason: number;
  events: HookosEvent[];
};

type EventsState = {
  /** `null` while the first fetch is in flight, otherwise the event list. */
  getEvents: () => HookosEvent[] | null;
  getEvent: (eventId: number) => HookosEvent | null;
  /** Current season, or `0` before the first successful fetch. */
  getCurrentSeason: () => number;
};

export const useEventsStore = createQueryStore<EventsData, EventsParams, EventsState>(
  {
    fetcher: fetchEvents,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getEvents: () => get().getData()?.events ?? null,
    getEvent: eventId => get().getData()?.events.find(e => e.eventId === eventId) ?? null,
    getCurrentSeason: () => get().getData()?.currentSeason ?? 0,
  })
);

async function fetchEvents({ chainId }: EventsParams, abortController: AbortController | null): Promise<EventsData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const [total, currentSeason] = await Promise.all([
    getEventCount(chainId, options).then(Number),
    getCurrentSeason(chainId, options),
  ]);
  if (total > ONCHAIN_EVENT_CAP) {
    logger.warn('[hookos/eventsStore]: capping on-chain event reads', { chainId, totalEvents: total, cap: ONCHAIN_EVENT_CAP });
  }

  const events = await browseEvents(chainId, ONCHAIN_EVENT_CAP, options);
  return { chainId, currentSeason, events };
}
