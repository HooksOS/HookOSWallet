/**
 * Minimal `as const` ABI fragments for the Hook-Bridge (Hyperlane) contracts the wallet calls.
 *
 * Source of truth (copied verbatim from the Hook-Bridge Solidity interfaces, do not invent):
 *  - Mailbox:  `Hook-Bridge/solidity/contracts/interfaces/IMailbox.sol`
 *  - IGP:      `Hook-Bridge/solidity/contracts/interfaces/IInterchainGasPaymaster.sol`
 *  - Warp:     `Hook-Bridge/solidity/contracts/token/libs/TokenRouter.sol`
 *
 * Only the fragments we actually read/encode are included. Hyperlane domains are `uint32`;
 * recipients and message ids are `bytes32` (left-padded addresses for EVM recipients).
 */

/**
 * Hyperlane Mailbox — arbitrary interchain messaging. This is the only bridge capability that is
 * live today on the HookOS lane (Base <-> MegaETH); token bridging via warp routes is not.
 */
export const MAILBOX_ABI = [
  {
    type: 'function',
    name: 'dispatch',
    stateMutability: 'payable',
    inputs: [
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'recipientAddress', type: 'bytes32' },
      { name: 'messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'quoteDispatch',
    stateMutability: 'view',
    inputs: [
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'recipientAddress', type: 'bytes32' },
      { name: 'messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'fee', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'delivered',
    stateMutability: 'view',
    inputs: [{ name: 'messageId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'localDomain',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint32' }],
  },
] as const;

/**
 * Hyperlane InterchainGasPaymaster (IGP). NOT deployed on the HookOS lane yet (address is null in
 * `addresses.ts`), so `quoteGasPayment` cannot be called on-chain today.
 */
export const INTERCHAIN_GAS_PAYMASTER_ABI = [
  {
    type: 'function',
    name: 'quoteGasPayment',
    stateMutability: 'view',
    inputs: [
      { name: '_destinationDomain', type: 'uint32' },
      { name: '_gasAmount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'payForGas',
    stateMutability: 'payable',
    inputs: [
      { name: '_messageId', type: 'bytes32' },
      { name: '_destinationDomain', type: 'uint32' },
      { name: '_gasAmount', type: 'uint256' },
      { name: '_refundAddress', type: 'address' },
    ],
    outputs: [],
  },
] as const;

/**
 * Hyperlane Warp Route (`TokenRouter`). NOT deployed for the canonical HOOK warp route yet
 * (`warpFeeRecipient` is null in `addresses.ts`), so transfers are not live.
 *
 * `quoteTransferRemote` returns an array of `Quote { token, amount }` structs by convention:
 *  [0] native mailbox dispatch fee, [1] amount bridged + warp fee, [2] external bridging fee.
 */
export const WARP_ROUTE_ABI = [
  {
    type: 'function',
    name: 'transferRemote',
    stateMutability: 'payable',
    inputs: [
      { name: '_destination', type: 'uint32' },
      { name: '_recipient', type: 'bytes32' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'quoteTransferRemote',
    stateMutability: 'view',
    inputs: [
      { name: '_destination', type: 'uint32' },
      { name: '_recipient', type: 'bytes32' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'quotes',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
      },
    ],
  },
] as const;
