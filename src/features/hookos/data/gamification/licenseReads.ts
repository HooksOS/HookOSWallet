/**
 * Pure on-chain read functions for the HookOS HookLicenseNFT contract (hook licenses).
 *
 * Each function builds a viem public client via `createHookosPublicClient(chainId)` and calls the
 * contract with `LICENSE_READ_ABI` in `core/gamificationAbis.ts`. Failures throw a namespaced
 * `RainbowError`. `getLicense` returns a positional tuple (10 outputs) which `mapLicense` projects
 * onto a `HookLicense`, so `browseLicenses` walks the id range newest-first. Writes (mint) live in
 * the wallet's signer/RAP path.
 */
import { type Address } from 'viem';

import { RainbowError } from '@/logger';

import { getProtocolAddresses, ZERO_ADDRESS } from '../../core/addresses';
import { type HookosChainId } from '../../core/chains';
import { createHookosPublicClient } from '../../core/client';
import { LICENSE_READ_ABI } from '../../core/gamificationAbis';
import { type HookLicense, HookLicenseType } from '../../core/types';

function getLicenseNft(chainId: HookosChainId): Address {
  const { HookLicenseNFT } = getProtocolAddresses(chainId);
  if (HookLicenseNFT === ZERO_ADDRESS) {
    throw new RainbowError(`[hookos/licenseReads]: HookLicenseNFT is not deployed on chain ${chainId}`);
  }
  return HookLicenseNFT;
}

function toLicenseType(raw: number | bigint): HookLicenseType {
  const value = Number(raw);
  if (value <= HookLicenseType.Perpetual) return HookLicenseType.Perpetual;
  if (value >= HookLicenseType.Subscription) return HookLicenseType.Subscription;
  return value as HookLicenseType;
}

type LicenseTuple = readonly [
  hookId: bigint,
  creator: `0x${string}`,
  name: string,
  licenseType: number,
  price: bigint,
  maxSupply: bigint,
  totalMinted: bigint,
  subscriptionDuration: bigint,
  royaltyBps: bigint,
  active: boolean,
];

function mapLicense(licenseId: number, t: LicenseTuple): HookLicense {
  return {
    licenseId,
    hookId: t[0],
    creator: t[1],
    name: t[2],
    licenseType: toLicenseType(t[3]),
    price: t[4],
    maxSupply: Number(t[5]),
    totalMinted: Number(t[6]),
    subscriptionDuration: Number(t[7]),
    royaltyBps: Number(t[8]),
    active: t[9],
  };
}

/** Total number of licenses created on `chainId`. */
export async function getLicenseCount(chainId: HookosChainId, options?: { signal?: AbortSignal }): Promise<bigint> {
  const licenseNft = getLicenseNft(chainId);
  const client = createHookosPublicClient(chainId, options);
  return client.readContract({ address: licenseNft, abi: LICENSE_READ_ABI, functionName: 'licenseCount' });
}

/** Reads a single license by id. */
export async function getLicense(
  chainId: HookosChainId,
  licenseId: number,
  options?: { signal?: AbortSignal }
): Promise<HookLicense> {
  const licenseNft = getLicenseNft(chainId);
  const client = createHookosPublicClient(chainId, options);
  const tuple = await client.readContract({
    address: licenseNft,
    abi: LICENSE_READ_ABI,
    functionName: 'getLicense',
    args: [BigInt(licenseId)],
  });
  return mapLicense(licenseId, tuple);
}

/** Browses up to `limit` licenses, newest-first. Skips entries whose read fails. */
export async function browseLicenses(
  chainId: HookosChainId,
  limit: number,
  options?: { signal?: AbortSignal }
): Promise<HookLicense[]> {
  const total = Number(await getLicenseCount(chainId, options));
  const take = Math.min(total, limit);
  const licenses: HookLicense[] = [];

  for (let i = total - 1; i >= total - take; i--) {
    try {
      licenses.push(await getLicense(chainId, i, options));
    } catch {
      // Skip licenses whose on-chain read fails; the list stays best-effort.
    }
  }
  return licenses;
}
