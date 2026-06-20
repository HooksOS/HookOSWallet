/**
 * Pure on-chain read functions for the HookOS FeeRouter (protocol fee split + distribution).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `FEE_ROUTER_READ_ABI` in `core/protocolAbis.ts`. Failures throw a namespaced
 * `RainbowError`. Writes (`distribute`) intentionally live in the wallet's signer/RAP path.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { FEE_ROUTER_READ_ABI } from '../../core/protocolAbis';
import { type FeeOverview, type FeeShare } from '../../core/types';

function getRouter(chainId: HookosChainId): Address {
  const { FeeRouter } = getProtocolAddresses(chainId);
  if (FeeRouter === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/feesReads]: FeeRouter is not deployed on chain ${chainId}`);
  }
  return FeeRouter;
}

/** Aggregate router state: lifetime distributed, total share bps, recipient count. */
export async function getFeeOverview(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<FeeOverview> {
  const router = getRouter(chainId);
  const client = createHookosPublicClient(chainId, options);

  const [totalDistributed, totalShareBps, recipientCount] = await Promise.all([
    client.readContract({ address: router, abi: FEE_ROUTER_READ_ABI, functionName: 'totalDistributed' }),
    client.readContract({ address: router, abi: FEE_ROUTER_READ_ABI, functionName: 'getTotalShareBps' }),
    client.readContract({ address: router, abi: FEE_ROUTER_READ_ABI, functionName: 'getRecipientCount' }),
  ]);

  return {
    totalDistributed,
    totalShareBps: Number(totalShareBps),
    recipientCount: Number(recipientCount),
  };
}

/** The full ordered list of fee recipients (wallet, share, label). */
export async function getFeeShares(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<FeeShare[]> {
  const router = getRouter(chainId);
  const client = createHookosPublicClient(chainId, options);

  const count = Number(
    await client.readContract({ address: router, abi: FEE_ROUTER_READ_ABI, functionName: 'getRecipientCount' })
  );

  const shares: FeeShare[] = [];
  for (let i = 0; i < count; i++) {
    const [wallet, shareBps, label] = await client.readContract({
      address: router,
      abi: FEE_ROUTER_READ_ABI,
      functionName: 'recipients',
      args: [BigInt(i)],
    });
    shares.push({ wallet, shareBps: Number(shareBps), label });
  }
  return shares;
}

/** Lifetime earnings (wei) pushed to a specific recipient wallet. */
export async function getRecipientEarnings(
  chainId: HookosChainId,
  wallet: Address,
  options?: { signal?: AbortSignal }
): Promise<bigint> {
  const router = getRouter(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({
    address: router,
    abi: FEE_ROUTER_READ_ABI,
    functionName: 'recipientEarnings',
    args: [wallet],
  });
}
