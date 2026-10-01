# FlowRail

**One customer signature. A fleet of narrowly scoped payout keys. Every payment provable on-chain.**

FlowRail is payout-operations software for agencies that pay many people — freelancers,
creators, vendors — on [Tempo](https://tempo.xyz).

The customer approves a payout run once. FlowRail turns that single approval into a set of
per-recipient access keys, each limited to one payee, one capped amount, and a short expiry.
An inbound client payment is reconciled to payees via memos. Payouts then leave as one
atomic batch, and every payout links back to on-chain proof.

---

## Read this first

The single most important fact about this repo:

> **Tempo's canonical TIP documents and the Moderato testnet deployment disagree.**
> Spend periods, richer read functions, and per-token limit updates are specified upstream
> but **not deployed**. Building against the TIP will produce code that reverts.

Every claim in this repo is labelled `VERIFIED`, `FROM-TIP`, or `OPEN`. Do not let an
unlabelled assumption through. See [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

## Documentation map

| Document | Read it when you need to |
|---|---|
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | **Start here.** Exact current state, what broke, what to do next. |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | You need to know what FlowRail is and who it serves. ⚠️ Product details are **unconfirmed by the user**. |
| [`docs/PROTOCOL.md`](docs/PROTOCOL.md) | You are touching Tempo selectors, limits, scopes, or witnesses. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | You are adding a file under `spike/src/`. |
| [`docs/SECURITY.md`](docs/SECURITY.md) | You are signing anything, or changing what FlowRail may do. |
| [`docs/UI.md`](docs/UI.md) | You are building a screen. |
| [`docs/PLAN.md`](docs/PLAN.md) | You need the schedule, scope cuts, or submission checklist. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | You want to know why it is built this way, or want to change it. |
| [`spike/SPIKE.md`](spike/SPIKE.md) | You are running probes or picking up the protocol investigation. |
| [`SPEC.md`](SPEC.md) | You need the full build spec. Superseded in part — see its ⚠️ banners. |

## Repository map

```
flowrail/
├── SPEC.md              Build spec (v1). Partially superseded by docs/PROTOCOL.md.
├── docs/                These documents.
├── spike/               Protocol spike: a real CLI that talks to Moderato.
│   ├── src/domain/      Pure types + policy. Zero imports. Unit-testable with no RPC.
│   ├── src/ports/       Interfaces the domain and app may depend on.
│   ├── src/adapters/    The only code allowed to know Tempo / the filesystem exist.
│   ├── src/app/         Use cases. NOT YET WRITTEN.
│   ├── src/cli/         NOT YET WRITTEN — 7 package.json scripts point at nothing.
│   └── test/            NOT YET WRITTEN — zero tests exist.
└── web/                 Marketing landing page (Next.js). Separate from the product UI.
```

## Status

| Area | State |
|---|---|
| Protocol investigation | **Substantially done.** Moderato surface mapped. 3 questions open. |
| Spike code | **~770 lines written, 0 run.** No CLI, no tests, 6 known defects. |
| Testnet account | **Does not exist.** No key generated, no faucet call made. |
| Product UI | **Not started.** Design sketched in `docs/UI.md`, no code. |
| Landing page | **Built and lint/builds clean, but uncommitted.** |

Nothing in `spike/` has been executed end to end. Treat it as a design sketch that compiles
in intent, not a working system.

## Quick start (once the CLI exists)

```bash
cd spike
npm install
npm run agent:new      # generate a throwaway test root key into spike/.data/
npm run faucet         # fund it on Moderato
npm run probe:chain    # confirm chain id + pathUSD balance
```

`.data/` is gitignored and holds key material. **Never commit it, never commit a funded key.**