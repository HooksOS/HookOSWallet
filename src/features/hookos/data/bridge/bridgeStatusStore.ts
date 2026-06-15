import { time } from '@/framework/core/utils/time';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type BridgeStatus } from '../../core/types';

import { createInfuraClient, type InfuraChainStatus, type InfuraStatusResponse } from './infuraClient';

/**
 * Polls the Hook-Bridge (HookOS Infura) Status API (`/v1/status`) and exposes the lane health as a
 * normalized `BridgeStatus`. This is the live capability of the bridge today (messaging health);
 * warp token transfer / IGP gas quoting are not yet live (see `transfer.ts`).
 *
 * The UI agent imports `useBridgeStatusStore` and its selectors (`getStatus`, `isLaneHealthy`).
 */

const infuraClient = createInfuraClient();

const STALE_TIME = time.seconds(15);
const CACHE_TIME = time.minutes(5);

interface BridgeStatusState {
  /** Normalized latest lane health, or `null` before the first successful fetch. */
  getStatus: () => BridgeStatus | null;
  /** True when the lane and both chains are healthy. */
  isLaneHealthy: () => boolean;
}

export const useBridgeStatusStore = createQueryStore<BridgeStatus, Record<string, never>, BridgeStatusState>(
  {
    fetcher: (_params, abortController) => fetchBridgeStatus(abortController),
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getStatus: () => get().getData() ?? null,
    isLaneHealthy: () => Boolean(get().getData()?.healthy),
  })
);

async function fetchBridgeStatus(abortController: AbortController | null): Promise<BridgeStatus> {
  const res = await infuraClient.status(abortController ? { signal: abortController.signal } : undefined);
  return normalizeStatus(res);
}

/** Maps the raw `/v1/status` response onto the wallet's `BridgeStatus` domain type. */
function normalizeStatus(res: InfuraStatusResponse): BridgeStatus {
  const chains = [
    toChainEntry(HOOKOS_CHAIN_IDS.base, res.chains.base),
    toChainEntry(HOOKOS_CHAIN_IDS.megaeth, res.chains.megaeth),
  ];
  return {
    healthy: chains.every(c => c.healthy),
    chains,
  };
}

function toChainEntry(chainId: HookosChainId, status: InfuraChainStatus): BridgeStatus['chains'][number] {
  return {
    chainId,
    block: status.block ?? 0,
    healthy: status.healthy,
  };
}

/** Imperative selector: latest normalized lane health, or `null` before first fetch. */
export function getStatus(): BridgeStatus | null {
  return useBridgeStatusStore.getState().getStatus();
}

/** Imperative selector: true when the lane and both chains are healthy. */
export function isLaneHealthy(): boolean {
  return useBridgeStatusStore.getState().isLaneHealthy();
}
