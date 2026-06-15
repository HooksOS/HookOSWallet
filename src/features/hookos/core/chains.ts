import { type Chain } from 'viem';
import { base } from 'viem/chains';

/**
 * Chain IDs for the live HookOS lane.
 *
 * Base (8453) already exists in the wallet's chain registry (`src/state/backendNetworks`).
 * MegaETH (4326) is HookOS-specific and defined here. Keep these in sync with the canonical
 * address files in the Protocol and Hook-Bridge repos.
 */
export const HOOKOS_CHAIN_IDS = {
  base: base.id,
  megaeth: 4326,
} as const;

export type HookosChainId = (typeof HOOKOS_CHAIN_IDS)[keyof typeof HOOKOS_CHAIN_IDS];

const MEGAETH_RPC_URL = 'https://mainnet.megaeth.com/rpc';

/**
 * MegaETH mainnet (4326) as a viem `Chain`. Mirrors the shape of `chainAnvil` in
 * `src/state/backendNetworks/types.ts` so it can be registered through the same machinery.
 */
export const megaeth: Chain = {
  id: HOOKOS_CHAIN_IDS.megaeth,
  name: 'MegaETH',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [MEGAETH_RPC_URL] },
    default: { http: [MEGAETH_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'MegaExplorer', url: 'https://mega.etherscan.io' },
  },
  testnet: false,
};

/** Chains that participate in the HookOS ecosystem, keyed by chainId. */
export const HOOKOS_CHAINS: Record<HookosChainId, Chain> = {
  [HOOKOS_CHAIN_IDS.base]: base,
  [HOOKOS_CHAIN_IDS.megaeth]: megaeth,
};

export function isHookosChainId(chainId: number): chainId is HookosChainId {
  return chainId === HOOKOS_CHAIN_IDS.base || chainId === HOOKOS_CHAIN_IDS.megaeth;
}
