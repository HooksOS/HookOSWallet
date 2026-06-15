import { time } from '@/framework/core/utils/time';
import { logger, RainbowError } from '@/logger';

import { getHookosInfuraApiKey, getHookosInfuraBaseUrl } from './config';

/**
 * Zero-dependency typed REST client for the Hook-Bridge (HookOS Infura) Status API.
 *
 * Mirrors the real `@hookos/infura-sdk` (`Hook-Bridge/hookos-infura/sdk/src/index.ts`): uses the
 * global `fetch`, sends the `x-hookos-infura-key` auth header, and retries 429/5xx/network errors
 * with exponential backoff (honoring `Retry-After`) under an `AbortSignal.timeout`.
 *
 * Only the live Status surface is implemented here — `status()`, `fees()`, `routes()`, `agents()`.
 * The launchpad Data API and realtime stream from the upstream SDK are out of scope for this layer.
 */

/* ------------------------------------------------------------------ */
/* Response & param types (mirrored from the SDK's types.ts)          */
/* ------------------------------------------------------------------ */

/** A 0x-prefixed EVM address. */
export type HexAddress = `0x${string}`;

/** Supported chain handles in the HookOS interchain lane (Base 8453 <-> MegaETH 4326). */
export type InfuraChainName = 'base' | 'megaeth';

/** A wei/eth balance pair, or `null` when the contract isn't deployed yet. */
export interface InfuraBalance {
  wei: string;
  eth: string;
}

export interface InfuraChainStatus {
  chainId: number | null;
  block: number | null;
  healthy: boolean;
  error?: string;
}

/** `/v1/status` response. */
export interface InfuraStatusResponse {
  lane: string;
  chains: {
    base: InfuraChainStatus;
    megaeth: InfuraChainStatus;
  };
}

/** FeeRouter totals for one chain (from `/v1/fees`). */
export interface InfuraChainFees {
  feeRouter: HexAddress;
  totalDistributed?: string;
  totalDistributedEth?: string;
  totalShareBps?: number;
  error?: string;
}

/** `/v1/fees` response: per-chain FeeRouter totals. */
export interface InfuraFeesResponse {
  base: InfuraChainFees;
  megaeth: InfuraChainFees;
}

/** Per-chain warp route / IGP wiring (from `/v1/routes`). */
export interface InfuraChainRoutes {
  mailbox: HexAddress | null;
  igp: HexAddress | null;
  igpBalance: InfuraBalance | null;
  warpNativeCollateral: HexAddress | null;
  warpNativeLocked: InfuraBalance | null;
}

/** `/v1/routes` response. */
export interface InfuraRoutesResponse {
  base: InfuraChainRoutes;
  megaeth: InfuraChainRoutes;
}

export interface InfuraAgentMetrics {
  configured: boolean;
  up?: boolean;
  status?: number;
  latestCheckpoint?: number | null;
  messagesProcessed?: number | null;
  error?: string;
}

/** `/v1/agents` response. */
export interface InfuraAgentsResponse {
  validator: InfuraAgentMetrics;
  relayer: InfuraAgentMetrics;
  relayerAddress: HexAddress | null;
  relayerBalances: {
    base: InfuraBalance | null;
    megaeth: InfuraBalance | null;
  };
}

/* ------------------------------------------------------------------ */
/* Error                                                              */
/* ------------------------------------------------------------------ */

/**
 * Thrown for any non-2xx Status API response (after retries are exhausted) and for network/timeout
 * failures. Extends `RainbowError` so it integrates with the wallet's logger/Sentry pipeline, while
 * exposing `status`/`body`/`url` like the upstream `HookOSInfuraError` so callers can branch.
 */
export class HookosInfuraError extends RainbowError {
  /** HTTP status code, or 0 for network/timeout errors before a response. */
  readonly status: number;
  /** Parsed JSON body, raw text, or undefined. */
  readonly body: unknown;
  /** The request URL that failed. */
  readonly url: string;

  constructor(args: { message: string; status: number; body?: unknown; url: string; cause?: unknown }) {
    super(args.message, args.cause);
    this.name = 'HookosInfuraError';
    this.status = args.status;
    this.body = args.body;
    this.url = args.url;
    Object.setPrototypeOf(this, HookosInfuraError.prototype);
  }

  /** True for transient statuses worth retrying (429, 5xx) or network errors. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

/* ------------------------------------------------------------------ */
/* Config & client                                                    */
/* ------------------------------------------------------------------ */

export interface InfuraClientConfig {
  /** Base URL of the Status API. Defaults to the env/`config.ts` value. */
  baseUrl?: string;
  /** API key sent as `x-hookos-infura-key`. Defaults to the env value (may be undefined). */
  apiKey?: string;
  /** Per-request timeout in ms. Default 15s. */
  timeoutMs?: number;
  /** Max retry attempts on 429/5xx/network errors. Default 3. */
  maxRetries?: number;
  /** Base backoff delay in ms (exponential, full jitter). Default 300. */
  retryBaseDelayMs?: number;
  /** Maximum backoff delay cap in ms. Default 10s. */
  retryMaxDelayMs?: number;
  /** Custom fetch implementation (e.g. for tests). Defaults to global fetch. */
  fetch?: typeof fetch;
}

interface RequestOptions {
  /** Overrides the client default timeout for this request. */
  timeoutMs?: number;
  /** Caller-supplied abort signal; combined with the internal timeout signal. */
  signal?: AbortSignal;
}

const RETRYABLE_STATUS = (s: number): boolean => s === 429 || s >= 500;

export interface InfuraClient {
  readonly baseUrl: string;
  /** Lane + per-chain health (`/v1/status`). */
  status(opts?: RequestOptions): Promise<InfuraStatusResponse>;
  /** Live per-chain FeeRouter totals (`/v1/fees`). */
  fees(opts?: RequestOptions): Promise<InfuraFeesResponse>;
  /** Warp routes / IGP wiring per chain (`/v1/routes`). */
  routes(opts?: RequestOptions): Promise<InfuraRoutesResponse>;
  /** Validator/relayer health + relayer balances (`/v1/agents`). */
  agents(opts?: RequestOptions): Promise<InfuraAgentsResponse>;
}

class HookosInfuraClient implements InfuraClient {
  readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;
  private readonly retryMaxDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: InfuraClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? getHookosInfuraBaseUrl()).replace(/\/+$/, '');
    this.apiKey = config.apiKey ?? getHookosInfuraApiKey();
    this.timeoutMs = config.timeoutMs ?? time.seconds(15);
    this.maxRetries = config.maxRetries ?? 3;
    this.retryBaseDelayMs = config.retryBaseDelayMs ?? 300;
    this.retryMaxDelayMs = config.retryMaxDelayMs ?? time.seconds(10);

    const f = config.fetch ?? globalThis.fetch;
    if (typeof f !== 'function') {
      throw new RainbowError('[HookosInfuraClient]: global `fetch` is unavailable; pass a `fetch` implementation.');
    }
    this.fetchImpl = f.bind(globalThis);
  }

  status(opts?: RequestOptions): Promise<InfuraStatusResponse> {
    return this.request<InfuraStatusResponse>('/v1/status', opts);
  }

  fees(opts?: RequestOptions): Promise<InfuraFeesResponse> {
    return this.request<InfuraFeesResponse>('/v1/fees', opts);
  }

  routes(opts?: RequestOptions): Promise<InfuraRoutesResponse> {
    return this.request<InfuraRoutesResponse>('/v1/routes', opts);
  }

  agents(opts?: RequestOptions): Promise<InfuraAgentsResponse> {
    return this.request<InfuraAgentsResponse>('/v1/agents', opts);
  }

  /* ---------------------------- HTTP core ---------------------------- */

  private async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = this.baseUrl + path;
    const headers: Record<string, string> = { accept: 'application/json' };
    if (this.apiKey) headers['x-hookos-infura-key'] = this.apiKey;

    let lastError: HookosInfuraError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const timeoutMs = opts.timeoutMs ?? this.timeoutMs;
      const signal = combineSignals(opts.signal, timeoutMs);

      let res: Response;
      try {
        res = await this.fetchImpl(url, { method: 'GET', headers, signal });
      } catch (cause) {
        // Honor an explicit, non-timeout abort from the caller immediately.
        if (opts.signal?.aborted) {
          throw new HookosInfuraError({ message: `[HookosInfuraClient]: aborted by caller for GET ${path}`, status: 0, url, cause });
        }
        lastError = new HookosInfuraError({
          message: `[HookosInfuraClient]: network error for GET ${path}: ${(cause as Error)?.message ?? String(cause)}`,
          status: 0,
          url,
          cause,
        });
        if (attempt < this.maxRetries) {
          await sleep(this.backoffDelay(attempt));
          continue;
        }
        logger.error(lastError);
        throw lastError;
      }

      if (res.ok) {
        return (await parseBody(res)) as T;
      }

      const body = await parseBody(res);
      lastError = new HookosInfuraError({
        message: `[HookosInfuraClient]: ${res.status} ${res.statusText} for GET ${path}`,
        status: res.status,
        body,
        url,
      });

      if (RETRYABLE_STATUS(res.status) && attempt < this.maxRetries) {
        const retryAfter = parseRetryAfter(res.headers.get('retry-after'));
        await sleep(retryAfter ?? this.backoffDelay(attempt));
        continue;
      }

      logger.error(lastError);
      throw lastError;
    }

    // Unreachable in practice — the loop always returns or throws.
    throw lastError ?? new HookosInfuraError({ message: `[HookosInfuraClient]: request failed for GET ${path}`, status: 0, url });
  }

  /** Exponential backoff with full jitter, capped at retryMaxDelayMs. */
  private backoffDelay(attempt: number): number {
    const exp = this.retryBaseDelayMs * 2 ** attempt;
    const capped = Math.min(exp, this.retryMaxDelayMs);
    return Math.floor(Math.random() * capped);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  const type = res.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/** Combine a caller signal with a fresh timeout signal. */
function combineSignals(caller: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!caller) return timeout;
  if (typeof (AbortSignal as { any?: unknown }).any === 'function') {
    return (AbortSignal as unknown as { any(signals: AbortSignal[]): AbortSignal }).any([caller, timeout]);
  }
  const controller = new AbortController();
  const onAbort = (reason: unknown): void => controller.abort(reason);
  if (caller.aborted) controller.abort(caller.reason);
  else caller.addEventListener('abort', () => onAbort(caller.reason), { once: true });
  timeout.addEventListener('abort', () => onAbort(timeout.reason), { once: true });
  return controller.signal;
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* Factory                                                            */
/* ------------------------------------------------------------------ */

/** Creates a Hook-Bridge (HookOS Infura) Status API client. */
export function createInfuraClient(config: InfuraClientConfig = {}): InfuraClient {
  return new HookosInfuraClient(config);
}

export default createInfuraClient;
