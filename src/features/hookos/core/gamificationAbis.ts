/**
 * Minimal, tightly-scoped viem ABIs for the HookOS gamification / growth layer read paths.
 *
 * Source of truth (copied verbatim, do not invent signatures):
 *  - `protocol/indexer/abis/ReputationSystem.ts` (ReputationSystemABI)
 *
 * Only the read fragments we actually call are kept here. Writes (registerReputation et al.)
 * intentionally live in the wallet's signer/RAP path, not in this data layer.
 */

/**
 * ReputationSystem read fragments: per-wallet score + rank + source breakdown, and the leaderboard.
 *
 * `Rank` is the on-chain enum `{ Bronze, Silver, Gold, Diamond, Legend }` (0..4).
 * `getReputation` returns the full `ReputationData` tuple (total + nine per-source scores +
 * `lastUpdated` + `initialized`).
 */
export const REPUTATION_READ_ABI = [
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'totalScore', type: 'uint256' },
          { name: 'tradeScore', type: 'uint256' },
          { name: 'launchScore', type: 'uint256' },
          { name: 'questScore', type: 'uint256' },
          { name: 'clanScore', type: 'uint256' },
          { name: 'referralScore', type: 'uint256' },
          { name: 'creatorScore', type: 'uint256' },
          { name: 'ambassadorScore', type: 'uint256' },
          { name: 'governanceScore', type: 'uint256' },
          { name: 'customScore', type: 'uint256' },
          { name: 'lastUpdated', type: 'uint64' },
          { name: 'initialized', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'getScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getRank',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'getLeaderboard',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'count', type: 'uint256' }],
    outputs: [
      { name: 'wallets', type: 'address[]' },
      { name: 'scores', type: 'uint256[]' },
      { name: 'ranks', type: 'uint8[]' },
    ],
  },
  {
    name: 'getTotalUsers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * QuestSystem read fragments: quest list (via `getActiveQuests` -> `getQuest`) + per-wallet progress.
 *
 * `getQuest` is the explicit view (NOT the public `quests` auto-getter, which omits the `sponsor`
 * field); its 12-tuple has no nested dynamic members so it is viem-safe. `questType` is the enum
 * `{ Trading, Launch, HookInstall, Referral, Content, Clan, Campaign, Daily, Weekly }` (0..8).
 */
export const QUEST_READ_ABI = [
  {
    name: 'getQuestCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getActiveQuests',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getQuest',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'questId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'questType', type: 'uint8' },
      { name: 'xpReward', type: 'uint256' },
      { name: 'ethReward', type: 'uint256' },
      { name: 'targetProgress', type: 'uint256' },
      { name: 'maxCompletions', type: 'uint256' },
      { name: 'completions', type: 'uint256' },
      { name: 'startsAt', type: 'uint64' },
      { name: 'endsAt', type: 'uint64' },
      { name: 'active', type: 'bool' },
      { name: 'sponsored', type: 'bool' },
    ],
  },
  {
    name: 'getQuestProgress',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'questId', type: 'uint256' },
      { name: 'wallet', type: 'address' },
    ],
    outputs: [
      { name: 'progress', type: 'uint256' },
      { name: 'target', type: 'uint256' },
      { name: 'completed', type: 'bool' },
      { name: 'claimed', type: 'bool' },
      { name: 'completedAt', type: 'uint64' },
    ],
  },
] as const;

/**
 * ClanSystem read fragments: leaderboard + per-clan info + the connected wallet's membership.
 *
 * `getClanInfo` is the explicit view (the public `clans` auto-getter omits the dynamic `string`
 * members, so it is NOT viem-safe). `rank` is the enum `{ None, Member, Officer, Leader }` (0..3).
 * Note `getClanInfo` omits the struct's `createdAt` field — it is not returned by the view.
 */
export const CLAN_READ_ABI = [
  {
    name: 'clanCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getLeaderboard',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'count', type: 'uint256' }],
    outputs: [
      { name: 'clanIds', type: 'uint256[]' },
      { name: 'volumes', type: 'uint256[]' },
    ],
  },
  {
    name: 'getClanInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'clanId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'tag', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'logoURI', type: 'string' },
      { name: 'leader', type: 'address' },
      { name: 'memberCount', type: 'uint256' },
      { name: 'officerCount', type: 'uint256' },
      { name: 'treasuryBalance', type: 'uint256' },
      { name: 'totalVolume', type: 'uint256' },
      { name: 'totalLaunches', type: 'uint256' },
      { name: 'totalXP', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
  },
  {
    name: 'getMemberInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'member', type: 'address' }],
    outputs: [
      { name: 'inClan', type: 'bool' },
      { name: 'clanId', type: 'uint256' },
      { name: 'rank', type: 'uint8' },
    ],
  },
] as const;

/**
 * LaunchWars read fragments: current season pointer + season info + token leaderboard + entry.
 *
 * `getSeasonInfo` is the explicit view (a 6-tuple that omits the season's weight fields).
 * `getLaunchEntry` returns the full `LaunchEntry` struct as a single tuple (all static members).
 */
export const LAUNCHWARS_READ_ABI = [
  {
    name: 'currentSeasonId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getSeasonInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'seasonId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'startsAt', type: 'uint64' },
      { name: 'endsAt', type: 'uint64' },
      { name: 'prizePool', type: 'uint256' },
      { name: 'settled', type: 'bool' },
      { name: 'tokenCount', type: 'uint256' },
    ],
  },
  {
    name: 'getSeasonLeaderboard',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'seasonId', type: 'uint256' },
      { name: 'count', type: 'uint256' },
    ],
    outputs: [
      { name: 'tokens', type: 'address[]' },
      { name: 'scores', type: 'uint256[]' },
    ],
  },
  {
    name: 'getLaunchEntry',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'seasonId', type: 'uint256' },
      { name: 'tokenAddress', type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'tokenAddress', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'volume', type: 'uint256' },
          { name: 'tvl', type: 'uint256' },
          { name: 'holders', type: 'uint256' },
          { name: 'hookCount', type: 'uint256' },
          { name: 'socialScore', type: 'uint256' },
          { name: 'compositeScore', type: 'uint256' },
          { name: 'rank', type: 'uint256' },
          { name: 'registered', type: 'bool' },
        ],
      },
    ],
  },
] as const;

/**
 * BattlePass read fragments: current season pointer + season info + the connected wallet's
 * pass/progress/streak. All return static/encodable types (the array-returning reward getters are
 * intentionally excluded). `getSeasonInfo` is an 8-tuple; `getStreak` returns a computed multiplier.
 */
export const BATTLEPASS_READ_ABI = [
  {
    name: 'currentSeasonId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getSeasonInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'seasonId', type: 'uint256' }],
    outputs: [
      { name: 'startTime', type: 'uint64' },
      { name: 'endTime', type: 'uint64' },
      { name: 'maxTiers', type: 'uint256' },
      { name: 'proPassPrice', type: 'uint256' },
      { name: 'totalParticipants', type: 'uint256' },
      { name: 'totalXPDistributed', type: 'uint256' },
      { name: 'totalPrizePool', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
  },
  {
    name: 'getUserPass',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'seasonId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getPassInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'passId', type: 'uint256' }],
    outputs: [
      { name: 'seasonId', type: 'uint256' },
      { name: 'tier', type: 'uint256' },
      { name: 'xp', type: 'uint256' },
      { name: 'isPro', type: 'bool' },
      { name: 'owner', type: 'address' },
    ],
  },
  {
    name: 'getXPForNextTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'passId', type: 'uint256' }],
    outputs: [
      { name: 'needed', type: 'uint256' },
      { name: 'current', type: 'uint256' },
    ],
  },
  {
    name: 'getStreak',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'currentStreak', type: 'uint256' },
      { name: 'longestStreak', type: 'uint256' },
      { name: 'multiplierBps', type: 'uint256' },
    ],
  },
] as const;

/**
 * HookStaking read fragments: a wallet's position (`getStake`) + pool stats.
 *
 * The staking token is the ERC-20 HOOK token (18 decimals); rewards are paid in native ETH (wei).
 * `getStake` is the explicit view (it computes live `pending`, unlike the `stakes` auto-getter).
 * All fragments return static/encodable types.
 */
export const STAKING_READ_ABI = [
  {
    name: 'getStake',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'staked', type: 'uint256' },
      { name: 'pending', type: 'uint256' },
      { name: 'unbonding', type: 'uint256' },
      { name: 'unlockTime', type: 'uint256' },
      { name: 'stakedAt', type: 'uint64' },
      { name: 'lastClaim', type: 'uint64' },
    ],
  },
  {
    name: 'getTotalStaked',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getAPR',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'aprBps', type: 'uint256' }],
  },
  {
    name: 'totalDistributed',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'stakingToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'minimumStake',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'unbondingPeriod',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * HookOSNFT read fragments: a wallet's LP-position NFTs and achievement badges.
 *
 * Both convenience getters return parallel arrays `(uint256[] tokenIds, Struct[] data)`. The
 * structs are viem-decodable `tuple[]` (LPPositionData is all static; AchievementData has two
 * `string` members — dynamic but encodable). Counters are exposed for pool-wide totals.
 */
export const HOOKOS_NFT_READ_ABI = [
  {
    name: 'getLPPositions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner_', type: 'address' }],
    outputs: [
      { name: 'tokenIds', type: 'uint256[]' },
      {
        name: 'positions',
        type: 'tuple[]',
        components: [
          { name: 'pool', type: 'address' },
          { name: 'token0', type: 'address' },
          { name: 'token1', type: 'address' },
          { name: 'liquidity', type: 'uint256' },
          { name: 'depositedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getAchievements',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner_', type: 'address' }],
    outputs: [
      { name: 'tokenIds', type: 'uint256[]' },
      {
        name: 'badges',
        type: 'tuple[]',
        components: [
          { name: 'name', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'earnedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalLPPositions',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalAchievements',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * HookLicenseNFT read fragments: license list (`licenseCount` -> `getLicense`) + per-wallet validity.
 *
 * `getLicense` is the explicit 10-output view (viem returns it as a positional tuple). `licenseType`
 * is the enum `{ Perpetual, LimitedEdition, Subscription }` (0..2). `hasValidLicense` checks whether a
 * wallet owns any unexpired license for a given hook id.
 */
export const LICENSE_READ_ABI = [
  {
    name: 'licenseCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getLicense',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'licenseId', type: 'uint256' }],
    outputs: [
      { name: 'hookId', type: 'uint256' },
      { name: 'creator', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'licenseType', type: 'uint8' },
      { name: 'price', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'totalMinted', type: 'uint256' },
      { name: 'subscriptionDuration', type: 'uint256' },
      { name: 'royaltyBps', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
  },
  {
    name: 'hasValidLicense',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'hookId', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;
