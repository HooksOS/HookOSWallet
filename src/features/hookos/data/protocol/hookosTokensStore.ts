/**
 * `useHookosTokensStore` — the canonical list of HookOS protocol tokens for a chain.
 *
 * Follows the `createQueryStore` shape from `src/state/claimables/airdropsStore.ts`:
 * reactive `$` params, `fetcher`, `staleTime`/`cacheTime`, and selector helpers on the store.
 *
 * Fetch strategy:
 *  1. If a HookOS data API base URL is configured (`config.ts`), fetch the token list over HTTP.
 *  2. Otherwise (or on HTTP failure), fall back to on-chain reads: TokenFactory token count +
 *     per-token info + bonding-curve progress. On-chain reads are capped at `ONCHAIN_TOKEN_CAP`
 *     to bound work; the cap is logged (per CLAUDE.md "no silent caps").
 */
import { type Address } from 'viem';

import { time } from '@/framework/core/utils/time';
import { logger, RainbowError } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { createHookosPublicClient } from '../../core/client';
import { BONDING_CURVE_READ_ABI, TOKEN_FACTORY_READ_ABI } from '../../core/protocolAbis';
import { type HookToken } from '../../core/types';
import { HAS_HOOKOS_DATA_API, HOOKOS_DATA_API_BASE_URL } from './config';

/** Hard cap on per-token on-chain reads in the fallback path, to bound work. */
const ONCHAIN_TOKEN_CAP = 25;
/** Progress is reported on-chain in basis points (0..10000); normalize to 0..1. */
const PROGRESS_BASIS_POINTS = 10_000;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);
const HTTP_TIMEOUT = time.seconds(15);

type HookosTokensParams = {
  chainId: HookosChainId;
};

type HookosTokensData = {
  chainId: HookosChainId;
  tokens: HookToken[];
};

type HookosTokensState = {
  /** Returns `null` while the first fetch is in flight (loading), otherwise the token list. */
  getTokens: () => HookToken[] | null;
  getToken: (address: Address) => HookToken | null;
};

/** Raw token shape returned by the HookOS data API (defensive — fields may be absent). */
type HookosApiToken = {
  address?: string;
  chainId?: number;
  name?: string;
  symbol?: string;
  creator?: string;
  imageUrl?: string;
  image_url?: string;
  progress?: number;
  graduated?: boolean;
  priceEth?: string;
  price_eth?: string;
  marketCapEth?: string;
  market_cap_eth?: string;
};

type HookosApiResponse = {
  tokens?: HookosApiToken[];
  data?: HookosApiToken[];
};

export const useHookosTokensStore = createQueryStore<HookosTokensData, HookosTokensParams, HookosTokensState>(
  {
    fetcher: fetchHookosTokens,
    cacheTime: CACHE_TIME,
    params: {
      // Plain default param. Callers re-target a chain via `useHookosTokensStore.getState().fetch({ chainId })`.
      // Kept as a static param (not a reactive `$` subscription) since chain selection is driven by the UI,
      // not by another store. See `airdropsStore`'s `page`/`pageSize` for the same static-param pattern.
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getTokens: () => get().getData()?.tokens ?? null,

    getToken: address => {
      const tokens = get().getData()?.tokens;
      if (!tokens?.length) return null;
      const target = address.toLowerCase();
      return tokens.find(token => token.address.toLowerCase() === target) ?? null;
    },
  })
);

async function fetchHookosTokens(
  { chainId }: HookosTokensParams,
  abortController: AbortController | null
): Promise<HookosTokensData> {
  if (HAS_HOOKOS_DATA_API) {
    try {
      const tokens = await fetchTokensFromApi(chainId, abortController?.signal);
      return { chainId, tokens };
    } catch (error) {
      logger.warn('[hookos/tokensStore]: HTTP fetch failed, falling back to on-chain reads', {
        chainId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const tokens = await fetchTokensOnChain(chainId, abortController?.signal);
  return { chainId, tokens };
}

async function fetchTokensFromApi(chainId: HookosChainId, signal?: AbortSignal): Promise<HookToken[]> {
  if (!HOOKOS_DATA_API_BASE_URL) {
    throw new RainbowError('[hookos/tokensStore]: HOOKOS_DATA_API_BASE_URL is undefined');
  }

  const url = `${HOOKOS_DATA_API_BASE_URL}/v1/tokens?chainId=${chainId}`;
  const response = await fetchWithTimeout(url, signal);

  if (!response.ok) {
    throw new RainbowError(`[hookos/tokensStore]: data API responded ${response.status} for chain ${chainId}`);
  }

  const json = (await response.json()) as HookosApiResponse;
  const rawTokens = json.tokens ?? json.data ?? [];
  return rawTokens
    .map(raw => mapApiToken(raw, chainId))
    .filter((token): token is HookToken => token !== null);
}

function mapApiToken(raw: HookosApiToken, chainId: HookosChainId): HookToken | null {
  const address = raw.address as Address | undefined;
  if (!address || address === ZERO_ADDRESS) return null;

  return {
    address,
    chainId: (raw.chainId as HookosChainId | undefined) ?? chainId,
    name: raw.name ?? '',
    symbol: raw.symbol ?? '',
    creator: (raw.creator as Address | undefined) ?? ZERO_ADDRESS,
    imageUrl: raw.imageUrl ?? raw.image_url,
    progress: clampProgress(raw.progress ?? 0),
    graduated: raw.graduated ?? false,
    priceEth: raw.priceEth ?? raw.price_eth,
    marketCapEth: raw.marketCapEth ?? raw.market_cap_eth,
  };
}

async function fetchTokensOnChain(chainId: HookosChainId, signal?: AbortSignal): Promise<HookToken[]> {
  const { TokenFactory, BondingCurve } = getProtocolAddresses(chainId);
  if (TokenFactory === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/tokensStore]: TokenFactory not deployed on chain ${chainId}`);
  }

  const client = createHookosPublicClient(chainId, signal ? { signal } : undefined);

  const totalCount = await client.readContract({
    address: TokenFactory,
    abi: TOKEN_FACTORY_READ_ABI,
    functionName: 'getTokenCount',
  });

  const total = Number(totalCount);
  const limit = Math.min(total, ONCHAIN_TOKEN_CAP);
  if (total > ONCHAIN_TOKEN_CAP) {
    logger.warn('[hookos/tokensStore]: capping on-chain token reads', {
      chainId,
      totalTokens: total,
      cap: ONCHAIN_TOKEN_CAP,
    });
  }

  const curveDeployed = BondingCurve !== ZERO_ADDRESS;
  const tokens: HookToken[] = [];

  // Read most-recently-launched tokens first (highest indices).
  for (let i = total - 1; i >= total - limit; i--) {
    try {
      const tokenAddress = await client.readContract({
        address: TokenFactory,
        abi: TOKEN_FACTORY_READ_ABI,
        functionName: 'allTokens',
        args: [BigInt(i)],
      });
      if (tokenAddress === ZERO_ADDRESS) continue;

      const token = await readOnChainToken(client, chainId, tokenAddress, curveDeployed);
      if (token) tokens.push(token);
    } catch (error) {
      logger.warn('[hookos/tokensStore]: skipping token with failed on-chain read', {
        chainId,
        index: i,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return tokens;
}

async function readOnChainToken(
  client: ReturnType<typeof createHookosPublicClient>,
  chainId: HookosChainId,
  tokenAddress: Address,
  curveDeployed: boolean
): Promise<HookToken | null> {
  const { TokenFactory, BondingCurve } = getProtocolAddresses(chainId);

  const info = await client.readContract({
    address: TokenFactory,
    abi: TOKEN_FACTORY_READ_ABI,
    functionName: 'tokens',
    args: [tokenAddress],
  });
  const [addr, creator, name, symbol] = info;
  if (addr === ZERO_ADDRESS) return null;

  let progress = 0;
  let graduated = false;
  if (curveDeployed) {
    try {
      const curve = await client.readContract({
        address: BondingCurve,
        abi: BONDING_CURVE_READ_ABI,
        functionName: 'curves',
        args: [tokenAddress],
      });
      // curves: [token, creator, vTokenReserve, vEthReserve, tokensSold, ethCollected, totalSupply, graduated, ...]
      graduated = curve[7];

      const progressBps = await client.readContract({
        address: BondingCurve,
        abi: BONDING_CURVE_READ_ABI,
        functionName: 'getProgress',
        args: [tokenAddress],
      });
      progress = clampProgress(Number(progressBps) / PROGRESS_BASIS_POINTS);
    } catch {
      // No curve for this token (e.g. external/graduated) — leave defaults.
    }
  }

  return {
    address: addr,
    chainId,
    name,
    symbol,
    creator,
    progress,
    graduated,
  };
}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  try {
    return await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
  } finally {
    clearTimeout(timeoutId);
  }
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
