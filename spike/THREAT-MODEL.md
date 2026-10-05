# Threat model

Scope: the `spike/` protocol spike and the policy decisions it encodes. Not a
production security review — nothing in this repo has been reviewed by anyone but
its author, and the product UI is a demo over a generated fixture.

Written 2026-10-05. Read `docs/PROTOCOL.md` first: several risks below are only
live because Moderato does not implement the upstream TIP.

## What we are protecting

An agency holds one Tempo account. A customer approves a payout run. FlowRail
derives per-recipient access keys from that approval and spends from them. The
money is pathUSD, and the balance is the agency's operating float.

The asset we care about is not the access keys. It is the **agency's balance**,
and the specific failure we care about is *money leaving towards an address the
customer never approved*.

## Trust boundaries

| Boundary | Enforced by | Trusted? |
|---|---|---|
| Customer approval → key authorization | FlowRail, in `app/engine.ts` | No. This is our code and it is the whole attack surface. |
| Key cap / recipient lock / expiry | Tempo precompile, on-chain | Yes. Reverts regardless of what we think. |
| Approval event → ledger | FlowRail append-only JSONL | No. Plaintext, single-writer, no integrity check. |
| Engine → web artefact | zod schema at both ends | Partly. Validated, but unsigned. |
| Ledger → on-chain truth | reconcile, on demand | No. Drift is detected only when someone looks. |

The second row is the reason this product is worth building: the irreversible
step is enforced by a contract, not by us. Everything that can go wrong before
it happens in our process and our code.

## Threats

### T1 — One approval authorises a payee the customer never saw

**Status: mitigated.**

`approve()` keyed on `payeeId`. A payee can appear on several invoice lines, and
matching on the payee approved every one of them. A human clearing a $65 vendor
line also cleared the $2,500 `dual` line on the same invoice.

Fixed by `RunLeg.legId` — unique per invoice line — and `approve(run, legId)`,
which throws on an unknown id rather than returning an unchanged run. A silent
no-op is indistinguishable from a successful approval, and the caller has a bug
either way.

Residual: `legId` is a display key derived from payee id and an occurrence
counter. It is stable for a given run and not globally unique, which is fine
because it is only ever resolved within one run.

### T2 — Reclassified escalation after approval

**Status: mitigated.**

Escalation was inferred by matching substrings of human-readable reason prose
(`'dual cap'`, `'address only stable'`). Rewording a message silently changed
which escalation was recorded on-chain. A reviewer reading the ledger could be
shown `amount_over_auto_cap` for a payment the engine had actually held as
`dual`.

Fixed with `FindingCode`: an explicit union on `TierDecision.findings`. The
prose is now explicitly documented as not-an-interface, and the exporter asserts
every non-`auto` leg records at least one code and every `auto` leg records
none.

### T3 — Stale recipient lock

**Status: open, low.**

`setAllowedCalls` pins a key to a recipient at authorization time. If a payee's
address changes afterwards, the existing key still points at the old address and
the new one needs a fresh lock. There is no reconciliation between the roster
and on-chain locks, so a stale lock is invisible until a payment fails.

`docs/HANDOFF.md` records address-change handling as unimplemented. `Payee` has
an `escalation.reason === 'address_changed'` member but nothing produces it,
because nothing detects the change. The union member is forward-looking
vocabulary and currently unreachable.

### T4 — Receipt race widens the authorization window

**Status: open, medium.**

`authorizeFleet` reads each key from chain after authorizing it, waits for the
`receipt`, then reads it again to confirm it exists. Nothing serializes those
calls across keys. Under load, later keys can be observed authorized while an
earlier receipt is still pending — a window where more of the fleet is live than
`readyToAuthorize` believes.

The probe in `cli/index.ts` acknowledges this and works around it by hand. That
workaround is not in `authorizeFleet`, because doing it correctly means deciding
what "authorized" means when receipts are still in flight — a design question,
not a missing `await`.

### T5 — Root key compromise is total

**Status: accepted for the spike.**

`.data/agent.json` is a plaintext secp256k1 key. If it leaks, the entire balance
is spendable and every access key can be revoked or forged. There is no
encryption at rest, no KMS, no hardware signing, and no second factor.

This is a deliberate spike trade-off: the key exists to get out of the way of
protocol work. It must not survive into production, where the root should be a
wallet the customer's key material controls and FlowRail never holds.

Mitigations that are in place:

- `readAgent()` now **refuses to load** a key file that is group- or
  world-readable. `writeFile`'s `mode` only applies at creation, so the mode is
  re-asserted on write and re-checked on read. This catches a permissive umask, a
  restored backup, or a manual `chmod`.
- `keys:rotate <oldKeyId> <cap> [ttlHours]` replaces a live access key: mint,
  confirm on-chain, *then* revoke. That order means there is no instant where
  neither key works.
- `agent:rotate` exists but requires `--yes` and says plainly what it does.

### T6 — `agent:rotate` is not a secret rotation

**Status: documented, not a vulnerability.**

A Tempo account *is* its public key. Generating a new one does not move funds —
it creates a different account with a zero balance. Anyone reaching for a "rotate
the secret" command expecting "new key, same account" strands their balance.

`agent:rotate` therefore prints what is about to happen and exits non-zero
without `--yes`. It never writes the old private key anywhere else, and records
the retired *address* (not the secret) to `.data/retired-agents.json` so the old
account's access keys remain reachable for revocation.

### T7 — `PolicyForbids` is not bypassed

**Status: open, blocking.**

Fresh recipients on pathUSD cannot be paid: `optInToPolicy(1)` reverts
`0xaa4bc69a` (`PolicyForbids`), and `changeTransferPolicyId(1)` returns
`Unauthorized`. Every successful probe used a recipient who had already opted in.

The unimplemented path is paying a brand-new recipient from a pathUSD balance.
Until that is understood, FlowRail cannot onboard a new payee on mainnet, and no
part of the code should attempt to work around it.

### T8 — Replay and nonce

**Status: deferred by design; not applicable today.**

The approval event has no nonce because the flow is serial: one approval, one
`authorizeFleet`, one `executeBatch`. Adding a nonce field that nothing verifies
would imply a guarantee we do not have.

It becomes real the moment settlement is asynchronous — a webhook, a retry, a
concurrent operator. The specific hazard is `executeBatch`, which sets each
transfer's cap to the leg's **exact** amount. Replaying a batch after one leg has
paid would leave later legs reverting on the cap rather than double-spending,
because cap is consumed. That is an accidental mitigation, not a designed one, and
it should not be relied on.

When settlement goes async this needs a nonce and single-use settlement state.
Recorded now so the retrofit is expected rather than discovered.

### T9 — No rate limiting

**Status: not applicable; deliberately not faked.**

There is no API, no server, and no session. Rate limiting a CLI that a human runs
against a testnet would be theatre. There is nothing to limit.

It becomes real with the signature session: a nonce endpoint is a free, cheap,
unauthenticated POST target, and needs rate limiting, per-nonce TTL, and
single-use consumption at the same time.

### T10 — The artefact is unsigned

**Status: open, low.**

`web/src/lib/demo-run.json` is generated by the engine and validated by zod at
both ends. Validation is not authentication: anyone who can edit the file can
change what the product UI claims to have decided — `tier`, `approved`, `reason`,
and the exported `policy` thresholds all.

Mitigated for now by the fact that it is regenerated by `npm run demo:export`
and its invariants are asserted at export time. It must never become a source of
truth for real runs. The real artefact must be signed, or served from the
authority that produced it.

## Accepted for the demo

| Risk | Why acceptable now |
|---|---|
| Plaintext root key on disk | Spike only. Never production. See T5. |
| Ledger is plaintext JSONL | No integrity guarantee; a real ledger needs append-only storage with a hash chain. |
| No auth on the product UI | `/app` renders a generated fixture. Nothing is real. |
| `PolicyForbids` unfixed | Blocks real payouts. Not worked around. See T7. |
| `executeBatch` unavailable | Verified absent on Moderato. **Not** assumed absent on Tempo mainnet — re-probe before touching the code. |
| `generatedAt` is a constant | `2026-01-01T00:00:00.000Z` from the demo clock. It is not a processing time. |

## Before any real money moves

1. Resolve T7. No onboarding path, no product.
2. Move the root key out of the process (T5). Customer-held, never server-held.
3. Decide settlement's consistency model, then implement the nonce that model
   requires (T8).
4. Sign the artefact, or serve it from the deciding authority (T10).
5. Reconcile roster addresses against on-chain locks and alert on drift (T3).
6. Fix T4 in `authorizeFleet`, not in a probe.
7. Re-probe `executeBatch` on mainnet before relying on or deleting it.
