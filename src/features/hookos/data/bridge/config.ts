import { HOOKOS_INFURA_API_BASE_URL, HOOKOS_INFURA_API_KEY } from 'react-native-dotenv';

/**
 * Resolves Hook-Bridge (HookOS Infura) Status API configuration from the environment, using the
 * same `react-native-dotenv` pattern as `src/env.ts`. No secrets are hardcoded here.
 *
 * - `HOOKOS_INFURA_API_BASE_URL` — defaults to the public Infura API origin.
 * - `HOOKOS_INFURA_API_KEY` — optional; the Status routes (`/v1/status`, `/v1/fees`, `/v1/routes`,
 *   `/v1/agents`) require the `x-hookos-infura-key` header when the server has keys configured.
 */
export const HOOKOS_INFURA_DEFAULT_BASE_URL = 'https://infura-api.hookos.fun';

export function getHookosInfuraBaseUrl(): string {
  const fromEnv = (HOOKOS_INFURA_API_BASE_URL ?? '').trim();
  return fromEnv || HOOKOS_INFURA_DEFAULT_BASE_URL;
}

export function getHookosInfuraApiKey(): string | undefined {
  const fromEnv = (HOOKOS_INFURA_API_KEY ?? '').trim();
  return fromEnv || undefined;
}
