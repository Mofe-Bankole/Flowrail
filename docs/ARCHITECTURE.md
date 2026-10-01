# Architecture — the spike's layering

## The rule

```
domain/  →  ports/  ←  adapters/
              ↑
            app/
```

Dependencies point **inward only**:

- `src/domain/` imports **nothing**. Not viem, not `node:fs`, not the clock. Pure values and
  total functions over values.
- `src/ports/` imports only *types* from `domain/`. It declares interfaces; it implements none.
- `src/adapters/` implements ports. It is the **only** place that knows Tempo or the filesystem exist.
- `src/app/` composes ports. It imports interfaces, never adapters directly.
- `src/cli/` is a thin argument parser over `app/`.

## Why this shape, specifically

The payoff is not aesthetic. It is that **`domain/policy.ts` — the part that decides whether a
human must approve a payment — can be tested exhaustively with no RPC, no keys, and no network.**
That is the only part of FlowRail where a bug is catastrophic and unfalsifiable. Everything
else can be re-derived from a chain query; a policy bug silently pays the wrong person.

Two consequences that are load-bearing:

1. **The clock is a parameter, never a call.** `decideTier(payee, amount, now)` takes `now`.
   Time-dependent behaviour is then testable, and the caller can prove which timestamp it used.
   (`Note: `decideTier` currently ignores its `now` argument — see `HANDOFF.md` §4.3.`)
2. **Ports own the uncertainty.** `ChainPort.readKey` returns `OnChainKey`, and the doc comment
   at `ports/index.ts:80-82` flags that `scopes` absence *is* the fail-open decision. Uncertainty
   lives in one typed place rather than smeared across call sites.

## Adding a file — where does it go?

| You're writing | It goes in | Tested with |
|---|---|---|
| A type, an invariant, a threshold | `domain/types.ts` | Nothing. It must compile standalone. |
| A decision over existing values | `domain/policy.ts` | Plain `vitest`, no mocks. |
| A capability the domain needs from the world | `ports/index.ts` | Implementations in `adapters/`. |
| Anything touching viem, RPC, or `node:fs` | `adapters/<name>/` | Contract test against the port. |
| A sequence of steps (reconcile → authorize → execute) | `app/<use-case>.ts` | Fake ports. |
| Argument parsing and printing | `cli/` | Don't. |

**If you are about to import viem into `domain/`, stop.** That is the failure mode this layout
exists to prevent.

## Directory status

```
spike/src/
├── domain/
│   ├── types.ts            ✅ 99 lines.  Clean.
│   └── policy.ts           ⚠️ 129 lines. Two defects — HANDOFF.md §4.3
├── ports/
│   └── index.ts            ✅ 124 lines. The architectural centrepiece.
├── adapters/
│   ├── tempo/
│   │   ├── config.ts       ✅ 73 lines.  Every constant probed first-hand.
│   │   └── chain.ts        ⚠️ 244 lines. Three defects — HANDOFF.md §4.1, §4.2
│   └── local/
│       └── store.ts        ⚠️ 103 lines. Two defects — HANDOFF.md §4.4
├── app/                    ❌ NOT WRITTEN
├── cli/                    ❌ NOT WRITTEN  ← all 7 npm scripts point here
└── ../test/                ❌ NOT WRITTEN  ← zero tests exist
```

## Substitutions this layout is designed to survive

Each of these should touch `adapters/` and nothing else:

- **Moderato → Tempo mainnet**: `config.ts` chain id/RPC/explorer, plus whatever period support
  mainnet actually has. `domain/` and `app/` untouched.
- **JSONL ledger → Postgres**: new `LedgerPort` implementation. Ledger semantics live in the port.
- **File roster → a real database**: new `RosterPort`.
- **Local key file → KMS/HSM**: new `SignerPort`.

## Testing strategy, cheapest first

1. **`domain/policy.test.ts`** — pure, instant, no I/O. Write this first; it is the highest
   value-per-second test in the repo. Cover: each tier boundary, exactly-at-cap vs one-unit-over,
   amount parsing (`"65.00"`, `"0.000001"`, junk input), unresolvable payee IDs, and `keyUsableAt`
   at exactly the expiry second.
2. **Port contract tests** — assert an adapter's shape without a network.
3. **Live probes** — `spike/SPIKE.md`. Explicitly *not* part of `npm test`; they need funds,
   cost time, and Moderato resets.

## Conventions

- ESM throughout (`"type": "module"`). **No `require()`** — it does not exist here (`HANDOFF.md` §4.4).
- `.js` extensions on relative imports (NodeNext).
- BigInt for base-unit amounts. Formatting (`fmt`) is display-only and must never round-trip back
  into `parseAmount`.
- 6 decimals everywhere. `TOKEN_DECIMALS` is the constant.
- `strict: true`, `noEmit: true`, `tsx` for running TS directly.
- Thresholds live once, in `POLICY`. Never duplicate a number in UI copy.
- No comments explaining *what*; comment *why* and *what was verified on-chain*.