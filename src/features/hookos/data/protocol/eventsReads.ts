/**
 * Pure on-chain read functions for the HookOS Events contract (seasonal competitions).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `EVENTS_READ_ABI` in `core/protocolAbis.ts`. Failures throw a namespaced
 * `RainbowError`. The contract has no batch list method, so `browseEvents` loops `eventCount` ->
 * `events(i)`. Writes (register/claimPrize) live in the wallet's signer/RAP path.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { EVENTS_READ_ABI } from '../../core/protocolAbis';
import { type HookosEvent, HookosEventStatus } from '../../core/types';

function getEventsContract(chainId: HookosChainId): Address {
  const { Events } = getProtocolAddresses(chainId);
  if (Events === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/eventsReads]: Events is not deployed on chain ${chainId}`);
  }
  return Events;
}

function toStatus(raw: number | bigint): HookosEventStatus {
  const v = Number(raw);
  return v >= HookosEventStatus.Upcoming && v <= HookosEventStatus.Cancelled ? (v as HookosEventStatus) : HookosEventStatus.Upcoming;
}

type EventTuple = readonly [
  name: string,
  category: string,
  metadataURI: string,
  prizePool: bigint,
  entryFee: bigint,
  maxPlayers: bigint,
  playerCount: bigint,
  startTime: bigint,
  endTime: bigint,
  season: number,
  status: number,
];

function mapEvent(eventId: number, t: EventTuple): HookosEvent {
  return {
    eventId,
    name: t[0],
    category: t[1],
    metadataURI: t[2],
    prizePool: t[3],
    entryFee: t[4],
    maxPlayers: Number(t[5]),
    playerCount: Number(t[6]),
    startTime: Number(t[7]),
    endTime: Number(t[8]),
    season: Number(t[9]),
    status: toStatus(t[10]),
  };
}

/** Total number of events created on `chainId`. */
export async function getEventCount(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<bigint> {
  const events = getEventsContract(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({ address: events, abi: EVENTS_READ_ABI, functionName: 'eventCount' });
}

/** The current season number. */
export async function getCurrentSeason(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<number> {
  const events = getEventsContract(chainId);
  const client = createHookosPublicClient(chainId, options);
  const season = await client.readContract({ address: events, abi: EVENTS_READ_ABI, functionName: 'currentSeason' });
  return Number(season);
}

/** Reads a single event by id. */
export async function getEvent(
  chainId: HookosChainId,
  eventId: number,
  options?: { signal?: AbortSignal }
): Promise<HookosEvent> {
  const events = getEventsContract(chainId);
  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: events,
    abi: EVENTS_READ_ABI,
    functionName: 'events',
    args: [BigInt(eventId)],
  });
  return mapEvent(eventId, tuple);
}

/** True if `player` is registered for `eventId`. */
export async function isRegisteredForEvent(
  chainId: HookosChainId,
  eventId: number,
  player: Address,
  options?: { signal?: AbortSignal }
): Promise<boolean> {
  const events = getEventsContract(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({
    address: events,
    abi: EVENTS_READ_ABI,
    functionName: 'isRegistered',
    args: [BigInt(eventId), player],
  });
}

/** Browses up to `limit` events, most-recent first. Skips entries whose read fails. */
export async function browseEvents(
  chainId: HookosChainId,
  limit: number,
  options?: { signal?: AbortSignal }
): Promise<HookosEvent[]> {
  const total = Number(await getEventCount(chainId, options));
  const take = Math.min(total, limit);
  const events: HookosEvent[] = [];

  for (let i = total - 1; i >= total - take; i--) {
    try {
      events.push(await getEvent(chainId, i, options));
    } catch {
      // Skip events whose on-chain read fails; the list stays best-effort.
    }
  }
  return events;
}
