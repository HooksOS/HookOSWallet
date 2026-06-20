import { type Chain } from 'viem';
import { base, bsc, mainnet } from 'viem/chains';

/**
 * Chain IDs for the HookOS ecosystem.
 *
 * The HookOS Protocol is live on five chains. Ethereum (1), BNB (56) and Base (8453) are
 * first-class viem chains (and Base is already in the wallet's `src/state/backendNetworks`
 * registry). MegaETH (4326) and HyperEVM (999) are HookOS-specific and defined here.
 *
 * The cross-chain bridge (Hyperlane lane) only spans Base <-> MegaETH — see {@link BridgeChainId}.
 *
 * Keep these in sync with the canonical address files in the Protocol and Hook-Bridge repos.
 */
export const HOOKOS_CHAIN_IDS = {
  ethereum: mainnet.id, // 1
  bnb: bsc.id, // 56
  hyperevm: 999,
  megaeth: 4326,
  base: base.id, // 8453
} as const;

export type HookosChainId = (typeof HOOKOS_CHAIN_IDS)[keyof typeof HOOKOS_CHAIN_IDS];

/** Chains that participate in the Base <-> MegaETH Hyperlane bridge lane. */
export type BridgeChainId = typeof HOOKOS_CHAIN_IDS.base | typeof HOOKOS_CHAIN_IDS.megaeth;

const MEGAETH_RPC_URL = 'https://mainnet.megaeth.com/rpc';
const HYPEREVM_RPC_URL = 'https://rpc.hyperliquid.xyz/evm';

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

/**
 * HyperEVM mainnet (999) as a viem `Chain`. HyperEVM is not a first-class viem chain, so it is
 * hand-defined here (same approach as `megaeth`). RPC + explorer come from the Protocol's
 * canonical addresses.json (chain 999).
 */
export const hyperevm: Chain = {
  id: HOOKOS_CHAIN_IDS.hyperevm,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Hype', // TODO(verify): confirm HyperEVM mainnet native gas token name/symbol
    symbol: 'HYPE',
  },
  rpcUrls: {
    public: { http: [HYPEREVM_RPC_URL] },
    default: { http: [HYPEREVM_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid.xyz' },
  },
  testnet: false,
};

/** Chains that participate in the HookOS ecosystem, keyed by chainId. */
export const HOOKOS_CHAINS: Record<HookosChainId, Chain> = {
  [HOOKOS_CHAIN_IDS.ethereum]: mainnet,
  [HOOKOS_CHAIN_IDS.bnb]: bsc,
  [HOOKOS_CHAIN_IDS.hyperevm]: hyperevm,
  [HOOKOS_CHAIN_IDS.megaeth]: megaeth,
  [HOOKOS_CHAIN_IDS.base]: base,
};

export function isHookosChainId(chainId: number): chainId is HookosChainId {
  return Object.values(HOOKOS_CHAIN_IDS).includes(chainId as HookosChainId);
}

/** True when the chain is one of the two endpoints of the Hyperlane bridge lane. */
export function isBridgeChainId(chainId: number): chainId is BridgeChainId {
  return chainId === HOOKOS_CHAIN_IDS.base || chainId === HOOKOS_CHAIN_IDS.megaeth;
}
