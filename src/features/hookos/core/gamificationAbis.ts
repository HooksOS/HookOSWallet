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
