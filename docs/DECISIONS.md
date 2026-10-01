# Decisions — ADRs

Each entry: what was decided, why, what it costs, and what would reverse it.

---

## D1 — Absolute caps with short expiry, not rolling spend periods

**Status:** Accepted · **Date:** 2026-10-01

**Context.** TIP-1011 specifies rolling spend periods. Moderato's deployed `authorizeKey` has no
period field (verified: selector `0x203e2736` unrecognised; `0x54063a55` recognised).

**Decision.** Each key gets a **lifetime absolute cap per token** plus a **short expiry** —
12 hours for one-time keys, 7 days for standing keys. The key's *lifetime* is the window.

**Why.** It is the strongest guarantee Moderato actually provides. A $65 key that dies in 12
hours is strictly safer than a $65/week window, because it cannot be spent twice on different days.
**We would rather have less capability than a promise we cannot keep.**

**Cost.** No legitimate recurring-payment use case. Renewal requires a fresh customer signature.

**Reverses if.** Moderato deploys period support. Then re-evaluate — but lifetime caps likely
remain the better default for payouts.

---

## D2 — FlowRail never holds the customer's root key

**Status:** Accepted · **Date:** 2026-09-30

**Decision.** The customer signs key authorizations. FlowRail holds only the resulting short-lived
access keys.

**Why.** It is the entire product claim. A server that can mint arbitrary authorizations makes
every cap meaningless.

**Cost.** Every renewal needs customer interaction. UX cost is real and under-designed.

**Consequence to surface.** FlowRail therefore **cannot revoke a live key** (`revokeKey` is
root/admin-only). This must be disclosed before a customer authorizes, not discovered during an
incident. See `SECURITY.md` §4.

---

## D3 — One key per payee, never shared

**Status:** Accepted

**Decision.** N payees ⇒ N keys.

**Why.** Blast radius is per key. A shared key means one compromise drains the whole run. It also
makes scoping expressible: a key scoped to a single recipient is a clean invariant.

**Cost.** N signatures, N on-chain authorizations, more gas. Accepted — and it makes the
per-key blast-radius claim literally true.

---

## D4 — `dual` is for untrusted destinations, never for large amounts

**Status:** Accepted

**Decision.** Amount alone escalates `auto` → `finance`. Only a new or recently-changed address
produces `dual`.

**Why.** A large payment to a long-known address is a *size* problem. An unknown destination is a
*trust* problem. If `dual` means "big," it stops meaning "untrusted" and the tier stops doing work.

**Cost.** Someone occasionally approves a large amount through the `finance` queue. That is the
intended behaviour, not a gap.

---

## D5 — Hexagonal layering with a dependency-free domain

**Status:** Accepted

**Decision.** `domain/` imports nothing. Ports are interfaces. Only `adapters/` touch viem or the
filesystem.

**Why.** The policy layer decides whether a human approves a payment. It is the part where a bug
is catastrophic and unfalsifiable, and it is testable with no RPC and no keys. A flatter structure
would put `viem` within reach of a money-decision file.

**Cost.** More files; some ceremony for a 7-day build.

**On the 7-day deadline:** the spike is small. The layering pays for itself the moment anyone
debugs a policy bug without an RPC.

---

## D6 — Verify against the deployment, not the specification

**Status:** Accepted · **Date:** 2026-10-01

**Decision.** Every protocol claim must be labelled `VERIFIED` / `CONFIRMED` / `FROM-TIP` / `OPEN`.
Code targets Moderato's actual surface.

**Why.** TIPs describe more than is deployed. Code written against the canonical ABI reverts. This
was not a theoretical concern — it is exactly what happened: the deployed `authorizeKey` differs
from TIP-1011's.

**Cost.** Probes take hours. Cheaper than debugging a revert.

---

## D7 — Use `viem/tempo`, never hand-roll authorization

**Status:** Accepted · **Date:** 2026-10-01

**Decision.** All key authorization goes through `viem`'s first-class Tempo actions
(`accessKey.authorize`, `Account.fromP256`, `tempoActions()`).

**Why.** RLP encoding, digests, and signature types are not places for original work. viem's ABI
also **independently confirmed** our brute-forced deployed selector — a useful cross-check.

**Cost.** Coupling to viem's Tempo API, which is young.

---

## D8 — Do not use the `accounts` package's CLI

**Status:** Accepted · **Date:** 2026-10-01

**Decision.** Use the server-side pinned `secp256k1` adapter from the `accounts` package directly.

**Why.** The `accounts` CLI requires a browser Tempo Wallet device-code flow, which cannot run in
a terminal or in CI.

**Cost.** The spike root key is a raw private key on disk. Acceptable for a throwaway test
fixture; never acceptable for the product.

---

## D9 — Marketing site and product UI stay separate

**Status:** Accepted

**Decision.** `web/` is the landing page. The product UI is a separate app.

**Why.** Marketing chrome and product chrome have opposite jobs. Merging them means every landing
experiment risks the money-moving UI, and vice versa.

**Cost.** Two codebases. The landing is already done and stable, so this is cheap now and
expensive later.

---

## D10 — Ship the honest version of the claim

**Status:** Accepted · **Date:** 2026-10-01

**Decision.** Copy says what the protocol does: *lifetime cap, short expiry, one recipient, no
root key retained, customer-only revocation.* It does not say per-week limits, does not imply a
kill switch, and does not claim the memo prevents misrouting.

**Why.** This is a security product. The credibility of the pitch is the only asset that cannot be
rebuilt in a week. A single overstated claim discovered by a judge costs more than the claim earned.

**Cost.** A weaker-sounding pitch than a dishonest one. `PRODUCT.md` §5 is the exact wording ledger.