import { type Address } from 'viem';

import { HOOKOS_CHAIN_IDS, type HookosChainId } from './chains';

/**
 * Canonical HookOS contract registry.
 *
 * Source of truth (verified 2026-06-14, do not edit from summaries):
 *  - Protocol: `protocol/contracts/deployments/addresses.json`
 *  - Bridge:   `Hook-Bridge/hookos-infura/config/addresses.{base,megaeth}.json`
 *
 * The zero address means NOT DEPLOYED on that chain. Empty bridge fields (IGP, warp recipient)
 * are likewise not live yet — bridging is messaging-only until they ship.
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export interface ProtocolAddresses {
  FeeRouter: Address;
  HookRegistry: Address;
  HookManager: Address;
  TokenFactory: Address;
  BondingCurve: Address;
  Arena: Address;
  Events: Address;
  ReputationSystem: Address;
}

export interface BridgeAddresses {
  Mailbox: Address;
  defaultIsm: Address;
  merkleTreeHook: Address;
  validatorAnnounce: Address;
  /** Hyperlane IGP — empty/zero until deployed; quote gas off-chain meanwhile. */
  interchainGasPaymaster: Address | null;
  HookOSInfuraFeeHook: Address;
  CrossChainReputation: Address;
  InterchainActionRouter: Address;
  /** Warp route fee recipient — not live yet (canonical HOOK warp route is future work). */
  warpFeeRecipient: Address | null;
}

export const PROTOCOL_ADDRESSES: Record<HookosChainId, ProtocolAddresses> = {
  [HOOKOS_CHAIN_IDS.base]: {
    FeeRouter: '0x64E3167b2B4eA1b8e3DdCaFe66a5b435BE7cD75f',
    HookRegistry: '0x467A8Ab4A9B65D8Da151F402021b17A147C058c5', // NOT 0xC062 (that is a stale HookManager)
    HookManager: '0x96c5E38362f86E52389E15a86247fB7326503c8d',
    TokenFactory: '0x9B3d636C27AD4CDEBFbE1F182B2b63F66Be7adE5',
    BondingCurve: '0x3C4b0F2D3d5bBdf4E0B323f0a8Eec7B02Cce6d40',
    Arena: '0x47C839295754307E635DC6bEf89856267932dD38',
    Events: '0x2c34ee38d96FBC890d341D80610375657594EFCc',
    ReputationSystem: '0x47A66A65fC90349EaaFB1D51c18B61a2d4FFB91d',
  },
  [HOOKOS_CHAIN_IDS.megaeth]: {
    FeeRouter: '0x69A8C492056F5f58e19d5DA65EBd1869BA24815b', // ⚠️ two valid proxies exist; confirm fee routing before fee-hook go-live
    HookRegistry: '0xE1Ecb2b6bB656FF32C886ff41dA59A159EFF41f0',
    HookManager: '0xa9F36a3BaF19b21A764F837e0dF49DFE203636B7',
    TokenFactory: '0x9Bb58abC4A41eaC5692F42Dc59e15b0efb92af81',
    BondingCurve: '0x6A2fAa5Da2B9F1515661f18160C0A0d584c0AC15',
    Arena: '0x30801EAb4C458cF8795eED77cAe5e3F422678347',
    Events: '0x77FbF854c2f376280599f5277A1A0c1D1B736Edc',
    ReputationSystem: ZERO_ADDRESS, // not deployed on MegaETH yet
  },
};

export const BRIDGE_ADDRESSES: Record<HookosChainId, BridgeAddresses> = {
  [HOOKOS_CHAIN_IDS.base]: {
    Mailbox: '0x963018fBe13da064F14a7209401A4728D8F6ee50',
    defaultIsm: '0x7E33D3170d2D789cBEBfc2Da84FA7CaD1c768499',
    merkleTreeHook: '0xb71aD4CD3A578A5571d6E7Dd592DA4646d42D5bF',
    validatorAnnounce: '0xa33347e3763Ce60c69B3BFb2Ad9d2f75179ac902',
    interchainGasPaymaster: null, // empty in config — not deployed yet
    HookOSInfuraFeeHook: '0xA7749DA14492E889C4f22Efe3CEf531B2ee927b2',
    CrossChainReputation: '0x7AF31D402fe21De57ab7CE22988Ad71470Dd9E50',
    InterchainActionRouter: '0x5eb97cdF43C8BA034c968424311220726fd19499',
    warpFeeRecipient: null, // not live yet
  },
  [HOOKOS_CHAIN_IDS.megaeth]: {
    Mailbox: '0xD036e55216C9CC3135cB291270F69184ce56BE36',
    defaultIsm: '0x5936109Cc6e119476a6BCdc5a7c2975ceAdfDca0',
    merkleTreeHook: '0xB92C3B10b4C8E5C1F5eBE3fBFB7D16f28852D9E1',
    validatorAnnounce: '0xA11ceed0991B702f2740Fb7077DD57427f5E66d4',
    interchainGasPaymaster: null,
    HookOSInfuraFeeHook: '0x86911Ab7c2eceE072111A66254f09f7dbf1A34fA',
    CrossChainReputation: '0xAAB71EeeEf3bDf7AD51F24A6f591Aac4920CdDc8',
    InterchainActionRouter: '0xd6081eC89ea479eeB2CE090cccEFAaEcc09e52d0',
    warpFeeRecipient: null,
  },
};

/** Hyperlane domain ids equal chainId for the live HookOS lane. */
export const HYPERLANE_DOMAINS: Record<HookosChainId, number> = {
  [HOOKOS_CHAIN_IDS.base]: HOOKOS_CHAIN_IDS.base,
  [HOOKOS_CHAIN_IDS.megaeth]: HOOKOS_CHAIN_IDS.megaeth,
};

export function getProtocolAddresses(chainId: HookosChainId): ProtocolAddresses {
  return PROTOCOL_ADDRESSES[chainId];
}

export function getBridgeAddresses(chainId: HookosChainId): BridgeAddresses {
  return BRIDGE_ADDRESSES[chainId];
}
