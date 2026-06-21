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

/** Arena battle lifecycle status — mirrors the `Arena` enum `{ Open, Active, Settled, Cancelled }`. */
export enum BattleStatus {
  Open = 0,
  Active = 1,
  Settled = 2,
  Cancelled = 3,
}

/** Which side of a battle — mirrors the `Arena` enum `{ TeamA, TeamB }`. */
export enum BattleSide {
  TeamA = 0,
  TeamB = 1,
}

/** A PvP token battle from the HookOS `Arena` contract. */
export interface Battle {
  battleId: number;
  tokenA: Address;
  tokenB: Address;
  /** Total pot in wei. */
  pot: bigint;
  teamAPot: bigint;
  teamBPot: bigint;
  minWager: bigint;
  /** 0 = no max. */
  maxWager: bigint;
  startTime: number;
  endTime: number;
  round: number;
  status: BattleStatus;
  /** Only meaningful once `status` is `Settled`. */
  winner: BattleSide;
  wagerCount: number;
}

/** Event lifecycle status — mirrors the `Events` enum `{ Upcoming, Live, Ended, Cancelled }`. */
export enum HookosEventStatus {
  Upcoming = 0,
  Live = 1,
  Ended = 2,
  Cancelled = 3,
}

/** A seasonal competition from the HookOS `Events` contract. */
export interface HookosEvent {
  eventId: number;
  name: string;
  category: string;
  metadataURI: string;
  /** Prize pool in wei. */
  prizePool: bigint;
  entryFee: bigint;
  /** 0 = unlimited. */
  maxPlayers: number;
  playerCount: number;
  startTime: number;
  endTime: number;
  season: number;
  status: HookosEventStatus;
}

/**
 * Quest category — mirrors the `QuestSystem` Solidity enum
 * `{ Trading, Launch, HookInstall, Referral, Content, Clan, Campaign, Daily, Weekly }` (0..8).
 */
export enum QuestType {
  Trading = 0,
  Launch = 1,
  HookInstall = 2,
  Referral = 3,
  Content = 4,
  Clan = 5,
  Campaign = 6,
  Daily = 7,
  Weekly = 8,
}

/** A quest from the HookOS `QuestSystem` contract (shape mirrors `getQuest(uint256)`). */
export interface HookosQuest {
  questId: number;
  name: string;
  description: string;
  questType: QuestType;
  /** XP reward (raw on-chain units). */
  xpReward: bigint;
  /** ETH reward in wei (0 when none). */
  ethReward: bigint;
  targetProgress: number;
  /** 0 = unlimited completions. */
  maxCompletions: number;
  completions: number;
  startsAt: number;
  endsAt: number;
  active: boolean;
  sponsored: boolean;
}

/** A wallet's progress on a single quest (shape mirrors `getQuestProgress(uint256,address)`). */
export interface QuestProgress {
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  completedAt: number;
}

/**
 * Clan membership rank — mirrors the `ClanSystem` Solidity enum
 * `{ None, Member, Officer, Leader }` (0..3).
 */
export enum ClanRank {
  None = 0,
  Member = 1,
  Officer = 2,
  Leader = 3,
}

/** A clan/guild from the HookOS `ClanSystem` contract (shape mirrors `getClanInfo(uint256)`). */
export interface HookosClan {
  clanId: number;
  name: string;
  tag: string;
  description: string;
  logoURI: string;
  leader: Address;
  memberCount: number;
  officerCount: number;
  /** Clan treasury balance in wei. */
  treasuryBalance: bigint;
  /** Lifetime trade volume in wei. */
  totalVolume: bigint;
  totalLaunches: number;
  /** Aggregate clan XP (raw on-chain units). */
  totalXP: bigint;
  active: boolean;
}

/** The connected wallet's clan membership (shape mirrors `getMemberInfo(address)`). */
export interface ClanMembership {
  inClan: boolean;
  clanId: number;
  rank: ClanRank;
}

/** A LaunchWars season (shape mirrors `getSeasonInfo(uint256)`). */
export interface LaunchWarsSeason {
  seasonId: number;
  name: string;
  startsAt: number;
  endsAt: number;
  /** Prize pool in wei. */
  prizePool: bigint;
  settled: boolean;
  tokenCount: number;
}

/** A single token entry on a LaunchWars leaderboard (token + composite score + place). */
export interface LaunchWarsLeaderboardEntry {
  token: Address;
  score: bigint;
  /** 1-indexed place on the leaderboard. */
  rank: number;
}

/** A token's full LaunchWars entry (shape mirrors the `LaunchEntry` struct). */
export interface LaunchWarsEntry {
  token: Address;
  creator: Address;
  /** Trade volume in wei. */
  volume: bigint;
  /** Total value locked in wei. */
  tvl: bigint;
  holders: number;
  hookCount: number;
  /** Social score (raw on-chain units). */
  socialScore: bigint;
  /** Weighted composite score (raw on-chain units). */
  compositeScore: bigint;
  /** On-chain rank (0 until the season is scored). */
  rank: number;
  registered: boolean;
}

/** A BattlePass season (shape mirrors `getSeasonInfo(uint256)`). */
export interface BattlePassSeason {
  seasonId: number;
  startTime: number;
  endTime: number;
  maxTiers: number;
  /** Pro Pass price in wei. */
  proPassPrice: bigint;
  totalParticipants: number;
  /** Total XP distributed this season (raw on-chain units). */
  totalXPDistributed: bigint;
  /** Total prize pool in wei. */
  totalPrizePool: bigint;
  active: boolean;
}

/** The connected wallet's BattlePass progress for the current season. */
export interface BattlePassProgress {
  /** False when the wallet has not minted a pass for the season. */
  hasPass: boolean;
  passId: number;
  tier: number;
  /** Total XP earned (raw on-chain units). */
  xp: bigint;
  isPro: boolean;
  /** XP required to reach the next tier (equals `xpCurrent` when maxed). */
  xpNeeded: bigint;
  /** Current XP toward the next tier. */
  xpCurrent: bigint;
  currentStreak: number;
  longestStreak: number;
  /** Daily-streak multiplier in basis points (100 = 1x). */
  multiplierBps: number;
}

/**
 * Hook-license type — mirrors the `HookLicenseNFT` Solidity enum
 * `{ Perpetual, LimitedEdition, Subscription }` (0..2).
 */
export enum HookLicenseType {
  Perpetual = 0,
  LimitedEdition = 1,
  Subscription = 2,
}

/** A hook license offered via `HookLicenseNFT` (shape mirrors `getLicense(uint256)`). */
export interface HookLicense {
  licenseId: number;
  /** The licensed hook's id (uint256 — kept as bigint to avoid precision loss). */
  hookId: bigint;
  creator: Address;
  name: string;
  licenseType: HookLicenseType;
  /** Mint price in wei. */
  price: bigint;
  /** 0 = unlimited supply. */
  maxSupply: number;
  totalMinted: number;
  /** Subscription length in seconds (0 for non-subscription licenses). */
  subscriptionDuration: number;
  /** Creator royalty in basis points (0..10000). */
  royaltyBps: number;
  active: boolean;
}

/** A wallet's HookStaking position (shape mirrors `getStake(address)`). */
export interface HookStakePosition {
  /** HOOK tokens currently staked (wei, 18 decimals). */
  staked: bigint;
  /** Unclaimed ETH rewards in wei. */
  pending: bigint;
  /** HOOK tokens currently unbonding (wei). */
  unbonding: bigint;
  /** Unix seconds when unbonding completes (0 when none). */
  unlockTime: number;
  /** Unix seconds of the first stake (0 when never staked). */
  stakedAt: number;
  /** Unix seconds of the last reward claim. */
  lastClaim: number;
}

/** Aggregate HookStaking pool stats for a chain. */
export interface HookStakingPool {
  /** Total HOOK staked across all users (wei). */
  totalStaked: bigint;
  /** Estimated APR in basis points (100 = 1%). */
  aprBps: number;
  /** Lifetime ETH distributed to stakers (wei). */
  totalDistributed: bigint;
  /** ERC-20 HOOK staking-token address. */
  stakingToken: Address;
  /** Minimum stake amount (wei). */
  minimumStake: bigint;
  /** Unbonding period in seconds. */
  unbondingPeriod: number;
}

/** A liquidity-position NFT from `HookOSNFT` (shape mirrors `LPPositionData`). */
export interface HookLpPosition {
  tokenId: number;
  pool: Address;
  token0: Address;
  token1: Address;
  /** Liquidity amount (raw on-chain units). */
  liquidity: bigint;
  /** Unix seconds the position was deposited. */
  depositedAt: number;
}

/** An achievement-badge NFT from `HookOSNFT` (shape mirrors `AchievementData`). */
export interface HookAchievement {
  tokenId: number;
  name: string;
  category: string;
  /** Unix seconds the badge was earned. */
  earnedAt: number;
}

/** A wallet's full HookOS NFT collection: LP positions + achievement badges. */
export interface HookosNftCollection {
  lpPositions: HookLpPosition[];
  achievements: HookAchievement[];
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
