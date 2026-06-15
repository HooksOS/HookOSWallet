/**
 * HookOS data-layer configuration.
 *
 * Resolves the optional HookOS indexer/data HTTP API base URL. We follow the wallet's
 * `react-native-dotenv` convention (see `src/env.ts`), but this var is optional and carries no
 * secret, so its declaration is not added to `globals.d.ts`. We read it defensively from the
 * dotenv module namespace and fall back to the public default.
 */
import * as dotenv from 'react-native-dotenv';

/** Public HookOS data API. Override with the `HOOKOS_DATA_API_BASE_URL` env var. */
const DEFAULT_HOOKOS_DATA_API_BASE_URL = 'https://api.hookos.fun';

function resolveBaseUrl(): string | undefined {
  // `HOOKOS_DATA_API_BASE_URL` is not declared in the dotenv typings; read it defensively.
  const fromEnv = (dotenv as Record<string, string | undefined>).HOOKOS_DATA_API_BASE_URL;
  const value = (fromEnv ?? DEFAULT_HOOKOS_DATA_API_BASE_URL).trim();
  return value.length ? value.replace(/\/+$/, '') : undefined;
}

/**
 * Base URL for the HookOS indexer/data API, or `undefined` if explicitly disabled (empty env).
 * When undefined, stores fall back to on-chain reads.
 */
export const HOOKOS_DATA_API_BASE_URL: string | undefined = resolveBaseUrl();

/** Whether an HTTP data API is configured (and on-chain fallback can be skipped first). */
export const HAS_HOOKOS_DATA_API: boolean = HOOKOS_DATA_API_BASE_URL !== undefined;
