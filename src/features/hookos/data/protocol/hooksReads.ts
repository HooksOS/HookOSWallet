/**
 * Pure on-chain read functions for the HookOS HookRegistry (the hooks marketplace).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with the tightly-scoped `HOOK_REGISTRY_READ_ABI` in `core/protocolAbis.ts`. Returns are
 * mapped to the shared `HookEntry` type in `core/types.ts`. Failures throw a namespaced `RainbowError`.
 *
 * The registry has no batch list method, so `browseHooks` loops `getHookCount` -> `hookIds(i)` ->
 * `hooks(id)`. Writes (registerHook/attach/detach) intentionally live in the wallet's signer/RAP path.
 */
import { type Hex } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { HOOK_REGISTRY_READ_ABI } from '../../core/protocolAbis';
import { type HookEntry } from '../../core/types';

function getRegistry(chainId: HookosChainId) {
  const { HookRegistry } = getProtocolAddresses(chainId);
  if (HookRegistry === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/hooksReads]: HookRegistry is not deployed on chain ${chainId}`);
  }
  return HookRegistry;
}

/** Total number of hooks registered on `chainId`. */
export async function getHookCount(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<bigint> {
  const registry = getRegistry(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({
    address: registry,
    abi: HOOK_REGISTRY_READ_ABI,
    functionName: 'getHookCount',
  });
}

/** Reads a single hook by its bytes32 id. Returns `null` if the entry is empty (zero author). */
export async function getHook(
  chainId: HookosChainId,
  hookId: Hex,
  options?: { signal?: AbortSignal }
): Promise<HookEntry | null> {
  const registry = getRegistry(chainId);
  const client = createHookosPublicClient(chainId, options);
  const info = await client.readContract({
    address: registry,
    abi: HOOK_REGISTRY_READ_ABI,
    functionName: 'hooks',
    args: [hookId],
  });
  return mapHook(hookId, info);
}

type HookInfoTuple = readonly [
  author: `0x${string}`,
  implementation: `0x${string}`,
  name: string,
  category: string,
  metadataURI: string,
  installs: bigint,
  totalRating: bigint,
  ratingCount: bigint,
  revenue: bigint,
  verified: boolean,
  active: boolean,
  createdAt: bigint,
];

function mapHook(hookId: Hex, info: HookInfoTuple): HookEntry | null {
  const [author, implementation, name, category, metadataURI, installs, totalRating, ratingCount, , verified, active, createdAt] =
    info;
  if (author === ZERO_ADDRESS) return null;

  const ratings = Number(ratingCount);
  return {
    hookId,
    author,
    implementation,
    name,
    category,
    metadataURI,
    installs: Number(installs),
    averageRating: ratings > 0 ? Number(totalRating) / ratings : 0,
    ratingCount: ratings,
    verified,
    active,
    createdAt: Number(createdAt),
  };
}

/**
 * Browses up to `limit` registered hooks, most-recently-registered first. Skips entries with failed
 * reads. The caller is responsible for choosing a bounded `limit` (and logging when it caps).
 */
export async function browseHooks(
  chainId: HookosChainId,
  limit: number,
  options?: { signal?: AbortSignal }
): Promise<HookEntry[]> {
  const registry = getRegistry(chainId);
  const client = createHookosPublicClient(chainId, options);

  const totalCount = await client.readContract({
    address: registry,
    abi: HOOK_REGISTRY_READ_ABI,
    functionName: 'getHookCount',
  });

  const total = Number(totalCount);
  const take = Math.min(total, limit);
  const hooks: HookEntry[] = [];

  for (let i = total - 1; i >= total - take; i--) {
    try {
      const hookId = await client.readContract({
        address: registry,
        abi: HOOK_REGISTRY_READ_ABI,
        functionName: 'hookIds',
        args: [BigInt(i)],
      });
      const hook = await getHook(chainId, hookId, options);
      if (hook) hooks.push(hook);
    } catch {
      // Skip hooks whose on-chain read fails; the list stays best-effort.
    }
  }

  return hooks;
}
