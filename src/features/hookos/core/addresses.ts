import { type Address } from 'viem';

import { type BridgeChainId, HOOKOS_CHAIN_IDS, type HookosChainId } from './chains';

/**
 * Canonical HookOS contract registry.
 *
 * Source of truth (do not edit from summaries — copy from the canonical files):
 *  - Protocol: `protocol/contracts/deployments/addresses.json` (verified 2026-06-19)
 *  - Bridge:   `Hook-Bridge/hookos-infura/config/addresses.{base,megaeth}.json`
 *
 * The protocol registry covers all five live chains; values are generated directly from the
 * canonical `addresses.json` and checksummed. The zero address means NOT DEPLOYED on that chain.
 *
 * The Hyperlane bridge lane only spans Base <-> MegaETH (see `BridgeChainId`). Empty bridge
 * fields (IGP, warp recipient) are likewise not live yet — bridging is messaging-only until they ship.
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

export interface ProtocolAddresses {
  TokenFactory: Address;
  BondingCurve: Address;
  FeeRouter: Address;
  HookRegistry: Address;
  HookManager: Address;
  Arena: Address;
  Events: Address;
  ReputationSystem: Address;
  AmbassadorSystem: Address;
  AnalyticsEmitter: Address;
  AnalyticsPermissions: Address;
  AnalyticsVersionManager: Address;
  ArenaV2: Address;
  BattlePass: Address;
  CampaignMarketplace: Address;
  ClanSystem: Address;
  CopyTrading: Address;
  CreatorMarketplace: Address;
  DonationRouter: Address;
  DonationVault: Address;
  ExtensionRegistry: Address;
  FeedBoostAuction: Address;
  Hook_BurnOnSell: Address;
  Hook_DynamicFee: Address;
  HookLicenseNFT: Address;
  HookOSKernel: Address;
  HookOSNFT: Address;
  HookOSV4Hook: Address;
  HookRevenueVault: Address;
  HookStaking: Address;
  LaunchActivationManager: Address;
  LaunchController: Address;
  LaunchQueue: Address;
  LaunchScoreManager: Address;
  LaunchWars: Address;
  LPFeeSplitter: Address;
  LPLocker: Address;
  ModuleRegistry: Address;
  OrganizationRegistry: Address;
  PartnerSystem: Address;
  PermissionManager: Address;
  PoolBeacon: Address;
  PoolFactory: Address;
  ProfileMonetization: Address;
  ProjectRegistry: Address;
  QuestSponsorship: Address;
  QuestSystem: Address;
  RevenueSplitRegistry: Address;
  SimulationManager: Address;
  SmartWalletCore: Address;
  SwapRouter: Address;
  TemplateFactory: Address;
  UniswapV4Router: Address;
  V4GraduationAdapter: Address;
  WalletFactory: Address;
  WalletProSubscription: Address;
  WhiteLabelRegistry: Address;
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
  [HOOKOS_CHAIN_IDS.ethereum]: {
    TokenFactory: '0xa7d00760693CEc4F8c622EeD44C786a190FbA342',
    BondingCurve: '0xc841eF17b424B00A46C5acebDEEbE2976F168AC7',
    FeeRouter: '0x37F655bdf7C89E17eC1B6A143a572D277b59703C',
    HookRegistry: '0x93f35a190E6B7ed05E7bBAb78199720C0c849dDE', // NOT 0xC062 (that is a stale HookManager)
    HookManager: '0x677AEE8e641701D68CaD4FB7Ca68AED78DA277c7',
    Arena: '0x1a4BBd3cB922Ffd6167f0a75fd037A3760d63B63',
    Events: '0x0dDE71F9711693cABB46FAd461e9F0cB27B96f53',
    ReputationSystem: ZERO_ADDRESS,
    AmbassadorSystem: ZERO_ADDRESS,
    AnalyticsEmitter: ZERO_ADDRESS,
    AnalyticsPermissions: ZERO_ADDRESS,
    AnalyticsVersionManager: ZERO_ADDRESS,
    ArenaV2: ZERO_ADDRESS,
    BattlePass: ZERO_ADDRESS,
    CampaignMarketplace: ZERO_ADDRESS,
    ClanSystem: ZERO_ADDRESS,
    CopyTrading: ZERO_ADDRESS,
    CreatorMarketplace: ZERO_ADDRESS,
    DonationRouter: ZERO_ADDRESS,
    DonationVault: ZERO_ADDRESS,
    ExtensionRegistry: ZERO_ADDRESS,
    FeedBoostAuction: ZERO_ADDRESS,
    Hook_BurnOnSell: '0x9Bb58abC4A41eaC5692F42Dc59e15b0efb92af81',
    Hook_DynamicFee: '0xE1Ecb2b6bB656FF32C886ff41dA59A159EFF41f0',
    HookLicenseNFT: ZERO_ADDRESS,
    HookOSKernel: ZERO_ADDRESS,
    HookOSNFT: ZERO_ADDRESS,
    HookOSV4Hook: ZERO_ADDRESS,
    HookRevenueVault: '0x36f61a66B00ED7248954A494574E6171CFc959a2',
    HookStaking: '0x8121b56C3ABEc14e9Ef6B0a664ef2CF5683F8E58',
    LaunchActivationManager: ZERO_ADDRESS,
    LaunchController: ZERO_ADDRESS,
    LaunchQueue: ZERO_ADDRESS,
    LaunchScoreManager: ZERO_ADDRESS,
    LaunchWars: ZERO_ADDRESS,
    LPFeeSplitter: '0xC3e9f677B16e84A12EAae10cCf3Ba166B5A02a79',
    LPLocker: ZERO_ADDRESS,
    ModuleRegistry: ZERO_ADDRESS,
    OrganizationRegistry: ZERO_ADDRESS,
    PartnerSystem: ZERO_ADDRESS,
    PermissionManager: ZERO_ADDRESS,
    PoolBeacon: '0x5c4913DAE877E9a1601715b8213F02199c111351',
    PoolFactory: '0xcDfD3B997EC5A2F9CA59955d9aCE30eD8dFbFEff',
    ProfileMonetization: ZERO_ADDRESS,
    ProjectRegistry: ZERO_ADDRESS,
    QuestSponsorship: ZERO_ADDRESS,
    QuestSystem: ZERO_ADDRESS,
    RevenueSplitRegistry: ZERO_ADDRESS,
    SimulationManager: ZERO_ADDRESS,
    SmartWalletCore: ZERO_ADDRESS,
    SwapRouter: '0x071668123E129D665b756EdFFAE713B441cB69d6',
    TemplateFactory: ZERO_ADDRESS,
    UniswapV4Router: '0x66a9893cC07D91D95644AEDD05D03f95e1dBA8Af',
    V4GraduationAdapter: '0xE61c1Bd903f635f192FBf7E43831BF62E0Df3645',
    WalletFactory: ZERO_ADDRESS,
    WalletProSubscription: ZERO_ADDRESS,
    WhiteLabelRegistry: ZERO_ADDRESS,
  },
  [HOOKOS_CHAIN_IDS.bnb]: {
    TokenFactory: '0x60DfFA6940696e8f2dF997b570D9FEACC5eb1Ef7',
    BondingCurve: '0xbb141A22B4cAef996052b2ecC9F9ef2Cde259bcA',
    FeeRouter: '0x1a4BBd3cB922Ffd6167f0a75fd037A3760d63B63',
    HookRegistry: '0x0dDE71F9711693cABB46FAd461e9F0cB27B96f53', // NOT 0xC062 (that is a stale HookManager)
    HookManager: '0x36f61a66B00ED7248954A494574E6171CFc959a2',
    Arena: '0x2eF43362A9aA71DD23Ba336275E976ac300F4864',
    Events: '0x071668123E129D665b756EdFFAE713B441cB69d6',
    // Gamification + extended contracts verified against addresses.json "56".contracts (BNB Chain).
    ReputationSystem: '0x656e4C8d87780F8b0ba0dB45b9834a25b5200606',
    AmbassadorSystem: '0x4C3D942CFD2A233b8d7EF7dd349463f1EAe5163c',
    AnalyticsEmitter: '0xC0d94a99398b0b3C14971F25F13445Ef3c7fb63c',
    AnalyticsPermissions: '0xB64C6C0AFde493eFA16af27209643A7E3f1850dE',
    AnalyticsVersionManager: '0xd809129776945094EE397E01eaB2D0c5C4DE6c0A',
    ArenaV2: '0xb1D9aca82B1F011F7Dc37c704F70d49DF048fe3b',
    BattlePass: '0xe79D1C0941E0448E3793afeA8dF0542c9B032343',
    CampaignMarketplace: '0xDa80b9bE913C243a6394a7A86e153AC03a8eAc50',
    ClanSystem: '0x75bD4983C60147217F3693cb7C45212a98CD3A1C',
    CopyTrading: '0xD036e55216C9CC3135cB291270F69184ce56BE36',
    CreatorMarketplace: '0xe37A32a58e30Df97E1d6D3E84fc8F613bE5c9180',
    DonationRouter: '0x5B6fF84d8b03c75a3D115cdaF7ee101fa6F1cb92',
    DonationVault: '0x52d1E7DE76e2ea56A6EA151aA600b3ca86F7aEB5',
    ExtensionRegistry: '0x6627B03b457Fa41d4C00f0A934aF3D3FFC882038',
    FeedBoostAuction: '0xdc9a19ea23e19944c448ED77079cf64396B59610',
    Hook_BurnOnSell: ZERO_ADDRESS, // no key in canonical "56"
    Hook_DynamicFee: ZERO_ADDRESS, // no key in canonical "56"
    HookLicenseNFT: '0x55931c3a1752365788180CDDeD47E030a104DF11',
    HookOSKernel: '0x2d7C972FB70B340AA0C9668395B8Cf817Ee71A74',
    HookOSNFT: '0x555f5c7e67826b860272fda6fce34Cd36e751F12',
    HookOSV4Hook: ZERO_ADDRESS, // zero in canonical "56"
    HookRevenueVault: '0xc841eF17b424B00A46C5acebDEEbE2976F168AC7',
    HookStaking: '0xeb1C600077ef3ff10956e823c1B4a5A7c2369dC6',
    LaunchActivationManager: '0x6a297c0C2393Af2B41e1cEF848E2C85090FD9A4f',
    LaunchController: '0xCdC35BED68bE2aD6245D93F8D310408d4aB93167',
    LaunchQueue: '0x57Bd605a01DFF58F6CB1b19a1ddCc0274Dd0f528',
    LaunchScoreManager: '0x8c7493AfdEcf1C2C0A3D94Ec1acDfd7A268b8C33',
    LaunchWars: '0x9F5690a9128e4E80E9D08F0415DD804d5f7f7168',
    LPFeeSplitter: '0x2ac67ebb03926EAA92CfFBfEc646d2bf2553350e', // wallet-only: no key in canonical "56"
    LPLocker: '0x751232f04B05bf0cb9fe36aB9E0009FEb97f49a4',
    ModuleRegistry: '0x86911Ab7c2eceE072111A66254f09f7dbf1A34fA',
    OrganizationRegistry: '0x1239058b06D495a28e4883eAc5C6CEa36d114495',
    PartnerSystem: '0x71d9E8e2FDcA537E7295F10Bc02c78883A43d2c7',
    PermissionManager: '0xd6081eC89ea479eeB2CE090cccEFAaEcc09e52d0',
    PoolBeacon: '0x8121b56C3ABEc14e9Ef6B0a664ef2CF5683F8E58',
    PoolFactory: '0x0d04627b6eFc9f546702969fF1faBD7a9642886f',
    ProfileMonetization: '0xd641fA4f0592d93CC9989659527936F998669c4B',
    ProjectRegistry: '0x3ece955F4513FFdCD7A053693ad0869cA115D132',
    QuestSponsorship: '0x8e6f4653f4a5060cFCCE84f5a249609D04568e81',
    QuestSystem: '0xD9Ff755b6113f80276fE36DCddF931084051FD68',
    RevenueSplitRegistry: '0x29C130Fc89179cbEEdC8fBcb209f0b595c575A1A',
    SimulationManager: '0x5a08ce161d5e69f52079F319c5cDEAfC955c3b26',
    SmartWalletCore: '0xebE5fD0F60f4c282CDc5f96bAc8E0903cE2E862c',
    SwapRouter: '0x4Cd8fd69F93916D6F8793Bdf4418206A172af66F',
    TemplateFactory: ZERO_ADDRESS, // zero in canonical "56"
    UniswapV4Router: '0x1906c1d672b88cD1B9aC7593301cA990F94Eae07',
    V4GraduationAdapter: '0x4b481401b9Dd6B21B3Ba89b239A8Ee3025B92Bf8', // wallet-only: no key in canonical "56"
    WalletFactory: '0x155C388f118C2B8eb58Ac2d4b23f1Ba99f95fd3B',
    WalletProSubscription: '0xa3e5dE74cd1d42A97A5CC0f45b7A24A73fb52736',
    WhiteLabelRegistry: '0x75241baab79B4e21C3E94ED1c74b199472019571',
  },
  [HOOKOS_CHAIN_IDS.hyperevm]: {
    TokenFactory: '0x96c5E38362f86E52389E15a86247fB7326503c8d',
    BondingCurve: '0x93f35a190E6B7ed05E7bBAb78199720C0c849dDE',
    FeeRouter: '0x8DebEd7101B2e6577909fA07491F484fC2A8Ad2c',
    HookRegistry: '0x64E3167b2B4eA1b8e3DdCaFe66a5b435BE7cD75f', // NOT 0xC062 (that is a stale HookManager)
    HookManager: '0xC062c550b4abcbE8fa50DF05Ea353864d0E01262',
    Arena: '0x9B3d636C27AD4CDEBFbE1F182B2b63F66Be7adE5',
    Events: '0x47C839295754307E635DC6bEf89856267932dD38',
    ReputationSystem: ZERO_ADDRESS,
    AmbassadorSystem: ZERO_ADDRESS,
    AnalyticsEmitter: ZERO_ADDRESS,
    AnalyticsPermissions: ZERO_ADDRESS,
    AnalyticsVersionManager: ZERO_ADDRESS,
    ArenaV2: ZERO_ADDRESS,
    BattlePass: ZERO_ADDRESS,
    CampaignMarketplace: ZERO_ADDRESS,
    ClanSystem: ZERO_ADDRESS,
    CopyTrading: ZERO_ADDRESS,
    CreatorMarketplace: ZERO_ADDRESS,
    // Verified against addresses.json "999".contracts (HyperEVM).
    DonationRouter: '0xbA57f44D8C90780530c7ea91c999389F77f09b43',
    DonationVault: '0x27022e5276eC1912a45fF8e7FEd99F76840450e6',
    ExtensionRegistry: '0x1F15e5Db9670F76a0C863A1D87DFaA037C82B602',
    FeedBoostAuction: ZERO_ADDRESS,
    // TODO(verify): wallet-only keys with no canonical "999" mapping; these addresses collide with
    // another chain's WalletFactory/SmartWalletCore in addresses.json — confirm against protocol source.
    Hook_BurnOnSell: '0xd1D7Cc2c6cE1962B6e10FC9AB3E9a52D21686892',
    Hook_DynamicFee: '0x8006491B0F80b90bc3CF0E46216762Bd44216cf8',
    HookLicenseNFT: ZERO_ADDRESS,
    HookOSKernel: ZERO_ADDRESS,
    HookOSNFT: ZERO_ADDRESS,
    HookOSV4Hook: ZERO_ADDRESS,
    HookRevenueVault: '0x5c977d2fF0b8aD13ca0AbF954A219E31CF049C60',
    HookStaking: ZERO_ADDRESS,
    LaunchActivationManager: ZERO_ADDRESS,
    LaunchController: ZERO_ADDRESS,
    LaunchQueue: ZERO_ADDRESS,
    LaunchScoreManager: ZERO_ADDRESS,
    LaunchWars: ZERO_ADDRESS,
    LPFeeSplitter: ZERO_ADDRESS,
    LPLocker: ZERO_ADDRESS,
    ModuleRegistry: ZERO_ADDRESS,
    OrganizationRegistry: '0x531BD1Abd78A57154dC280AeE519177147898316',
    PartnerSystem: ZERO_ADDRESS,
    PermissionManager: ZERO_ADDRESS,
    PoolBeacon: '0xb97A7E0a81943F49ca49940D7b7ec408d481041D',
    PoolFactory: '0xF2F1C1D5089995c55C9Bf0395ebb70EBBF17b61D',
    ProfileMonetization: ZERO_ADDRESS,
    ProjectRegistry: ZERO_ADDRESS,
    QuestSponsorship: ZERO_ADDRESS,
    QuestSystem: ZERO_ADDRESS,
    RevenueSplitRegistry: '0x43eb1dc63c5c19E7797134e844b3a460150AA6DE',
    SimulationManager: ZERO_ADDRESS,
    SmartWalletCore: '0xFBAd0FA93f4fb8C4fAEaf9E1ac795e91Cf45dDe2',
    SwapRouter: '0x37F655bdf7C89E17eC1B6A143a572D277b59703C',
    TemplateFactory: '0x1a4BBd3cB922Ffd6167f0a75fd037A3760d63B63',
    UniswapV4Router: ZERO_ADDRESS,
    V4GraduationAdapter: ZERO_ADDRESS,
    WalletFactory: '0xb1D9aca82B1F011F7Dc37c704F70d49DF048fe3b',
    WalletProSubscription: ZERO_ADDRESS,
    WhiteLabelRegistry: ZERO_ADDRESS,
  },
  [HOOKOS_CHAIN_IDS.megaeth]: {
    TokenFactory: '0x9Bb58abC4A41eaC5692F42Dc59e15b0efb92af81',
    BondingCurve: '0x6A2fAa5Da2B9F1515661f18160C0A0d584c0AC15',
    FeeRouter: '0x69A8C492056F5f58e19d5DA65EBd1869BA24815b', // two valid proxies exist; confirm fee routing before fee-hook go-live
    HookRegistry: '0xE1Ecb2b6bB656FF32C886ff41dA59A159EFF41f0', // NOT 0xC062 (that is a stale HookManager)
    HookManager: '0xa9F36a3BaF19b21A764F837e0dF49DFE203636B7',
    Arena: '0x30801EAb4C458cF8795eED77cAe5e3F422678347',
    Events: '0x77FbF854c2f376280599f5277A1A0c1D1B736Edc',
    ReputationSystem: '0xCD9Ec2C56fE1f561d63107f1ca9e2B5218e8284e', // verified against protocol addresses.json (4326)
    AmbassadorSystem: '0x95E7e0922174f60C7de9065a4e2aE28da45FbeeE',
    AnalyticsEmitter: '0x4068Df92693a01A1811620076E479D545821fFa0',
    AnalyticsPermissions: '0x52d1E7DE76e2ea56A6EA151aA600b3ca86F7aEB5',
    AnalyticsVersionManager: '0x9990E3e9f77821F851DFd6c9680481D3fccF775E',
    ArenaV2: '0xbdfFc8B2db17fDE04D53916E03dCB07ad6D56266',
    BattlePass: '0xF42c7658A6766f078487102Af20c7C0221c3866F',
    CampaignMarketplace: '0x59cb3d21f17132766c579BDd1D1B57Ad02470c23',
    ClanSystem: '0x360E1FCEcACe39a7d96883e5Ae640DA6E88e6579',
    CopyTrading: '0xD0d31E3Fc15aC5F24e90DE997BCC8442e2dF4718',
    CreatorMarketplace: '0xed2784ab5f5A82fF27E96AD2341E8BA28cf1d4d6',
    DonationRouter: '0xCdC35BED68bE2aD6245D93F8D310408d4aB93167',
    DonationVault: '0xC0d94a99398b0b3C14971F25F13445Ef3c7fb63c',
    ExtensionRegistry: '0x57Bd605a01DFF58F6CB1b19a1ddCc0274Dd0f528',
    FeedBoostAuction: '0x55eAd32A8B5343e085B92eA087df0FBE60386fF7',
    Hook_BurnOnSell: ZERO_ADDRESS,
    Hook_DynamicFee: ZERO_ADDRESS,
    HookLicenseNFT: '0xFEE62e423b3c4bE75315CeCeF08Eb6Ae8d4F4293',
    HookOSKernel: '0xb740b22560b93A7581F88acfE205d08432dA71ea',
    HookOSNFT: '0x2Ff14C5681eCAada2B90BC1F0EfF081F7bac8096',
    HookOSV4Hook: ZERO_ADDRESS,
    HookRevenueVault: '0x97e7B6e7F995F45bc20c35ACA02B2CD400864dF9',
    HookStaking: '0x6a43771e68238b5aa6665bBFA67ee3BF9BAD2ae0',
    LaunchActivationManager: ZERO_ADDRESS,
    LaunchController: '0x75bD4983C60147217F3693cb7C45212a98CD3A1C',
    LaunchQueue: '0x253167d13bD9d8732baD2Cce058C92fcd6E0361A',
    LaunchScoreManager: '0x6c546cB4c4d861DeD47CA1B09C16d56F909448E8',
    LaunchWars: '0xd16e3Ed4ABf1957100DC4063F179C0Ccb7dd895E',
    LPFeeSplitter: '0xFd5dA18b35F23a3b35e1F3D5c910b17Cc8330328',
    LPLocker: ZERO_ADDRESS,
    ModuleRegistry: '0xf26467BF1CAe865C9ddB69e586d6081ee5D9b15E',
    OrganizationRegistry: '0xd809129776945094EE397E01eaB2D0c5C4DE6c0A',
    PartnerSystem: '0xa29FEbD83f0977F39ed29221E6235dA10Cb5b35c',
    PermissionManager: '0x720a3e75A1e1c8cAC2C8269c783307250b66e4c4',
    PoolBeacon: '0xE61c1Bd903f635f192FBf7E43831BF62E0Df3645',
    PoolFactory: '0x1106A0257bbB2f7950f5bcf366e966D24c6F5cDd',
    ProfileMonetization: '0xA1A348a120BB2Fc10059870183db9a513C6A804d',
    ProjectRegistry: '0xb74c8844c4AAc0a2f6003BbB7421D5650Bf77807',
    QuestSponsorship: '0x47A66A65fC90349EaaFB1D51c18B61a2d4FFB91d',
    QuestSystem: '0xeCeDd98C8Fb52ee336e22375c0f8193c1253a2a1',
    RevenueSplitRegistry: '0xeae62d2c4478F0c60044Ea20b92E1664508A9639',
    SimulationManager: '0xeAB14EAf1Ba0d790EdaCfB819c5DDb556B5b3050',
    SmartWalletCore: '0x8006491B0F80b90bc3CF0E46216762Bd44216cf8',
    SwapRouter: '0x2850C29ACBBe98b1b2C57ac0B673184876266f51',
    TemplateFactory: '0xBf0AAE505764C6cee7826826BCCcF140A39CD65C',
    UniswapV4Router: '0x47837eB80DB5908EabbA9105626D9B348bea7B02',
    V4GraduationAdapter: '0x4cCD649b6E375ad1C6d067FdD18712eB091Bc179',
    WalletFactory: '0xd1D7Cc2c6cE1962B6e10FC9AB3E9a52D21686892',
    WalletProSubscription: '0x58235F1112de75606D18ECFD6a136D3745cB70A7',
    WhiteLabelRegistry: '0xEdC0a9BEC4c038CaeEB3CEeeF6B86235397AA8e6',
  },
  [HOOKOS_CHAIN_IDS.base]: {
    TokenFactory: '0x9B3d636C27AD4CDEBFbE1F182B2b63F66Be7adE5',
    BondingCurve: '0x3C4b0F2D3d5bBdf4E0B323f0a8Eec7B02Cce6d40',
    FeeRouter: '0x64E3167b2B4eA1b8e3DdCaFe66a5b435BE7cD75f',
    HookRegistry: '0x467A8Ab4A9B65D8Da151F402021b17A147C058c5', // NOT 0xC062 (that is a stale HookManager)
    HookManager: '0x96c5E38362f86E52389E15a86247fB7326503c8d',
    Arena: '0x47C839295754307E635DC6bEf89856267932dD38',
    Events: '0x2c34ee38d96FBC890d341D80610375657594EFCc',
    ReputationSystem: '0x47A66A65fC90349EaaFB1D51c18B61a2d4FFB91d',
    AmbassadorSystem: '0xf45d92EFe9b7E4693000358B61ECD50C7C0f2FA9',
    AnalyticsEmitter: '0xd72600d7105d997e495844e30df92cd296b911e4',
    AnalyticsPermissions: '0xeAB14EAf1Ba0d790EdaCfB819c5DDb556B5b3050',
    AnalyticsVersionManager: '0x9Bb63Eaa6127e61d08CBFca13020664973168635',
    ArenaV2: '0xa29FEbD83f0977F39ed29221E6235dA10Cb5b35c',
    BattlePass: '0x55eAd32A8B5343e085B92eA087df0FBE60386fF7',
    CampaignMarketplace: '0x9D11060832B21C18329dD3BfEae3A6d43A552Fd8',
    ClanSystem: '0xEdC0a9BEC4c038CaeEB3CEeeF6B86235397AA8e6',
    CopyTrading: '0xa3e5dE74cd1d42A97A5CC0f45b7A24A73fb52736',
    CreatorMarketplace: '0x7B17C24Db13f94344A5b9183D92F232d7768Ffb9',
    DonationRouter: '0xF5a06e00d26F1b06B76fAAcBc2b5BB177598B1b0',
    DonationVault: '0xc915ad0C664EA13A981520a4aEbe6DD97e41CC62',
    ExtensionRegistry: '0xCE9a474B817E7A102F922F26188A14515aA47f6f',
    FeedBoostAuction: '0xaD31291Ff64a26D2eE5346A3c96b07f6cEe4b442',
    Hook_BurnOnSell: ZERO_ADDRESS,
    Hook_DynamicFee: ZERO_ADDRESS,
    HookLicenseNFT: '0xe0189E7E729fB8dCfA4799171620335f08Cc4AE5',
    HookOSKernel: '0xE2ED29B574f5260F75Cea5187880740C92694e20',
    HookOSNFT: '0xA50901D97ec77362f8B19464DAbf76B39128fC98',
    HookOSV4Hook: '0x1B04B20196437F9718FB7fd834fCA0DdAb3446c0',
    HookRevenueVault: '0xA1B01d969D39647e5C98416779920d844a1FA961',
    HookStaking: ZERO_ADDRESS,
    LaunchActivationManager: '0x1F3bD44CC1B518d147032F2db6B1FFE7d60c3438',
    LaunchController: '0x7eA1c5A725cc4f9ECaDbF706084A90b219e9CB38',
    LaunchQueue: '0x0f8dbc7Cdc6bb333eD9B3e544Ed6E7A38c8d2542',
    LaunchScoreManager: '0xFBAd0FA93f4fb8C4fAEaf9E1ac795e91Cf45dDe2',
    LaunchWars: '0xA1A348a120BB2Fc10059870183db9a513C6A804d',
    LPFeeSplitter: '0xF1Ed5B5e834367181d5d0aFE1d3DF57d907F6FCc',
    LPLocker: '0x471E566B43B8C2693b18600Ec0982e40787F06BD',
    ModuleRegistry: '0x5Cbc99339ddB768973A28C5cE1D9635b80eE92cE',
    OrganizationRegistry: '0xDd9A0d97C3abAc1e93ebC69F9C9D2558Ff3E02Ef',
    PartnerSystem: '0xBf0AAE505764C6cee7826826BCCcF140A39CD65C',
    PermissionManager: '0xb74c8844c4AAc0a2f6003BbB7421D5650Bf77807',
    PoolBeacon: '0x4b481401b9Dd6B21B3Ba89b239A8Ee3025B92Bf8',
    PoolFactory: '0xEE71e51e757a3B36F027400CDb7182710564654A',
    ProfileMonetization: '0x0fD41607e121F300bc5785fEcB20e8680DCA6373',
    ProjectRegistry: '0x4797BE0917C953f246Cf654Cf596Ef17779F612C',
    QuestSponsorship: '0xFEE62e423b3c4bE75315CeCeF08Eb6Ae8d4F4293',
    QuestSystem: '0x58235F1112de75606D18ECFD6a136D3745cB70A7',
    RevenueSplitRegistry: '0x253167d13bD9d8732baD2Cce058C92fcd6E0361A',
    SimulationManager: '0xcC3c6E88eFcdCE53AC02884b2F5271D4E04b2c03',
    SmartWalletCore: '0xd5A693b42c6d59677586fdc7899547ee710C26d0',
    SwapRouter: '0x1106A0257bbB2f7950f5bcf366e966D24c6F5cDd',
    TemplateFactory: '0x5a4CB8C969Be9498967cC3804EB7A5396001EDC3',
    UniswapV4Router: '0xf689f68f0CB882B7ef1e6797036640C1d2a2367c',
    V4GraduationAdapter: '0x95846D19B8D887450206e4479a3d5561F6eDC851',
    WalletFactory: '0xE689636E5AfADB2CE536b155AfeB8f279E3873c5',
    WalletProSubscription: '0xDd569e1E0224A7b413d1cd86493667450DF8242f',
    WhiteLabelRegistry: '0x27750B1EB26B9C593E0011Cab96097E49E4c1A88',
  },
};

/**
 * Hyperlane bridge contracts. The lane only spans Base <-> MegaETH, so this registry is keyed by
 * `BridgeChainId` (not all five HookOS chains).
 *
 * Source: `Hook-Bridge/hookos-infura/config/addresses.{base,megaeth}.json`.
 */
export const BRIDGE_ADDRESSES: Record<BridgeChainId, BridgeAddresses> = {
  [HOOKOS_CHAIN_IDS.base]: {
    Mailbox: '0x963018fBe13da064F14a7209401A4728D8F6ee50',
    defaultIsm: '0x7E33D3170d2D789cBEBfc2Da84FA7CaD1c768499',
    merkleTreeHook: '0xb71aD4CD3A578A5571d6E7Dd592DA4646d42D5bF',
    validatorAnnounce: '0xa33347e3763Ce60c69B3BFb2Ad9d2f75179ac902',
    interchainGasPaymaster: '0x8B5522e219FB3a455D6Ca90Db4b0866228b394Ef', // verified: addresses.base.json
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
    interchainGasPaymaster: '0x0c8527099FFdBcbb74EBafF4BfB8d85F646c067B', // verified: addresses.megaeth.json
    HookOSInfuraFeeHook: '0x86911Ab7c2eceE072111A66254f09f7dbf1A34fA',
    CrossChainReputation: '0xAAB71EeeEf3bDf7AD51F24A6f591Aac4920CdDc8',
    InterchainActionRouter: '0xd6081eC89ea479eeB2CE090cccEFAaEcc09e52d0',
    warpFeeRecipient: null,
  },
};

/** Hyperlane domain ids equal chainId for the HookOS chains. */
export const HYPERLANE_DOMAINS: Record<HookosChainId, number> = {
  [HOOKOS_CHAIN_IDS.ethereum]: HOOKOS_CHAIN_IDS.ethereum,
  [HOOKOS_CHAIN_IDS.bnb]: HOOKOS_CHAIN_IDS.bnb,
  [HOOKOS_CHAIN_IDS.hyperevm]: HOOKOS_CHAIN_IDS.hyperevm,
  [HOOKOS_CHAIN_IDS.megaeth]: HOOKOS_CHAIN_IDS.megaeth,
  [HOOKOS_CHAIN_IDS.base]: HOOKOS_CHAIN_IDS.base,
};

export function getProtocolAddresses(chainId: HookosChainId): ProtocolAddresses {
  return PROTOCOL_ADDRESSES[chainId];
}

export function getBridgeAddresses(chainId: BridgeChainId): BridgeAddresses {
  return BRIDGE_ADDRESSES[chainId];
}
