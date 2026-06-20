# HookOS Wallet

The HookOS Wallet is a React Native crypto wallet (a Rainbow fork) extended to be the
**native client for the HookOS ecosystem**. It composes three independently-developed systems:

| System | Repo | Role |
| --- | --- | --- |
| **HookOS Wallet** | this repo | RN client (iOS & Android). Keys, signing, UX, routing. |
| **HookOS Protocol** | `../../Jink Labs/protocol` | DeFi protocol: token launches, bonding-curve AMM, hooks, arena, gamification. Ships `@hookos/sdk` (viem). |
| **Hook-Bridge (HookOS Infura)** | `../Hook-Bridge` | Self-hosted Hyperlane lane (Base ⇄ MegaETH): cross-chain messaging, warp token transfers, status API. Ships `@hookos/infura-sdk`. |

> The wallet OWNS keys and signing. The Protocol and Bridge own state and execution targets.
> The wallet never imports their backends — it talks to their **on-chain contracts** (viem) and
> their **HTTP/SDK read APIs**.

Read this file together with `AGENTS.md` (general Rainbow conventions). This file is the
**ground truth for HookOS-specific work and engineering governance**.

> **MANDATORY — Stay up to date with HookOS Protocol features.**
> The HookOS Protocol repo at `C:\Users\avone\OneDrive\Desktop\Jink Labs\protocol`
> (relative: `../../Jink Labs/protocol`) is the canonical source of truth for protocol
> features, contracts, ABIs, and addresses. Before doing any HookOS protocol work
> (token launches, bonding-curve AMM, hooks, arena, gamification, `@hookos/sdk`), you
> MUST consult that repo for the current state — never rely on memory or a summary.
> Re-verify addresses against `protocol/contracts/deployments/addresses.json` and pull
> new/changed features from the protocol source. Keep `src/features/hookos/` aligned
> with whatever the Protocol repo currently ships.

---

## Architecture

All HookOS code lives under a single domain feature: **`src/features/hookos/`**, following the
repo's `ui / data / core` layering (see `AGENTS.md`).

```
src/features/hookos/
├── core/                       # pure, dependency-light foundation (no UI, no stores)
│   ├── chains.ts               # MegaETH (4326) viem Chain def + chain helpers
│   ├── addresses.ts            # contract address registry per chainId (source of truth: the two repos)
│   ├── abis.ts                 # minimal ABIs for the functions we actually call
│   ├── types.ts                # shared domain types (HookToken, BondingCurve, BridgeRoute, ...)
│   └── client.ts               # viem public-client factory reusing the wallet's chain registry
├── data/                       # async/server state — Zustand query stores + read clients
│   ├── protocol/               # TokenFactory / BondingCurve / HookRegistry reads + stores
│   └── bridge/                 # Infura status API client + warp/IGP encoding + stores
└── ui/                         # screens, components, hooks, navigation registration
    ├── screens/
    ├── components/
    └── hooks/
```

### Integration rules

1. **Chains** — Base (8453) already exists in the wallet. MegaETH (4326) is added via
   `src/features/hookos/core/chains.ts` and registered through the existing
   `src/state/backendNetworks` registry. Never hardcode RPC URLs in feature code — resolve them
   through `backendNetworksActions.getChainDefaultRpc(chainId)`.
2. **Providers** — use viem public clients built from the wallet's chain registry. Reuse the
   `createDelegationPublicClient` pattern in `src/features/delegation/calls.ts`. For writes, use the
   wallet's existing signer flow (`src/model/wallet.ts`) and RAPs (`src/raps/`) — do **not** create a
   parallel signing path.
3. **Addresses & ABIs** — the canonical sources are
   `protocol/contracts/deployments/addresses.json` and
   `Hook-Bridge/hookos-infura/config/addresses.{base,megaeth}.json`. Copy verified values into
   `core/addresses.ts`; never trust a summary. Mark any unverified address with `// TODO(verify)`.
4. **Server reads** — Protocol/launchpad data and Bridge status come from their HTTP APIs. Wrap each
   in a `createQueryStore` (see `src/state/claimables/airdropsStore.ts` for the canonical shape:
   reactive `$` params, `staleTime`, `cacheTime`).
5. **No barrel exports / type-only imports / TS-only** — enforced repo-wide (see `AGENTS.md`).
6. **Writes are explicit & confirmed** — token buys/sells, hook attach, bridge transfers all route
   through a user-confirmed transaction sheet. No silent on-chain writes.

### Data flow (read)

```
UI screen ─uses→ useHookosTokensStore (createQueryStore)
                        │ fetcher
                        ├─ HTTP: HookOS indexer/data API  (lists, prices, charts)
                        └─ viem: BondingCurve.getBuyQuote / getPrice  (live, on-chain)
```

### Data flow (write — e.g. buy on bonding curve)

```
UI confirm → encode call (core/abis) → wallet signer (src/model/wallet) → RAP execute (src/raps)
           → pending tx (src/state/pendingTransactions) → refetch query store
```

### Bridge flow (Base ⇄ MegaETH)

```
UI → quote IGP gas (IGP.quoteGasPayment) → WarpRoute.transferRemote{value: gas+amount}
   → poll Infura status API (/v1/status, message status) → settle on destination chain
```

---

## Key contracts (verify against repo address files before use)

**Protocol — Base (8453):** `TokenFactory`, `BondingCurve`, `HookRegistry`, `HookManager`,
`FeeRouter`, `SwapRouter`, `Arena`, `ReputationSystem`.
**Bridge — Base (8453) & MegaETH (4326):** Hyperlane `Mailbox`, `IGP`, Warp Routes,
`HookOSInfuraFeeHook`, `CrossChainReputation`, `InterchainActionRouter`.

Live chains today: **Base 8453** and **MegaETH 4326**.

---

## Verification (run before declaring work done)

Same as `AGENTS.md`:

- `yarn lint:ts` — TS type check
- `yarn lint:js` — ESLint
- `yarn test` / `yarn jest <path>` — Jest
- `yarn check:cycles` — circular-dependency check (HookOS code must add zero new cycles)

A HookOS change is not "done" until type check + lint + relevant tests pass and the cycle check is clean.

---

# Engineering Governance — Divisions

HookOS is built and operated by the following divisions. Each division owns a domain, a set of
deliverables, and a quality gate. **No production deployment until the Security & Red Team Division
signs off. All systems must be containerized.**

## Blockchain Infrastructure & Node Operations Division

Responsible for:

* Validators
* RPC systems
* Relayers
* Indexers
* Subgraphs
* MEV infrastructure
* Cross-chain messaging
* High availability node operations

## DevSecOps Division

Responsible for:

* Docker
* Kubernetes readiness
* CI/CD
* GitHub Actions
* Security automation
* Infrastructure automation
* Secret management

All systems must be containerized.

## Security & Red Team Division

Responsible for:

* Penetration testing
* Infrastructure attacks
* Smart contract attack simulations
* API attack simulations
* Wallet attack simulations
* Social engineering threat modeling

No production deployment until security approval.

## Platform Reliability Engineering Division (SRE)

Responsible for:

* Uptime
* Monitoring
* Alerting
* Incident response
* Disaster recovery
* Auto scaling

Must generate:

* Runbooks
* SLA definitions
* SLO definitions
* Recovery plans

## Database Engineering Division

Responsible for:

* PostgreSQL
* MySQL
* MongoDB
* Redis
* ClickHouse

Must provide:

* ER diagrams
* Indexing strategies
* Backup plans
* Replication plans

## Data Engineering Division

Responsible for:

* ETL
* Analytics pipelines
* Data warehouses
* Event systems
* Streaming systems
