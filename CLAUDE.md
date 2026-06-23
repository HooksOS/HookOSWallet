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

## Approval policy (this repo)

To reduce prompt fatigue, routine work auto-proceeds and **only major/risky changes require
explicit approval**. This is enforced by `.claude/settings.json` (`permissions`) and applies to
this repo only:

- **Auto-allowed (no prompt):** file reads/searches, in-repo file edits, and safe dev commands —
  `yarn lint:*`, `yarn lint:ts`, `yarn test`/`yarn jest`, `yarn tsc`, `yarn check:cycles`,
  `yarn madge`, read-only `git` (`status`/`diff`/`log`/`show`/`branch`/`fetch`) and read-only `gh`.
- **Always ask first (major changes):** `git push` / force-push, `git reset --hard`, `git rebase`,
  `git clean`, `git checkout` (discards), file/dir deletes (`rm`, `Remove-Item`), package publishes
  (`npm`/`yarn publish`, `npm version`), `gh release create`, and `gh pr merge`.

If you add a new destructive or outward-facing command, put it in the `ask` list (not `allow`).

### Major decisions & updates — always get explicit approval first

Routine, reversible, in-repo work proceeds without asking. But **stop and get the user's explicit
approval before any major decision or update**, i.e. anything outward-facing, hard to reverse, or
architecturally significant. Present the plan (what, where, blast radius, rollback) and wait for a
clear "yes" before acting. Approval is **scoped and single-use** — a "yes" for one action does not
authorize the next one, a different target, or a repeat later.

Treat these as **major (ask first)**:

- **Deployments / infra changes** — deploying, redeploying, restarting, or tearing down anything on
  the VPS or any server; editing nginx/DNS/TLS; changing ports, networks, or compose projects;
  touching another project's containers, volumes, or data. (See **VPS deployment** below.)
- **Production data / secrets** — rotating keys, editing `.env` on a host, migrations, anything that
  reads or writes another service's secrets or state.
- **On-chain & money-moving actions** — sending transactions, funding agents, deploying/wiring
  contracts, changing addresses in `core/addresses.ts` that a live read/write path uses.
- **Repo/architecture shifts** — new top-level dependencies, changing the chain registry, signing
  flow, RAPs, or the `ui/data/core` layering; branch/release/publish operations already in the
  `ask` list above.
- **Anything governance-gated** — per the divisions below, **no production deployment until the
  Security & Red Team Division signs off, and all systems must be containerized.**

When unsure whether something is "major," assume it is and ask. Document the outcome of a major
change (what shipped, where, how to roll back) in this file or the relevant repo doc.

---

## VPS deployment (HookOS Infura — wallet-owned, isolated)

The wallet consumes the HookOS Infura HTTP API (`@hookos/infura-sdk`). A **wallet-owned, fully
isolated** copy of that read-only API runs on the shared HookOS VPS. It exists alongside — and must
never interfere with — the production `hookos-infura` stack or any other project on the box.

**Host:** `ubuntu@15.204.8.186` (SSH key `~/.ssh/hookos_deploy`). The box is shared: ~11 compose
projects (`hookos-infura`, `protocol`, `jinklabs`, `hookos-score`, `railai`, …). Production Infura
publishes `:8080` (API) and `:8090` (bridge) and runs the relayer + 10 validators.

**Isolation contract for our deployment — never violate:**

| Resource | Production (do NOT touch) | Wallet-owned (ours) |
| --- | --- | --- |
| Compose project | `hookos-infura` | `hookos-wallet-infura` |
| Container | `hookos-infura-api` | `hookos-wallet-infura-api` |
| Image | `hookos-infura-infura-api` | `hookos-wallet-infura-api:latest` |
| Network | `hookos-infura_default` | `hookos-wallet-infura_default` |
| Port | `0.0.0.0:8080` | `127.0.0.1:18080` (localhost-only) |
| Host folder | `/home/ubuntu/hookos-infura/` | `/home/ubuntu/hookos-wallet-infura/` |
| Secrets | their `api/.env` | our own `api/.env` (`chmod 600`, generated key, **public** RPCs + indexer) |

Rules:

1. **Our footprint only.** Own compose project, container, image, network, port, and host folder.
   Bind to `127.0.0.1` (no new public attack surface). Never publish a port already in use.
2. **No singletons.** Do **not** run a second copy of validators or the relayer — they hold keys and
   duplicates risk double-signing/slashing. We run the **stateless read-only API only**.
3. **No shared secrets.** Generate our own API key; use public RPCs (`mainnet.base.org`,
   `mainnet.megaeth.com/rpc`) and the public indexer (`api.hookos.fun`). Never copy prod `.env`.
4. **Deploying/redeploying is a major action** — ask first (see policy above). Build + run:
   ```bash
   ssh ubuntu@15.204.8.186
   cd /home/ubuntu/hookos-wallet-infura
   docker compose -p hookos-wallet-infura up -d --build      # ours only; isolated
   curl -s http://127.0.0.1:18080/health                     # -> {"ok":true}
   ```
5. **Verify isolation after every deploy:** our container healthy on `:18080`, and the full
   `hookos-infura` prod stack + all other projects still `Up (healthy)` and untouched.

> Status: deployed and healthy — `hookos-wallet-infura-api` on `127.0.0.1:18080`, serving live
> on-chain `/v1/fees` and `/v1/status`. Production stack and all other projects verified untouched.

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
