import { createPublicClient, http, type PublicClient } from 'viem';

import { RainbowError } from '@/logger';
import { backendNetworksActions } from '@/state/backendNetworks/backendNetworks';
import { type ChainId } from '@/state/backendNetworks/types';

import { HOOKOS_CHAINS, isHookosChainId } from './chains';

/**
 * Builds a viem public client for a HookOS chain (Base or MegaETH).
 *
 * Mirrors `createDelegationPublicClient` in `src/features/delegation/calls.ts`: it resolves the
 * chain object and RPC URL through the wallet's backend-networks registry when available, and
 * falls back to the HookOS-local chain definitions (so MegaETH works before it is added to the
 * remote network config).
 */
export function createHookosPublicClient(chainId: number, options?: { signal?: AbortSignal }): PublicClient {
  if (!isHookosChainId(chainId)) {
    throw new RainbowError(`[createHookosPublicClient]: Unsupported HookOS chain ${chainId}`);
  }

  const registeredChain = backendNetworksActions.getDefaultChains()[chainId as ChainId];
  const chain = registeredChain ?? HOOKOS_CHAINS[chainId];

  const rpcUrl = registeredChain
    ? backendNetworksActions.getChainDefaultRpc(chainId as ChainId)
    : chain.rpcUrls.default.http[0];

  return createPublicClient({
    chain,
    transport: http(rpcUrl, options?.signal ? { fetchOptions: { signal: options.signal } } : undefined),
  });
}
