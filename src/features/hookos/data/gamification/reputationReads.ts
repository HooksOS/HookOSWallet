/**
 * Pure on-chain read functions for the HookOS ReputationSystem.
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with the tightly-scoped ABI in `core/gamificationAbis.ts`. Returns are mapped to the
 * shared domain types in `core/types.ts`. Failures (not deployed) throw a namespaced `RainbowError`.
 *
 * Read-method names/shapes mirror the ReputationSystem contract (`protocol/contracts/contracts/
 * gamification/ReputationSystem.sol`). Writes (registerReputation) intentionally live in the
 * wallet's signer/RAP path, not here.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { REPUTATION_READ_ABI } from '../../core/gamificationAbis';
import { HookosRank, type ReputationLeaderboardEntry, type ReputationProfile } from '../../core/types';

function assertDeployed(address: Address, chainId: HookosChainId): void {
  if (address === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/reputationReads]: ReputationSystem is not deployed on chain ${chainId}`);
  }
}

/** Coerces an on-chain `uint8` rank into the `HookosRank` enum, clamped to the valid range. */
function toRank(raw: number | bigint): HookosRank {
  const value = Number(raw);
  if (value <= HookosRank.Bronze) return HookosRank.Bronze;
  if (value >= HookosRank.Legend) return HookosRank.Legend;
  return value as HookosRank;
}

/** Reads the full reputation profile (score + rank + per-source breakdown) for `wallet`. */
export async function getReputationProfile(
  chainId: HookosChainId,
  wallet: Address,
  options?: { signal?: AbortSignal }
): Promise<ReputationProfile> {
  const { ReputationSystem } = getProtocolAddresses(chainId);
  assertDeployed(ReputationSystem, chainId);

  const client = createHookosPublicClient(chainId, options);
  const [data, rank] = await Promise.all([
    client.readContract({
      address: ReputationSystem,
      abi: REPUTATION_READ_ABI,
      functionName: 'getReputation',
      args: [wallet],
    }),
    client.readContract({
      address: ReputationSystem,
      abi: REPUTATION_READ_ABI,
      functionName: 'getRank',
      args: [wallet],
    }),
  ]);

  return {
    address: wallet,
    chainId,
    totalScore: data.totalScore,
    rank: toRank(rank),
    initialized: data.initialized,
    lastUpdated: Number(data.lastUpdated),
    breakdown: {
      trade: data.tradeScore,
      launch: data.launchScore,
      quest: data.questScore,
      clan: data.clanScore,
      referral: data.referralScore,
      creator: data.creatorScore,
      ambassador: data.ambassadorScore,
      governance: data.governanceScore,
      custom: data.customScore,
    },
  };
}

/** Reads the top `count` wallets on the reputation leaderboard. */
export async function getReputationLeaderboard(
  chainId: HookosChainId,
  count: number,
  options?: { signal?: AbortSignal }
): Promise<ReputationLeaderboardEntry[]> {
  const { ReputationSystem } = getProtocolAddresses(chainId);
  assertDeployed(ReputationSystem, chainId);

  const client = createHookosPublicClient(chainId, options);
  const [wallets, scores, ranks] = await client.readContract({
    address: ReputationSystem,
    abi: REPUTATION_READ_ABI,
    functionName: 'getLeaderboard',
    args: [BigInt(count)],
  });

  return wallets.map((address, i) => ({
    address,
    score: scores[i] ?? 0n,
    rank: toRank(ranks[i] ?? 0),
  }));
}

/** Total number of wallets that have a reputation record on `chainId`. */
export async function getTotalReputationUsers(
  chainId: HookosChainId,
  options?: { signal?: AbortSignal }
): Promise<bigint> {
  const { ReputationSystem } = getProtocolAddresses(chainId);
  assertDeployed(ReputationSystem, chainId);

  const client = createHookosPublicClient(chainId, options);
  return client.readContract({
    address: ReputationSystem,
    abi: REPUTATION_READ_ABI,
    functionName: 'getTotalUsers',
  });
}
