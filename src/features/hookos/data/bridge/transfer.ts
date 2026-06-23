import { type Address, type Hex, encodeFunctionData, getAddress, pad } from 'viem';

import { RainbowError } from '@/logger';

import { getBridgeAddresses, HYPERLANE_DOMAINS, ZERO_ADDRESS } from '../../core/addresses';
import { INTERCHAIN_GAS_PAYMASTER_ABI, MAILBOX_ABI, WARP_ROUTE_ABI } from '../../core/bridgeAbis';
import { HOOKOS_CHAIN_IDS, type BridgeChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { type BridgeRoute } from '../../core/types';

/**
 * On-chain encoding + read helpers for the Hook-Bridge (Hyperlane) lane (Base <-> MegaETH).
 *
 * LIVE today: arbitrary messaging via the Mailbox (`encodeMailboxDispatch`, `quoteMailboxDispatch`).
 * NOT LIVE: warp token transfers and IGP gas quoting — the canonical HOOK warp route and the
 * InterchainGasPaymaster are not deployed (their addresses are `null` in `core/addresses.ts`).
 * Those helpers throw {@link BridgeNotLiveError} rather than building a broken transaction.
 *
 * These helpers ONLY build `{ to, data, value }` call objects. They never sign or send — execution
 * goes through the wallet's existing signer/RAP flow (see `CLAUDE.md` bridge flow).
 */

/** A call object the wallet's signer/RAP flow can execute. Never signed/sent here. */
export interface BridgeCall {
  to: Address;
  data: Hex;
  value: bigint;
}

/**
 * Thrown when a bridge capability is requested that is not deployed on the live lane yet
 * (warp token transfer, IGP gas quoting). Extends `RainbowError` for logger/Sentry integration.
 */
export class BridgeNotLiveError extends RainbowError {
  /** The capability that is not live, for typed branching in the UI. */
  readonly capability: 'warpTransfer' | 'igpGasQuote';

  constructor(capability: 'warpTransfer' | 'igpGasQuote', detail: string) {
    super(`[BridgeNotLive]: ${capability} is not live yet — ${detail}`);
    this.name = 'BridgeNotLiveError';
    this.capability = capability;
    Object.setPrototypeOf(this, BridgeNotLiveError.prototype);
  }
}

/** Left-pads a 20-byte EVM address to the 32-byte form Hyperlane expects for recipients. */
export function addressToBytes32(address: Address): Hex {
  return pad(getAddress(address), { size: 32 });
}

/* ------------------------------------------------------------------ */
/* Routes                                                             */
/* ------------------------------------------------------------------ */

/**
 * Returns the warp-route bridge routes for the live lane (Base <-> MegaETH), derived from the
 * address registry and Hyperlane domains.
 *
 * NOTE: the canonical HOOK warp route is not deployed (`warpFeeRecipient` is null on both chains),
 * so `warpRoute` is reported as `ZERO_ADDRESS`. The routes are still enumerated so the UI can render
 * the intended lane while `getBridgeRoutes()` consumers gate execution on liveness (see below).
 */
export function getBridgeRoutes(): BridgeRoute[] {
  const lane: Array<[BridgeChainId, BridgeChainId]> = [
    [HOOKOS_CHAIN_IDS.base, HOOKOS_CHAIN_IDS.megaeth],
    [HOOKOS_CHAIN_IDS.megaeth, HOOKOS_CHAIN_IDS.base],
  ];

  return lane.map(([origin, destination]) => ({
    origin,
    destination,
    warpRoute: getWarpRouteAddress(origin) ?? ZERO_ADDRESS,
    destinationDomain: HYPERLANE_DOMAINS[destination],
  }));
}

/** True when a warp token transfer can actually be built/executed on the given origin chain. */
export function isWarpTransferLive(origin: BridgeChainId): boolean {
  return getWarpRouteAddress(origin) !== null;
}

/* ------------------------------------------------------------------ */
/* IGP gas quote (NOT LIVE)                                           */
/* ------------------------------------------------------------------ */

/**
 * Quotes interchain gas payment via the IGP's `quoteGasPayment(destinationDomain, gasAmount)`.
 *
 * @throws {BridgeNotLiveError} Defensive guard for a chain whose `interchainGasPaymaster` is null in
 *   `core/addresses.ts`. The IGP is deployed on the live Base/MegaETH lane, so this read works there.
 */
export async function quoteBridgeGas(
  origin: BridgeChainId,
  destination: BridgeChainId,
  gasAmount: bigint,
  options?: { signal?: AbortSignal }
): Promise<bigint> {
  const igp = getBridgeAddresses(origin).interchainGasPaymaster;
  if (!igp) {
    throw new BridgeNotLiveError('igpGasQuote', `no InterchainGasPaymaster deployed on chain ${origin}`);
  }

  const client = createHookosPublicClient(origin, options);
  return client.readContract({
    address: igp,
    abi: INTERCHAIN_GAS_PAYMASTER_ABI,
    functionName: 'quoteGasPayment',
    args: [HYPERLANE_DOMAINS[destination], gasAmount],
  });
}

/* ------------------------------------------------------------------ */
/* Warp transfer encoding (NOT LIVE)                                  */
/* ------------------------------------------------------------------ */

export interface EncodeWarpTransferParams {
  origin: BridgeChainId;
  destination: BridgeChainId;
  /** Recipient on the destination chain (20-byte EVM address). */
  recipient: Address;
  /** Amount of token to bridge, in base units (wei). */
  amount: bigint;
  /** Native value to attach for mailbox dispatch + warp fees (e.g. from `quoteTransferRemote`). */
  feeValue?: bigint;
}

/**
 * Encodes a warp-route `transferRemote(destination, recipient, amount)` call.
 *
 * @throws {BridgeNotLiveError} The canonical HOOK warp route is not deployed
 *   (`warpFeeRecipient`/warp route address null in `core/addresses.ts`).
 */
export function encodeWarpTransfer(params: EncodeWarpTransferParams): BridgeCall {
  const warpRoute = getWarpRouteAddress(params.origin);
  if (!warpRoute) {
    throw new BridgeNotLiveError('warpTransfer', `no warp route deployed on chain ${params.origin}`);
  }

  const data = encodeFunctionData({
    abi: WARP_ROUTE_ABI,
    functionName: 'transferRemote',
    args: [HYPERLANE_DOMAINS[params.destination], addressToBytes32(params.recipient), params.amount],
  });

  return { to: warpRoute, data, value: params.feeValue ?? 0n };
}

/* ------------------------------------------------------------------ */
/* Mailbox dispatch encoding (LIVE)                                   */
/* ------------------------------------------------------------------ */

export interface EncodeMailboxDispatchParams {
  origin: BridgeChainId;
  destination: BridgeChainId;
  /** Message recipient contract on the destination chain (20-byte EVM address). */
  recipient: Address;
  /** Raw message body bytes. */
  messageBody: Hex;
  /** Native value to attach for dispatch (e.g. from `quoteMailboxDispatch`). */
  feeValue?: bigint;
}

/**
 * Encodes a Mailbox `dispatch(destinationDomain, recipientAddress, messageBody)` call.
 *
 * This is the LIVE bridge capability — arbitrary interchain messaging is deployed on both chains.
 */
export function encodeMailboxDispatch(params: EncodeMailboxDispatchParams): BridgeCall {
  const mailbox = getBridgeAddresses(params.origin).Mailbox;

  const data = encodeFunctionData({
    abi: MAILBOX_ABI,
    functionName: 'dispatch',
    args: [HYPERLANE_DOMAINS[params.destination], addressToBytes32(params.recipient), params.messageBody],
  });

  return { to: mailbox, data, value: params.feeValue ?? 0n };
}

/**
 * Quotes the native fee for a Mailbox dispatch via `quoteDispatch`. LIVE capability.
 */
export async function quoteMailboxDispatch(
  params: Omit<EncodeMailboxDispatchParams, 'feeValue'>,
  options?: { signal?: AbortSignal }
): Promise<bigint> {
  const mailbox = getBridgeAddresses(params.origin).Mailbox;
  const client = createHookosPublicClient(params.origin, options);
  return client.readContract({
    address: mailbox,
    abi: MAILBOX_ABI,
    functionName: 'quoteDispatch',
    args: [HYPERLANE_DOMAINS[params.destination], addressToBytes32(params.recipient), params.messageBody],
  });
}

/* ------------------------------------------------------------------ */
/* Internal                                                           */
/* ------------------------------------------------------------------ */

/**
 * Resolves the warp route address for an origin chain, or `null` when the canonical HOOK warp route
 * is not deployed. Liveness is keyed off `warpFeeRecipient` (the warp route registry entry that the
 * Hook-Bridge config leaves null until the canonical route ships).
 */
function getWarpRouteAddress(origin: BridgeChainId): Address | null {
  return getBridgeAddresses(origin).warpFeeRecipient;
}
