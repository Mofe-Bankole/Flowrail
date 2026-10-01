# Handoff — exact state, where work stopped, what to do next

_Written 2026-10-01. Read this before anything else._

---

## 1. Product is confirmed

The user confirmed `docs/PRODUCT.md` §8 on 2026-10-01. The agency is the customer. Amount alone
never produces `dual` (`DECISIONS.md` D4). Screens may be built from that spec.

## 2. Where work actually stopped

Mid-way through writing `spike/src/cli/index.ts`. The write was interrupted. Consequences:

- **All 7 npm scripts in `spike/package.json` point at a file that does not exist.** Every
  script except `npm test` fails immediately.
- `npm test` runs `vitest run` with **zero test files**. Vitest exits non-zero on no tests.
- Nothing under `spike/` has ever been executed. There is no evidence it compiles.

The last verified working action was installing dependencies and confirming the `viem/tempo`
export surface.

## 3. What exists and is trustworthy

| Path | Lines | Trust |
|---|---|---|
| `spike/src/domain/types.ts` | 99 | Good. Types + policy constants. Clean. |
| `spike/src/domain/policy.ts` | 129 | Mostly good. Two defects, §4.2. |
| `spike/src/ports/index.ts` | 124 | Good. This is the architectural centrepiece — read it. |
| `spike/src/adapters/tempo/config.ts` | 73 | **Best file in the repo.** Every constant probed first-hand. |
| `spike/src/adapters/tempo/chain.ts` | 244 | Sketched, never run. Three defects, §4.1. |
| `spike/src/adapters/local/store.ts` | 103 | Sketched, never run. Two defects, §4.3. |

`config.ts` is worth trusting because its selectors were derived by brute-force probing of
the live precompile and then **independently confirmed** to match viem's own published ABI
(see `docs/PROTOCOL.md` §4).

## 4. Known defects — fix these first

Ordered by how much damage they do. All are real; none have been fixed.

### 4.1 `chain.ts` — `authorizeKey` ignores the key you asked for

`src/adapters/tempo/chain.ts:96` generates a **fresh random** P-256 access key via
`Account.fromP256(generatePrivateKey(), …)` on every call and ignores `input.keyId`
entirely.

Consequence: **the caller cannot learn which key was actually authorized.** You cannot build
a key fleet, because the fleet cannot be addressed. This blocks the core feature.

Fix: either derive the access key deterministically from the input, or return the derived
`keyId` from `authorizeKey` (change the port's return type — it currently returns a tx hash).

### 4.2 `chain.ts` — `setAllowedCalls` reads a field that is not in its input type

`src/adapters/tempo/chain.ts:189` does `(input as unknown as { keyId: Address }).keyId`, but
`SetAllowedCallsInput` in `src/ports/index.ts:59-62` is `{ account, scopes }` — **there is no
`keyId` field.** This passes `undefined` to `encodeAbiParameters` and will throw.

The double cast is there to hide the mismatch. That is the smell. Fix the type: `setAllowedCalls`
needs a `keyId`. Decide whether `account` is redundant (the chain presumably derives it) and
simplify.

### 4.3 `policy.ts` — `escalationReason` is wrong and mis-typed

`src/domain/policy.ts:86-94`:

```ts
function escalationReason(d: TierDecision): Payout['escalation'] extends infer E ? … : never
```

- The signature is a nonsensical conditional-type trick that does not actually produce the
  `reason` union. It happens to compile because of the `infer` indirection.
- `:92` tests `r.includes('dual cap')` and then returns `'amount_over_auto_cap'`. An amount
  over the **dual** cap is not the same event as one over the **auto** cap, and the audit
  trail will misreport it.
- `'address_changed'` and `'aggregate_over_run_cap'` (both declared in
  `src/domain/types.ts:59`) are **never returned**. They are dead variants.
- `decideTier(payee, amount, now)` takes `now` and **never uses it** (`policy.ts:17`). If
  `noUnusedParameters` is ever enabled, this breaks the build.

Fix: add `amount_over_dual_cap` to the union, return it, and either implement or delete
`'address_changed'` and `'aggregate_over_run_cap'`.

### 4.4 `store.ts` — `require()` inside an ESM module

`src/adapters/local/store.ts:83` calls `require('node:fs')`. `spike/package.json` sets
`"type": "module"`, so **`require` is not defined**. `toJsonl()` throws at runtime.

Also `:98` — `createJsonRoster.put` calls `this.all()`. That silently breaks if the method is
ever destructured (`const { put } = roster`). Capture `const self = this` or close over a
local `all`.

### 4.5 `package.json` — wrong viem range

`"viem": "^2.37.0"` but `accounts@0.19.0` requires `>=2.56.9`, and `2.57.2` is what resolved.
`^2.37.0` permits versions `accounts` cannot use. Pin `^2.57.2`.

## 5. The three open protocol questions

These are the only unknowns that block real work. Everything else is settled.

1. **What does a fresh key default to before `setAllowedCalls` runs?** Moderato's
   `authorizeKey` takes no scopes parameter, so scoping happens in a *second* transaction.
   If a fresh key defaults to unrestricted, there is a setup window where the key can be
   used against anything. **`accounts`' own semantics say `scopes: undefined` = unrestricted.**
   This is the single biggest security risk in the design. **Test it first.**
2. **Does an authorization carrying `period` get rejected, ignored, or downgraded?** viem's
   `limits[].period` type accepts a period; the deployed precompile ABI has no period field.
   Answer determines whether the canonical windowed model is recoverable at all.
3. **What is `getKey`'s 160-byte layout?** It returned all-zero for a nonexistent key.
   Without a populated sample the port's `OnChainKey` shape is a guess.

See `spike/SPIKE.md` for the probe scripts and how to run them.

## 6. Suggested order of work

1. **Confirm the product** with the human (§1). Two minutes of their time, unblocks everything.
2. Fix §4.1 — `authorizeKey` must return the key it authorized. Nothing else is worth doing
   until you can address a key.
3. Write `spike/src/cli/index.ts` with just `agent:new`, `faucet`, `probe:chain`. Get a funded
   account and a confirmed pathUSD balance. **This unblocks all three open questions.**
4. Run the three probes. Record results in `spike/SPIKE.md`. Kill or accept the period model.
5. Fix §4.2–4.5 while probes run.
6. Write the first real test (`test/domain/policy.test.ts`) — pure, fast, no RPC.
7. Only then: `src/app/` use cases, then UI.

## 7. Things that will bite you

- **Moderato may reset.** Demo keys, balances, and event evidence can vanish. Re-run
  `spike/probe/` and keep tx hashes in `spike/SPIKE.md` so evidence survives the reset.
- **Never commit key material.** `spike/.data/` is gitignored. Check before every commit.
- **`accounts`' CLI is unusable here.** It requires a browser Tempo Wallet device-code flow.
  Use the server-side pinned `secp256k1` adapter from the `accounts` package instead.
- **Do not use `admin: true`** when authorizing keys. Admin keys are **unrestricted and ignore
  `expiry`, `limits`, and `scopes`** (viem documents this; it requires the T6 hardfork). It is
  the exact opposite of what FlowRail needs.
- **The parent directory `/home/mofebanks` is a different git repo** (`neet.git`). Work only
  inside `flowrail/`.

## 8. Provenance of the protocol facts

Every `VERIFIED` fact in `docs/PROTOCOL.md` came from first-hand probes against
`https://rpc.moderato.tempo.xyz` on 2026-10-01 (chain id 42431, head ≈ block 37,681,427).
Probe scripts live in `/tmp/opencode/` (`compute-selectors.py`, `probe4.py`–`probe7.py`) —
these are **outside the repo and may be gone**. If they are, re-derive from
`docs/PROTOCOL.md` §4; the selectors themselves are already hardcoded in `config.ts`.

TIP sources (re-fetch to confirm; they were read, not vendored):

- `https://raw.githubusercontent.com/tempoxyz/tempo/main/tips/tip-1011.md`
- `https://raw.githubusercontent.com/tempoxyz/tempo/main/tips/tip-1053.md`
- `https://accounts.tempo.xyz/docs/guides/spend-permissions`