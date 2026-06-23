/**
 * Pure on-chain read functions for the HookOS protocol (BondingCurve + TokenFactory).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with the tightly-scoped ABIs in `core/protocolAbis.ts`. Returns are mapped to the
 * shared domain types in `core/types.ts`. Failures (not deployed, zero address) throw a
 * `RainbowError` with a clear, namespaced message.
 *
 * Read-method names/shapes mirror the protocol SDK (`protocol/sdk/src/modules/{trading,tokens}.ts`).
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { type HookosChainId } from '../../core/chains';
import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { createHookosPublicClient } from '../../core/client';
import { BONDING_CURVE_READ_ABI, TOKEN_FACTORY_READ_ABI } from '../../core/protocolAbis';
import { type BondingCurveQuote } from '../../core/types';

/**
 * `BondingCurve.getProgress` returns PERCENT (0..100) — `(ethCollected * 100) / threshold`, and
 * exactly 100 once graduated (BondingCurve.sol:372-377). Divide by 100 to normalize to 0..1.
 * (The protocol SDK's `trading.ts` docstring says 0..10000, but it's stale — the contract wins.)
 */
const PROGRESS_PERCENT_MAX = 100;

function assertDeployed(address: Address, contractName: string, chainId: HookosChainId): void {
  if (address === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/protocolReads]: ${contractName} is not deployed on chain ${chainId}`);
  }
}

function assertTokenAddress(token: Address, chainId: HookosChainId): void {
  if (token === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/protocolReads]: Invalid zero token address on chain ${chainId}`);
  }
}

/** Total number of tokens created via the TokenFactory on `chainId`. */
export async function getTokenCount(chainId: HookosChainId): Promise<bigint> {
  const { TokenFactory } = getProtocolAddresses(chainId);
  assertDeployed(TokenFactory, 'TokenFactory', chainId);

  const client = createHookosPublicClient(chainId);
  return client.readContract({
    address: TokenFactory,
    abi: TOKEN_FACTORY_READ_ABI,
    functionName: 'getTokenCount',
  });
}

/** Spot price of `token` on its bonding curve, in wei per token. */
export async function getBondingCurvePrice(chainId: HookosChainId, token: Address): Promise<bigint> {
  const { BondingCurve } = getProtocolAddresses(chainId);
  assertDeployed(BondingCurve, 'BondingCurve', chainId);
  assertTokenAddress(token, chainId);

  const client = createHookosPublicClient(chainId);
  return client.readContract({
    address: BondingCurve,
    abi: BONDING_CURVE_READ_ABI,
    functionName: 'getPrice',
    args: [token],
  });
}

/**
 * Buy quote: tokens received for `ethIn` wei.
 *
 * NOTE: the on-chain `getBuyQuote` returns only the output token amount; the curve does not break
 * out fees in its view function, so `feeWei` is reported as `0n` here.
 */
export async function getBuyQuote(chainId: HookosChainId, token: Address, ethIn: bigint): Promise<BondingCurveQuote> {
  const { BondingCurve } = getProtocolAddresses(chainId);
  assertDeployed(BondingCurve, 'BondingCurve', chainId);
  assertTokenAddress(token, chainId);

  const client = createHookosPublicClient(chainId);
  const tokensOut = await client.readContract({
    address: BondingCurve,
    abi: BONDING_CURVE_READ_ABI,
    functionName: 'getBuyQuote',
    args: [token, ethIn],
  });

  return { token, amountIn: ethIn, amountOut: tokensOut, feeWei: 0n };
}

/**
 * Sell quote: wei received for `tokensIn` tokens.
 *
 * NOTE: as with the buy quote, the on-chain `getSellQuote` does not expose fees; `feeWei` is `0n`.
 */
export async function getSellQuote(chainId: HookosChainId, token: Address, tokensIn: bigint): Promise<BondingCurveQuote> {
  const { BondingCurve } = getProtocolAddresses(chainId);
  assertDeployed(BondingCurve, 'BondingCurve', chainId);
  assertTokenAddress(token, chainId);

  const client = createHookosPublicClient(chainId);
  const ethOut = await client.readContract({
    address: BondingCurve,
    abi: BONDING_CURVE_READ_ABI,
    functionName: 'getSellQuote',
    args: [token, tokensIn],
  });

  return { token, amountIn: tokensIn, amountOut: ethOut, feeWei: 0n };
}

/** Bonding-curve progress toward graduation for `token`, normalized to 0..1. */
export async function getCurveProgress(chainId: HookosChainId, token: Address): Promise<number> {
  const { BondingCurve } = getProtocolAddresses(chainId);
  assertDeployed(BondingCurve, 'BondingCurve', chainId);
  assertTokenAddress(token, chainId);

  const client = createHookosPublicClient(chainId);
  const progressPercent = await client.readContract({
    address: BondingCurve,
    abi: BONDING_CURVE_READ_ABI,
    functionName: 'getProgress',
    args: [token],
  });

  const progress = Number(progressPercent) / PROGRESS_PERCENT_MAX;
  // Clamp defensively in case the curve over-reports near/after graduation.
  return Math.min(1, Math.max(0, progress));
}
