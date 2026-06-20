/**
 * Minimal, tightly-scoped viem ABIs for the HookOS protocol read paths.
 *
 * Source of truth (copied verbatim, do not invent signatures):
 *  - `protocol/sdk/src/abis/BondingCurve.ts`  (BondingCurveABI)
 *  - `protocol/sdk/src/abis/TokenFactory.ts`  (TokenFactoryABI)
 *  - `protocol/sdk/src/abis/HookRegistry.ts`  (HookRegistryABI)
 *
 * Only the fragments we actually read are kept here. Writes (buy/sell/createToken/
 * registerHook) intentionally live in the bridge/raps signing path, not in this data layer.
 */

/** BondingCurve read fragments: price / quotes / progress / market cap / curve state + counts. */
export const BONDING_CURVE_READ_ABI = [
  {
    name: 'getPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getBuyQuote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'ethAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'tokensOut', type: 'uint256' }],
  },
  {
    name: 'getSellQuote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'tokenAmount', type: 'uint256' },
    ],
    outputs: [{ name: 'ethOut', type: 'uint256' }],
  },
  {
    name: 'getProgress',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    // Returns basis points (0..10000), per `protocol/sdk/src/modules/trading.ts`.
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getMarketCap',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'graduationThresholdEth',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCurveCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'curves',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'token', type: 'address' },
      { name: 'creator', type: 'address' },
      { name: 'virtualTokenReserve', type: 'uint256' },
      { name: 'virtualEthReserve', type: 'uint256' },
      { name: 'tokensSold', type: 'uint256' },
      { name: 'ethCollected', type: 'uint256' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'graduated', type: 'bool' },
      { name: 'pool', type: 'address' },
      { name: 'createdAt', type: 'uint64' },
      { name: 'useExternal', type: 'bool' },
    ],
  },
] as const;

/** TokenFactory read fragments: count / per-index address / per-address info / launch fee. */
export const TOKEN_FACTORY_READ_ABI = [
  {
    name: 'getTokenCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'launchFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allTokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'tokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'creator', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'initialSupply', type: 'uint256' },
      { name: 'launchFee', type: 'uint256' },
      { name: 'createdAt', type: 'uint64' },
    ],
  },
] as const;

/** HookRegistry read fragments: count / per-index id / per-id info. */
export const HOOK_REGISTRY_READ_ABI = [
  {
    name: 'getHookCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'hookIds',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'hooks',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [
      { name: 'author', type: 'address' },
      { name: 'implementation', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'installs', type: 'uint256' },
      { name: 'totalRating', type: 'uint256' },
      { name: 'ratingCount', type: 'uint256' },
      { name: 'revenue', type: 'uint256' },
      { name: 'verified', type: 'bool' },
      { name: 'active', type: 'bool' },
      { name: 'createdAt', type: 'uint64' },
    ],
  },
] as const;

/**
 * FeeRouter read fragments: protocol fee split + lifetime distribution + per-recipient earnings.
 * `recipients(i)` is the public array getter; `recipientEarnings(addr)` the public mapping getter.
 * Source: `protocol/contracts/contracts/FeeRouter.sol`.
 */
export const FEE_ROUTER_READ_ABI = [
  {
    name: 'totalDistributed',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getRecipientCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getTotalShareBps',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'recipients',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'wallet', type: 'address' },
      { name: 'shareBps', type: 'uint256' },
      { name: 'label', type: 'string' },
    ],
  },
  {
    name: 'recipientEarnings',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * Arena read fragments: PvP token battles (pot split, status, winner).
 * `battles(id)` is the public mapping getter for the `Battle` struct.
 * Source: `protocol/contracts/contracts/gamification/Arena.sol`.
 */
export const ARENA_READ_ABI = [
  {
    name: 'battleCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'protocolFeeBps',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'battles',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'pot', type: 'uint256' },
      { name: 'teamAPot', type: 'uint256' },
      { name: 'teamBPot', type: 'uint256' },
      { name: 'minWager', type: 'uint256' },
      { name: 'maxWager', type: 'uint256' },
      { name: 'startTime', type: 'uint64' },
      { name: 'endTime', type: 'uint64' },
      { name: 'round', type: 'uint16' },
      { name: 'status', type: 'uint8' },
      { name: 'winner', type: 'uint8' },
      { name: 'wagerCount', type: 'uint256' },
    ],
  },
  {
    name: 'hasWagered',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

/**
 * Events read fragments: seasonal competitions (prize pool, entry fee, status).
 * `events(id)` is the public mapping getter for the `EventInfo` struct.
 * Source: `protocol/contracts/contracts/Events.sol`.
 */
export const EVENTS_READ_ABI = [
  {
    name: 'eventCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'currentSeason',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint16' }],
  },
  {
    name: 'events',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'prizePool', type: 'uint256' },
      { name: 'entryFee', type: 'uint256' },
      { name: 'maxPlayers', type: 'uint256' },
      { name: 'playerCount', type: 'uint256' },
      { name: 'startTime', type: 'uint64' },
      { name: 'endTime', type: 'uint64' },
      { name: 'season', type: 'uint16' },
      { name: 'status', type: 'uint8' },
    ],
  },
  {
    name: 'isRegistered',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;
