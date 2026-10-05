# Knowledge transfer — FlowRail

The context that is **not** recoverable by reading the code: why it is shaped this
way, what the traps were, which claims are load-bearing, and what is still open.

Verified against the tree on **2026-10-05**.

---

## 0. Read this first

> **Tempo's canonical TIP documents and the Moderato deployment disagree.**
> Building against the TIP produces code that reverts.

This one fact explains most of the strange-looking code in `spike/`. Every
protocol claim is labelled `VERIFIED`, `FROM-TIP`, or `OPEN`. Do not let an
unlabelled assumption through. Full detail in [`PROTOCOL.md`](PROTOCOL.md).

Two supporting documents:

| | |
|---|---|
| [`PROTOCOL.md`](PROTOCOL.md) | What Tempo actually deploys vs what the TIP specifies |
| [`spike/THREAT-MODEL.md`](../spike/THREAT-MODEL.md) | Threats enumerated, and which are actually fixed |

---

## 1. The product in one paragraph

An agency holds one Tempo account and receives client payments. Once a month it
must pay out to dozens of freelancers, creators and vendors. Today a human
eyeballs every line and approves a batch. FlowRail's claim is that **most lines
need no human at all** — one signature releases the whole run, and the lines that
cannot clear themselves are held for that signature.

The mechanism is deliberately not a smart contract FlowRail wrote. It is Tempo's
own access-key primitive: the customer authorizes a fleet of narrowly scoped keys,
and **the chain** enforces recipient, amount and expiry. FlowRail is the thing
that decides, explains and proves — not the thing that guards the money.

That distinction is the whole product. See D2 and D7 in [`DECISIONS.md`](DECISIONS.md).

## 2. The one rule

```
address tenure < 7 days        -> dual      (irreversible: unvouched destination)
amount > $500                 -> finance   (a size problem, not a trust problem)
otherwise                     -> auto      (releases on its own key)
```

**The `$2,000` dualCap is not a tier.** This is the most commonly misread piece
of the codebase. Exceeding it escalates to `finance`, never to `dual`.

The reasoning: an escalation is a claim about *trust*. `dual` is reserved for the
irreversible case — a destination nobody has vouched for. A large payment to a
long-standing payee is a size question a human should answer, not a trust
question. Merging the two would tell a reviewer that a known counterparty is
unvouched for. Locked in as D4.

## 3. Vocabulary

These words mean something specific and are easy to get wrong:

| Term | Means |
|---|---|
| **Payee** | A trusted counterparty in the roster. Has an address and a *tenure* — how many days that address has been stable. Tenure, not age, is what gates trust. |
| **Invoice line** | One row of an invoice: a payee plus an amount. |
| **Payout** | The output of reconciling a line. One line → one payout. Duplicate lines stay separate. |
| **Run leg** | A payout plus its tier, findings and approval state. What a human actually approves. **One leg per invoice line.** |
| **`legId`** | Unique per leg within a run: `ada`, then `ada#2`. Not a `payeeId` — see §6. |
| **Finding code** | Machine-readable *why*: `unstable_address`, `amount_over_auto_cap`, `amount_over_dual_cap`. Program logic branches on these. |
| **`reasons`** | Human-readable prose beside the codes. **Never parse it.** See §6. |
| **Prepared key** | An authorized access key, its scope tx, and its private key. What `authorizeFleet` returns. |
| **Memo** | 32 bytes on a TIP-20 transfer encoding the payee id, so a relayer cannot reroute a payment. |

## 4. How Tempo actually behaves

Everything here was probed first-hand against `https://rpc.moderato.tempo.xyz`
on 2026-10-01. Chain id `42431`.

### 4.1 The deployed ABI is not the canonical one

`authorizeKey` is deployed in its **5-parameter** form. TIP-1011's richer form —
with a per-token spending period and inline scopes — is **absent**, even though
viem's own `limits[].period` type accepts a period. Passing one type-checks and
reverts.

Absent on Moderato, recorded in `TEMPO_ABSENT_ON_MODERATO` so nobody re-derives it:
`authorizeKeyWithPeriodAndScopes`, `getRemainingLimit`,
`updateSpendingLimitPerToken`, `getKeyInfo`.

**Consequence:** absolute caps only, no rolling windows. That is D1.

### 4.2 What the chain enforces (this is the good news)

Verified by five *rejections*:

- A key locked to one recipient **cannot pay a second recipient**.
- The authorized amount is a **hard ceiling**.
- **Expiry is enforced by the chain**, not by us.

This is why the product is worth building. The irreversible step is a contract
invariant. FlowRail does not have to be trusted with the money.

### 4.3 The fail-open window (the highest risk in the design)

**A freshly authorized key is unrestricted until `setAllowedCalls` lands.**

Verified: a key authorized with a cap and *no* recipient list successfully paid
an address that was never allowlisted. The cap held. The recipient did not.

So there is a real window between `authorizeKey` and `setAllowedCalls` where a
key can move money to anyone, up to its cap. Two things make this survivable, and
one thing is still missing:

1. Caps are set to the **exact leg amount** at authorization, so the blast radius
   is one line, not the balance.
2. TTLs are short — 12 hours for anything escalated.
3. **Missing:** `authorizeFleet` does not wait for the authorization receipt
   before scoping. See §6.

### 4.4 `PolicyForbids` — the blocker

pathUSD gates recipients it has not seen:

- `optInToPolicy(uint64)` reverts `0xaa4bc69a` (`PolicyForbids`)
- `changeTransferPolicyId(uint64)` returns `Unauthorized`

Every successful probe used a recipient who had **already opted in**. So there is
currently **no path for paying a brand-new payee** on pathUSD.

Nothing works around this, deliberately. Until it is understood, FlowRail cannot
onboard anyone, and no code should try to be clever about it.

### 4.5 No atomic batch on Moderato

`wallet_sendCalls` and the batch surface are absent; verified by a revert. Every
payout is therefore its own transaction, and **all-or-nothing settlement does not
exist on this network**.

Unverified for mainnet. Do not assume it is absent there, and do not delete
`executeBatch()` before re-probing.

### 4.6 Network facts worth carrying

| | Moderato (current) | Tempo mainnet |
|---|---|---|
| Chain id | `42431` | `4217` |
| RPC | `https://rpc.moderato.tempo.xyz` | `https://rpc.tempo.xyz` |
| Explorer | `https://explore.testnet.tempo.xyz` | `https://explore.tempo.xyz` |

`TEMPO_MAINNET_CHAIN_ID = 4217` is declared in `config.ts` and **unused** — the
repo is wired to Moderato end to end. Mainnet reportedly went live 2026-03-18
and Tempo has no native gas token, so wallets may display a placeholder balance.
Those two facts come from external research, not first-hand probing, and should be
re-verified before anything depends on them.

## 5. Architecture, and why it is shaped this way

Hexagonal, with one dependency rule: **`domain/` imports nothing from the
project.** `app/` depends only on `ports/`. Only `adapters/` know Tempo or the
filesystem exist.

The payoff is concrete: the entire policy engine — tiering, escalation,
reconciliation, per-leg approval — runs in tests against in-memory fakes, with
no RPC. That is why the test suite is fast and network-free.

### 5.1 The web app does not import the spike

`web/` reads a **generated artefact**, `web/src/lib/demo-run.json`, produced by
`npm --prefix spike run demo:export`.

Not a stylistic choice. Vercel has no sibling checkout and no child process, so
importing the spike or shelling out to it cannot work in production. The artefact
is the only thing that crosses the boundary.

The cost is that the artefact can drift from the engine. Two defences, both now in
place: a zod schema at the **writer** (`spike/src/domain/artefact.ts`, refuses to
write an invalid file) and a zod schema at the **reader**
(`web/src/lib/demo.ts`, refuses to load one). The old code cast — `raw as
DemoRun` — which meant a shape change surfaced as `undefined` inside a component,
or a headline reading "NaN payees".

## 6. Traps that cost real time

These are the bugs that are easy to reintroduce because the code *looks* fine.

### 6.1 Never derive behaviour from prose

Escalation used to be classified by matching substrings of human-readable
reasons:

```ts
if (d.reasons.some((r) => r.includes('address only stable'))) return 'new_payee'
```

Rewording a user-facing message silently changed which escalation was recorded
on-chain. A reviewer reading the ledger could be shown `amount_over_auto_cap` for
a payment the engine had actually held as `dual`.

Fixed with `FindingCode`, and the exporter now asserts that every non-`auto` leg
records at least one code and every `auto` leg records none. **The general rule:
if a string is shown to a human, it is not an interface.**

One instance of the same trap is **still live**, at `desk.tsx:311`:

```ts
const held = /rejected|did not hold/.test(r.why);
```

Probe rows are marked "held" or "not held" by matching the prose of `why`.
Harmless today because those strings are hand-written in `lib/desk.ts`, but it
is the same pattern and should become a status field.

### 6.2 One payee can be several lines

This was the worst bug in the repo. `approve(run, payeeId)` matched on the payee
and approved **every leg for that payee at once**. Clearing a $65 vendor line also
cleared the $2,500 escalated line on the same invoice. One click, two approvals.

`reconcile` emits one payout per invoice line — duplicate lines are *not* merged
(merging would hide which line a human cleared). So multi-line payees are normal,
and `legId` (`ada`, `ada#2`) exists so each line has its own identity.

`approve()` now takes a `legId` and **throws** on an unknown one. A silent no-op
is indistinguishable from a successful approval, and the caller has a bug either
way.

`executeBatch()` is still keyed by `payeeId` and so does **not** support
multi-line payees — the map collapses them and later legs fail the lock check.
It fails closed, which is acceptable, but it must be redesigned together with
`PreparedKey`, not patched alone.

### 6.3 The receipt race is worked around in the wrong place

`authorizeFleet` reads each key back after authorizing, waits for the receipt,
and reads again. Nothing serializes this across keys, so later keys can be
observed live while an earlier receipt is still pending — a window where more of
the fleet is authorized than `readyToAuthorize` believes.

The mitigation lives in `cli/index.ts` as a hand-written wait, **not** in
`authorizeFleet`. That is intentional for now: doing it properly means deciding
what "authorized" means while receipts are in flight, which is a design
question, not a missing `await`.

### 6.4 Copying a number is creating a second source of truth

The auto cap `$500` and the tenure window `7d` were hardcoded in **four** places
— the engine, the desk, the split, and two landing-page scenes. Raise the cap in
the engine and the UI would keep drawing a gate that no longer exists, showing a
reviewer a threshold that is not being enforced.

All of them now read `run.policy`, which the exporter emits alongside the legs.
Rendered output is unchanged.

Same class of bug: the desk rendered the literal string "The other 39 need nothing
from you". That is now computed. It is a demo fixture of 40, not a product
requirement.

### 6.5 Money is `bigint`, JSON is not

`parseAmount` parses human decimals to 6dp `bigint` and **throws** on anything it
does not recognise, rather than paying zero. `fmt` strips trailing zeros, so
`65000000n` renders as `"65"`, not `"65.00"`.

The artefact therefore carries amounts as **decimal strings**, and the schema
rejects a number — a JSON number that large has already lost precision somewhere.

### 6.6 Dividing by a leg that may be zero

The split draws the cap marker at `cap / heldValue`. With no held lines that is
division by zero, and with a held total *below* the cap the marker sits off the
end of its own segment. It is drawn only when `heldValue >= cap`.

## 7. Product truth discipline

D10 in [`DECISIONS.md`](DECISIONS.md) is "ship the honest version of the claim",
and it has teeth:

- **No "Classify" button.** Removed in `320dec0`. It called `classifyInvoice()`,
  which takes no arguments and returns static JSON — it classified nothing, and
  its POST/refresh produced no visible change. The desk is server-rendered from
  the engine's output instead.
- **The signature button says what it does.** It is labelled "Connect to sign",
  and the copy states that signing is not wired to a contract yet and that
  settlement is blocked on the transfer policy. It must not imply otherwise.
- **`generatedAt` is the fixed constant `2026-01-01T00:00:00.000Z`** from the
  demo clock. It is not a processing time, and must not be described as one.
- **The unresolved lines are named, not just counted.** The desk renders
  `vendor-041` and its amount, because "1 unresolved" is not actionable.

The test: could a visitor screenshot this screen and be materially misled? If yes,
fix it before shipping, not after someone points it out.

## 8. Wallet reality

`web/src/lib/wallet.ts` uses the **top-level** `accounts` package's
`tempoWallet()` adapter with `Provider.create`. This is the correct
postMessage transport for Tempo Wallet — it is **not** a browser extension and
not a device-code adapter. First-party Tempo Wallet: `https://wallet.tempo.xyz/welcome`.

MetaMask can add Tempo manually using the mainnet values in §4.6.

Connect and disconnect work. **Approval signing and settlement are not wired.**

## 9. State of play, verified 2026-10-05

| | |
|---|---|
| Spike | 11 files, ~2,000 lines. 32 tests passing. Typechecks clean. |
| Web | Next 16.3.7, 7 pages, 27 files. Typecheck, lint and build all clean. |
| Testnet account | Exists and funded. Keys authorize, lock, expire as designed. |
| On-chain evidence | 9 probes recorded; 5 of them rejections. |
| Blocking | `PolicyForbids` — no new-recipient payouts. |
| Not built | Auth, nonce, rate limiting, DB, sessions, tenant boundary. |
| Stale | `docs/HANDOFF.md` predates the fixes in §6. Four npm scripts are dead: `keys:authorize`, `fleet:authorize`, `probe:boundaries`, `probe:period` have no matching `case` or function. |

## 10. What to do next, in order

1. **Resolve `PolicyForbids`.** No onboarding path, no product. Everything else is
   polish until this is understood.
2. **Re-probe `executeBatch` on Tempo mainnet.** Do not assume Moderato's absence
   carries over, and do not delete the code before checking.
3. **Move the root key out of the process.** The customer should hold it;
   FlowRail never should. It is a plaintext file today and that is fine for a
   spike, never for production.
4. **Decide the settlement consistency model**, then implement the nonce that
   model requires. It becomes real the moment settlement is asynchronous — a
   webhook, a retry, a second operator.
5. **Fix the receipt race in `authorizeFleet`**, not in a probe.
6. **Sign the artefact**, or serve it from the authority that produced it.
   Validation is not authentication.
7. **Redesign `executeBatch` + `PreparedKey` together** so multi-line payees work.
8. **Design the multi-held case.** `desk.tsx` renders a single held line
   correctly; two or more currently disappear. That needs a design decision, not
   a patch.

## 11. The trap behind all of them

Every bug in §6 has the same shape: **something was asserted rather than
enforced.** The right response is not vigilance, it is a check at the boundary
that fails loudly — a schema, a unique-key assertion, a throw instead of a no-op.

When adding a field that crosses a boundary, ask what a consumer does when it is
missing, wrong, or duplicated. If the answer is "renders `undefined`" or "matches
the wrong row", the boundary is missing a check.
