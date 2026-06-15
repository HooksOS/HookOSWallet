import { type Address } from 'viem';

import { type HookosChainId } from './chains';

/** A token launched on the HookOS protocol (bonding-curve or graduated). */
export interface HookToken {
  address: Address;
  chainId: HookosChainId;
  name: string;
  symbol: string;
  creator: Address;
  imageUrl?: string;
  /** Bonding-curve progress toward graduation, 0..1. */
  progress: number;
  graduated: boolean;
  /** Spot price in native (ETH), as a decimal string. */
  priceEth?: string;
  marketCapEth?: string;
}

/** A quote for buying/selling a token on its bonding curve. */
export interface BondingCurveQuote {
  token: Address;
  /** Input amount (wei) — ETH for buy, tokens for sell. */
  amountIn: bigint;
  /** Expected output amount (wei). */
  amountOut: bigint;
  /** Protocol + creator fee taken, in wei. */
  feeWei: bigint;
}

/** A registered hook in the HookRegistry. */
export interface HookEntry {
  hookId: string;
  address: Address;
  name: string;
  developer: Address;
  verified: boolean;
  feeBps: number;
}

/** A cross-chain bridge route exposed by Hook-Bridge (HookOS Infura). */
export interface BridgeRoute {
  origin: HookosChainId;
  destination: HookosChainId;
  /** Warp route / collateral contract on the origin chain. */
  warpRoute: Address;
  /** Hyperlane domain id of the destination (equals chainId for these chains). */
  destinationDomain: number;
}

/** Live health snapshot from the Infura status API (`/v1/status`). */
export interface BridgeStatus {
  healthy: boolean;
  chains: Array<{
    chainId: HookosChainId;
    block: number;
    healthy: boolean;
  }>;
}
