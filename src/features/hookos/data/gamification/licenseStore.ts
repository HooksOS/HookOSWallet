/**
 * `useLicensesStore` — the HookOS hook-license list for a chain.
 *
 * Follows the `createQueryStore` shape from `data/protocol/arenaStore.ts`: reactive params,
 * `fetcher`, `staleTime`/`cacheTime`, and selector helpers. Reads are on-chain; the browse loop is
 * capped at `ONCHAIN_LICENSE_CAP` and the cap is logged when hit (per CLAUDE.md "no silent caps").
 */
import { time } from '@/framework/core/utils/time';
import { logger } from '@/logger';
import { createQueryStore } from '@/state/internal/createQueryStore';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from '../../core/chains';
import { type HookLicense } from '../../core/types';
import { browseLicenses, getLicenseCount } from './licenseReads';

const ONCHAIN_LICENSE_CAP = 50;

const STALE_TIME = time.seconds(30);
const CACHE_TIME = time.minutes(10);

type LicensesParams = {
  chainId: HookosChainId;
};

type LicensesData = {
  chainId: HookosChainId;
  licenses: HookLicense[];
};

type LicensesState = {
  /** `null` while the first fetch is in flight, otherwise the license list. */
  getLicenses: () => HookLicense[] | null;
  getLicense: (licenseId: number) => HookLicense | null;
};

export const useLicensesStore = createQueryStore<LicensesData, LicensesParams, LicensesState>(
  {
    fetcher: fetchLicenses,
    cacheTime: CACHE_TIME,
    params: {
      chainId: HOOKOS_CHAIN_IDS.base,
    },
    staleTime: STALE_TIME,
  },

  (_set, get) => ({
    getLicenses: () => get().getData()?.licenses ?? null,
    getLicense: licenseId => get().getData()?.licenses.find(l => l.licenseId === licenseId) ?? null,
  })
);

async function fetchLicenses({ chainId }: LicensesParams, abortController: AbortController | null): Promise<LicensesData> {
  const signal = abortController?.signal;
  const options = signal ? { signal } : undefined;

  const total = Number(await getLicenseCount(chainId, options));
  if (total > ONCHAIN_LICENSE_CAP) {
    logger.warn('[hookos/licenseStore]: capping on-chain license reads', { chainId, totalLicenses: total, cap: ONCHAIN_LICENSE_CAP });
  }

  const licenses = await browseLicenses(chainId, ONCHAIN_LICENSE_CAP, options);
  return { chainId, licenses };
}
