# Plan — schedule, scope, and the submission checklist

## Hard dates

| Date | Milestone |
|---|---|
| **2026-10-01** (Thu) | Today. Day 1. |
| **Oct 1–7** | **Code days.** Feature freeze at the end of Oct 7. |
| Oct 8 | Deploy + harden |
| Oct 9 | Demo video + demo resilience |
| Oct 10 | Copy, landing, UI polish |
| Oct 11 | Open-source + submission dry run |
| **Oct 12** | **Submit.** Deadline `23:59 PT`. Target submission **18:00 PT** — do not cut it close. |
| By Dec 5 | Winners announced. **Keep the demo running until then.** |

Prize: Crypto Worlds Fair **Tempo track — $100,000 across 10 products (~10k each)**, separate from
general awards. Submission requires Colosseum registration (the user has confirmed this is done).

## The shape of this plan

Seven days of **code only**, then five days of everything else. This is a deliberate trade: the
non-code work (deployment, video, compliance, docs) is real work, and trying to interleave it
guarantees neither gets done. **Protect the freeze.**

## Oct 1–3 — make the mechanism real

| # | Task | Done when |
|---|---|---|
| 1 | **Confirm the product** with the human | 5 questions in `PRODUCT.md` §8 answered |
| 2 | Fix `authorizeKey` so keys are addressable | A key can be created at a known id and read back |
| 3 | Write `src/cli/index.ts`: `agent:new`, `faucet`, `probe:chain` | Funded account, confirmed balance |
| 4 | **Fail-open probe** (`SPIKE.md` Q1) | Answered, documented, mitigation decided |
| 5 | Period probe (`SPIKE.md` Q2) | Period supported or ruled out — copy follows |
| 6 | `getKey` populated decode (Q3) | Layout confirmed or explicitly deferred |
| 7 | First tests: `test/domain/policy.test.ts` | Tier boundaries + parsing covered |

Task 1 is two minutes of someone's time and unblocks everything. Do not skip it because it is
not code.

## Oct 4–5 — the vertical slice

| # | Task | Done when |
|---|---|---|
| 8 | `roster:seed` — deterministic 40-payee demo data | Reproducible |
| 9 | Reconcile invoice → payouts → tiers | Runs end to end |
| 10 | Authorize the fleet | N keys, each with cap + expiry + scope |
| 11 | `transferWithMemo` per payout | Happy path works |
| 12 | Atomic batch of all payouts | All succeed or all revert |
| 13 | `probe:boundaries` — over-cap, wrong recipient, expired | **Real reverts, recorded with tx hashes** |

Item 13 is the highest-value hour in the whole project. It converts a demo into evidence.

## Oct 6–7 — app layer + freeze

| # | Task | Done when |
|---|---|---|
| 14 | `src/app/` use cases | CLI is a thin shell over `app/` |
| 15 | Audit trail via `LedgerPort` | Every decision + tx hash retrievable |
| 16 | Product UI, if it fits | Otherwise defer to Oct 10 |
| 17 | **Feature freeze** | Nothing new starts after this |

## Oct 8–12 — everything else

| Date | Work |
|---|---|
| **Oct 8** | Deploy. Real hostname, HTTPS, uptime monitoring. **Seeding script** so a reset is a 60-second recovery. |
| **Oct 9** | Demo video. Rehearse the demo end to end. Test the demo on a phone and on a bad connection. |
| **Oct 10** | Copy pass against `PRODUCT.md` §5. Remove every false claim. Landing polish. |
| **Oct 11** | **Open source**: README, LICENSE (MIT or Apache — pick and commit), SECURITY.md, CONTRIBUTING. Colosseum form draft. Verify Tempo requirements. |
| **Oct 12** | Final dry run at 12:00. **Submit by 18:00 PT.** |

### Submission checklist

Authoritative requirements, deadlines, and status live in [`REQUIREMENTS.md`](../REQUIREMENTS.md).
This list is the working subset.

- [ ] Colosseum registration confirmed
- [ ] Live URL, HTTPS, no auth wall in front of the demo
- [ ] Demo video uploaded
- [ ] Screenshots
- [ ] README: what it is, how to run, honest limitations
- [ ] LICENSE
- [ ] SECURITY.md
- [ ] Architecture documented (we have this — it's a selling point)
- [ ] Tempo requirements checklist verified
- [ ] Onchain tracks / SDK requirements checked
- [ ] Due-diligence and KYC documents ready
- [ ] Every product claim matches what the demo actually does

## Scope discipline

Cut list is in `PRODUCT.md` §7. If something new appears, it goes there — it does not get built.

**Re-open deliberately, never accidentally.** Each cut has a rationale. The most likely to be
regretted is "rolling spend periods," and only because Moderato does not deploy them. If mainnet
has them, revisit the claim — but not before.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Moderato resets** | Medium | One-command reseed. Record tx hashes in `SPIKE.md`. Ship a pre-funded demo video as backup. |
| **Fail-open default** | Unknown | Probe first. If fail-open, scope-immediately and document the window honestly. |
| **Signature-count overclaim** | Medium | Settle the honest number before the demo. See `PRODUCT.md` §5. |
| **Product assumptions wrong** | **Unmitigated** | Ask. Day 1, task 1. |
| **Demo needs the chain live** | High | Video backup + reseed script. A video-only fallback beats a broken live demo. |
| Slipped freeze | Medium | Oct 7 freeze is real. Cut, do not slide. |

## Definition of done

- [ ] A funded Moderato account, created by a script in the repo
- [ ] A key authorized at a **known** id, with cap, expiry, and scope — read back from chain
- [ ] One signature producing a fleet of per-payee keys
- [ ] An atomic batch paying 40 payees, with per-leg explorer links
- [ ] Recorded reverts for over-cap, wrong-recipient, and expired keys
- [ ] A pure test suite for the policy layer, no RPC required
- [ ] An audit trail that explains *why* for every payout
- [ ] Documentation that a stranger can pick up — which is what these docs are
- [ ] No claim in the README or the pitch that the demo does not support