import { type Address, type Hex } from 'viem';

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

/** A registered hook in the HookRegistry (shape mirrors `hooks(bytes32)`). */
export interface HookEntry {
  /** bytes32 hook id, as a hex string. */
  hookId: Hex;
  author: Address;
  implementation: Address;
  name: string;
  category: string;
  metadataURI: string;
  /** Number of times this hook has been installed/attached. */
  installs: number;
  /** Average rating (raw on-chain scale), 0 when unrated. */
  averageRating: number;
  ratingCount: number;
  verified: boolean;
  active: boolean;
  /** Unix seconds of registration. */
  createdAt: number;
}

/**
 * On-chain reputation rank — mirrors the `ReputationSystem` Solidity enum
 * `{ Bronze, Silver, Gold, Diamond, Legend }` (0..4).
 */
export enum HookosRank {
  Bronze = 0,
  Silver = 1,
  Gold = 2,
  Diamond = 3,
  Legend = 4,
}

/** Per-source reputation score breakdown (all in raw on-chain units). */
export interface ReputationBreakdown {
  trade: bigint;
  launch: bigint;
  quest: bigint;
  clan: bigint;
  referral: bigint;
  creator: bigint;
  ambassador: bigint;
  governance: bigint;
  custom: bigint;
}

/** A wallet's reputation profile from the HookOS `ReputationSystem` contract. */
export interface ReputationProfile {
  address: Address;
  chainId: HookosChainId;
  totalScore: bigint;
  rank: HookosRank;
  /** False until the wallet has any reputation recorded on-chain. */
  initialized: boolean;
  /** Unix seconds of the last on-chain update (0 when uninitialized). */
  lastUpdated: number;
  breakdown: ReputationBreakdown;
}

/** A single entry on the reputation leaderboard. */
export interface ReputationLeaderboardEntry {
  address: Address;
  score: bigint;
  rank: HookosRank;
}

/** A single fee recipient in the FeeRouter split. */
export interface FeeShare {
  wallet: Address;
  /** Share in basis points (0..10000). */
  shareBps: number;
  label: string;
}

/** Aggregate FeeRouter state for a chain. */
export interface FeeOverview {
  /** Lifetime ETH distributed through the router, in wei. */
  totalDistributed: bigint;
  /** Sum of all recipient shares, in basis points. */
  totalShareBps: number;
  recipientCount: number;
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
