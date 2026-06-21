/**
 * Pure on-chain read functions for the HookOS NFT collection (HookOSNFT).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with the tightly-scoped ABI in `core/gamificationAbis.ts`. Returns are mapped to the
 * shared domain types in `core/types.ts`. Failures (not deployed) throw a namespaced `RainbowError`.
 *
 * Read-method names/shapes mirror the HookOSNFT contract (`protocol/contracts/contracts/
 * gamification/HookOSNFT.sol`). Mints (LP positions, achievements) intentionally live in the
 * wallet's signer/RAP path, not here.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { HOOKOS_NFT_READ_ABI } from '../../core/gamificationAbis';
import { type HookAchievement, type HookLpPosition, type HookosNftCollection } from '../../core/types';

/** Resolves the HookOSNFT address for `chainId`, throwing if it is not deployed there. */
function getHookosNft(chainId: HookosChainId): Address {
  const { HookOSNFT } = getProtocolAddresses(chainId);
  if (HookOSNFT === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/nftReads]: HookOSNFT is not deployed on chain ${chainId}`);
  }
  return HookOSNFT;
}

/** Reads the LP-position NFTs held by `owner`. */
export async function getLpPositions(
  chainId: HookosChainId,
  owner: Address,
  options?: { signal?: AbortSignal }
): Promise<HookLpPosition[]> {
  const address = getHookosNft(chainId);

  const client = createHookosPublicClient(chainId, options);
  const [tokenIds, positions] = await client.readContract({
    address,
    abi: HOOKOS_NFT_READ_ABI,
    functionName: 'getLPPositions',
    args: [owner],
  });

  return positions.map((p, i) => ({
    tokenId: Number(tokenIds[i] ?? 0n),
    pool: p.pool,
    token0: p.token0,
    token1: p.token1,
    liquidity: p.liquidity,
    depositedAt: Number(p.depositedAt),
  })) as HookLpPosition[];
}

/** Reads the achievement (badge) NFTs held by `owner`. */
export async function getAchievements(
  chainId: HookosChainId,
  owner: Address,
  options?: { signal?: AbortSignal }
): Promise<HookAchievement[]> {
  const address = getHookosNft(chainId);

  const client = createHookosPublicClient(chainId, options);
  const [tokenIds, badges] = await client.readContract({
    address,
    abi: HOOKOS_NFT_READ_ABI,
    functionName: 'getAchievements',
    args: [owner],
  });

  return badges.map((b, i) => ({
    tokenId: Number(tokenIds[i] ?? 0n),
    name: b.name,
    category: b.category,
    earnedAt: Number(b.earnedAt),
  })) as HookAchievement[];
}

/** Reads the full HookOS NFT collection (LP positions + achievements) held by `owner`. */
export async function getNftCollection(
  chainId: HookosChainId,
  owner: Address,
  options?: { signal?: AbortSignal }
): Promise<HookosNftCollection> {
  const [lpPositions, achievements] = await Promise.all([
    getLpPositions(chainId, owner, options),
    getAchievements(chainId, owner, options),
  ]);

  return { lpPositions, achievements };
}
