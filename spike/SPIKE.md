# Spike status — the protocol investigation

_Last updated 2026-10-01. Protocol findings live in `docs/PROTOCOL.md`; this file tracks what has
actually been **executed** and what remains._

---

## 1. Status summary

| Area | State |
|---|---|
| Chain constants | ✅ Probed |
| Access-key selectors | ✅ Probed + independently confirmed against viem's ABI |
| Events | ✅ Observed in live logs |
| TIP-1011 / TIP-1053 read | ✅ Read, not vendored |
| Root account generated | ❌ **No** |
| Faucet called | ❌ **No** |
| Key authorized | ❌ **No** |
| `getKey` populated | ❌ **No** — layout unknown |
| **Fail-open probe** | ✅ **Answered. Fresh key is unrestricted.** |
| **Period probe** | ❌ **Not started.** |
| CLI | ❌ Not written |
| Tests | ❌ None |

**Nothing under `spike/src/` has been executed.** There is no evidence it compiles.

## 2. What has been executed

1. `keccak256` selector derivation over TIP-1011 candidate signatures.
2. Live `eth_call` probes of the account precompile, distinguishing recognised from unrecognised
   selectors (unrecognised selectors produce a distinct error).
3. A brute-force sweep that recovered the deployed 5-parameter `authorizeKey` and the
   no-token-argument `updateSpendingLimit`.
4. A live log scan that decoded `KeyAuthorized` / `KeyRevoked`.
5. Confirmation that `viem@2.57.2` publishes exactly the `authorizeKey` ABI recovered in (3).

**Caveat:** the probe scripts live in `/tmp/opencode/` (`compute-selectors.py`, `probe4.py`–
`probe7.py`) — **outside the repo, and likely gone.** The recovered selectors are hardcoded in
`spike/src/adapters/tempo/config.ts`, so the *results* survive even if the scripts do not. If the
scripts are needed again, re-derive from `docs/PROTOCOL.md` §3.

## 3. The three open questions

### Q1 — Does a fresh key default to unrestricted? ⚠️ highest priority

**Why it matters:** `authorizeKey` on Moderato takes no scopes, so scoping is a second
transaction. If a fresh key defaults to unrestricted, there is a live window in which a key can
be spent against anything.

**How to test:**

1. Generate a root key, fund it. (`agent:new`, `faucet`.)
2. Authorize an access key with `limits` set and `scopes` **omitted**.
3. Confirm on-chain, then `getKey` / `getAllowedCalls` for the new key.
4. Attempt an allowed operation **before** calling `setAllowedCalls` — e.g. `balanceOf` on
   pathUSD, which is harmless.
5. Also try `authorize` with `scopes: []` and see whether it changes the default.

**Outcomes:**

| Result | Meaning | Action |
|---|---|---|
| Harmless call succeeds | Defaults unrestricted | **Fail-open.** Must scope immediately after authorizing; never mint into a live path. |
| Harmless call reverts | Defaults to no-calls | Safe by default. Document it. |
| `scopes` in authorization changes behaviour | Scoping is enforced off-chain pre-registration | Best case; the window may not exist |

**Answered 2026-10-01. `VERIFIED`.** A key authorized with a pathUSD cap and no
`setAllowedCalls` spent 1 base unit of pathUSD to an arbitrary address.

**Lock confirmed later the same day. `VERIFIED`.** After `setAllowedCalls` restricted
`transfer` to one address:

- Key: `0x0c4f3a56bf8b750fa1f6eb3df8db65a47fa17231`
- Authorization: `0x7b2f72123d4f6b448809fcb5c80cb16887951d3416357ec325e1165c163569de`
- Lock: `0x0b156dd779e0c9ffa64c0ef1a019f98018cead856946c0466ed4d7f4d3c29579`
- Allowed spend succeeded: `0x09acb34e21bf26df67d68293cff406032bb67dbc6724f9b25008cc231aadf4f4`
- Denied spend reverted. The recipient lock is the control. The cap is not.

- Root: `0xd8BB65b3a8e316478c0ae94Cc0cad5C0517729ad`
- Key: `0xa3e2736c3afd1525207140a5ea0ede40be0f0b87`
- Authorization tx: `0x9dcff13a6f0bbf65c2988f303fdd1e62cd38fff007dce244f7bdbef73eaa3aed`
- Spend tx: `0xa809a8dbf4f0f5df47dabf4c348fa9f98f8cbae53a46ddcf5caab3424b7f4715` (status 1)
- Receipt `from` is the root, not the key. The key signs for the agency account.

`getAllowedCalls` on an earlier unscoped key returned an empty list
(`0x…0040…0000`). An empty list is not a deny. Do not treat it as scoped.

Mitigation: call `setAllowedCalls` in the same user flow, before any code path
can use the key. A key with no confirmed scope is not usable.

### Q2 — What happens to a `period`?

`viem`'s `limits[].period` type accepts a period. The deployed ABI has no period field.

**How to test:** authorize with a short period (e.g. 60s). Then either:

- The call **reverts** → period unsupported; the canonical model is unavailable on Moderato.
- The call **succeeds** → test whether a cap is actually restored after the period elapses
  (spend to the cap, wait, retry). This requires waiting out a real window.

**Outcome determines the product claim.** If period is ignored, FlowRail's copy must be
lifetime caps only. This is already reflected in `docs/PRODUCT.md` §5, but confirm rather than assume.

### Q3 — What is `getKey`'s 160-byte layout?

For a nonexistent account it returned **160 zero bytes**. The populated layout is unknown.

**How to test:** once any real key exists, call `getKey` and diff against the zero baseline.
Compare against `ox`'s or viem's `Abis` if a typed version is published.

**Until answered:** `OnChainKey` (`src/ports/index.ts:74-83`) is a guess. Do not render decoded
key fields in the UI from it.

## 4. Known code defects blocking the probes

Fix `HANDOFF.md` §4.1 first — it is a hard blocker.

| Defect | Location | Blocks |
|---|---|---|
| `authorizeKey` ignores requested `keyId`, generates a random one, returns only a tx hash | `chain.ts:96` | **Everything.** Cannot address a key. |
| `setAllowedCalls` reads `input.keyId`, which is not in `SetAllowedCallsInput` | `chain.ts:189` | Scoping probes |
| `escalationReason` mis-typed; over-dual-cap mislabelled; two variants dead | `policy.ts:86-94` | Audit-trail correctness |
| `require()` in ESM | `store.ts:83` | `toJsonl()` |
| `this.all()` in `put` | `store.ts:98` | Fragile roster writes |
| `viem: "^2.37.0"` below `accounts`' peer floor | `package.json` | Install reproducibility |

## 5. Planned CLI surface

`spike/package.json` already declares these scripts. **`src/cli/index.ts` does not exist** — all of
them currently fail.

| Script | Purpose |
|---|---|
| `agent:new` | Generate a throwaway root key into `.data/agent.json` (mode 0600) |
| `faucet` | `tempo_fundAddress` over raw RPC; log the result |
| `probe:chain` | Confirm chain id, head block, pathUSD balance |
| `keys:authorize` | Authorize one key with explicit cap + expiry + scopes |
| `fleet:authorize` | Authorize a whole run's fleet from an invoice |
| `probe:boundaries` | Over-cap / wrong-recipient / expired-key reverts — **the real security evidence** |
| `probe:period` | The Q2 experiment |
| `test` | `vitest run` — **currently zero test files, so it exits non-zero** |

Suggested additions: `roster:seed` (deterministic 40-payee demo data) and `demo:reseed`
(the Moderato-reset recovery path — treat as a deliverable, not a nicety).

## 6. Ground rules for probing

1. **Throwaway keys and addresses only.** Never fund an address you intend to keep.
2. **Keep tx hashes in this file.** Moderato resets; the hashes are the durable evidence.
3. **Probe with harmless reads** (`balanceOf`) before anything that moves funds.
4. **Record outcomes in §3 tables**, not in chat history. Chat is not durable.
5. **Do not trust a probe that "probably worked."** Confirm on-chain with a second call.