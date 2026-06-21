/**
 * Pure on-chain read functions for the HookOS HookStaking contract.
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with the tightly-scoped ABI in `core/gamificationAbis.ts`. Returns are mapped to the
 * shared domain types in `core/types.ts`. Failures (not deployed) throw a namespaced `RainbowError`.
 *
 * Read-method names/shapes mirror the HookStaking contract (`protocol/contracts/contracts/
 * staking/HookStaking.sol`). Writes (stake/unstake/claim) intentionally live in the wallet's
 * signer/RAP path, not here.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { STAKING_READ_ABI } from '../../core/gamificationAbis';
import { type HookStakePosition, type HookStakingPool } from '../../core/types';

/** Resolves the HookStaking address for `chainId`, throwing if the contract is not deployed there. */
function getHookStaking(chainId: HookosChainId): Address {
  const { HookStaking } = getProtocolAddresses(chainId);
  if (HookStaking === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/stakingReads]: HookStaking is not deployed on chain ${chainId}`);
  }
  return HookStaking;
}

/** Reads `wallet`'s staking position (staked + pending rewards + unbonding state). */
export async function getStakePosition(
  chainId: HookosChainId,
  wallet: Address,
  options?: { signal?: AbortSignal }
): Promise<HookStakePosition> {
  const HookStaking = getHookStaking(chainId);

  const client = createHookosPublicClient(chainId, options);
  // viem returns the multi-output `getStake` view as a positional tuple, not a named object.
  const [staked, pending, unbonding, unlockTime, stakedAt, lastClaim] = await client.readContract({
    address: HookStaking,
    abi: STAKING_READ_ABI,
    functionName: 'getStake',
    args: [wallet],
  });

  return {
    staked,
    pending,
    unbonding,
    unlockTime: Number(unlockTime),
    stakedAt: Number(stakedAt),
    lastClaim: Number(lastClaim),
  };
}

/** Reads the pool-wide staking stats (total staked, APR, lifetime distributed, config). */
export async function getStakingPool(
  chainId: HookosChainId,
  options?: { signal?: AbortSignal }
): Promise<HookStakingPool> {
  const HookStaking = getHookStaking(chainId);

  const client = createHookosPublicClient(chainId, options);
  const [totalStaked, apr, totalDistributed, stakingToken, minimumStake, unbondingPeriod] = await Promise.all([
    client.readContract({
      address: HookStaking,
      abi: STAKING_READ_ABI,
      functionName: 'getTotalStaked',
    }),
    client.readContract({
      address: HookStaking,
      abi: STAKING_READ_ABI,
      functionName: 'getAPR',
    }),
    client.readContract({
      address: HookStaking,
      abi: STAKING_READ_ABI,
      functionName: 'totalDistributed',
    }),
    client.readContract({
      address: HookStaking,
      abi: STAKING_READ_ABI,
      functionName: 'stakingToken',
    }),
    client.readContract({
      address: HookStaking,
      abi: STAKING_READ_ABI,
      functionName: 'minimumStake',
    }),
    client.readContract({
      address: HookStaking,
      abi: STAKING_READ_ABI,
      functionName: 'unbondingPeriod',
    }),
  ]);

  return {
    totalStaked,
    aprBps: Number(apr),
    totalDistributed,
    stakingToken,
    minimumStake,
    unbondingPeriod: Number(unbondingPeriod),
  };
}
