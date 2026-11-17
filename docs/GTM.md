# Go-to-market — one page

> **Post-submission.** Written 2026-11-17, after the Crypto World's Fair deadline. Not part of the
> judged entry (tag `submission-2026-10-12`). Every price and channel below is a **hypothesis**
> until `DEMAND-VALIDATION.md` produces evidence for it.

## Who buys

**The ops or finance lead at an agency that pays 10–100 people per month in stablecoins.**
Creative, content, dev and crypto-marketing agencies that bill a client once and owe the money
across freelancers, creators and vendors.

They feel two pains at once: the hot wallet that can pay anyone (a security problem) and the
signature-per-payee alternative (a time problem). FlowRail is built to solve both, with limits the
chain enforces rather than limits a vendor promises.

## The wedge

Stablecoin payouts on Tempo, for teams already paying on-chain.

We do not convert agencies from bank transfers in the first motion. We sell to teams that already
moved to USDC/USDT and now hold a wallet they are nervous about. That is a shorter sale: no new
rail to justify, only a safer way to use the one they chose.

## Why now

- Tempo puts payments-first stablecoin infrastructure, and access keys that can be scoped to a
  recipient, an amount and an expiry, in reach of a small team.
- Stablecoin payroll is moving mainstream (Deel, Rise, Toku all added stablecoin payouts), which
  creates buyers who already pay on-chain — and custodial platforms FlowRail can be positioned
  against.

## How we are different

| | Hot wallet | Custodial payroll platforms | FlowRail |
|---|---|---|---|
| Signatures per run | 0 | Usually 1 (in their app) | 1, plus one per exception |
| Who holds the money | Whoever has the key | The platform | The agency |
| What a leaked key reaches | Everything | Depends on the platform | One payee, up to their amount, until expiry |
| Enforced by | Nobody | The platform's policy | The chain |

We are honest about the last row's limit: a full compromise of FlowRail's servers can spend
authorisation already granted, within each key's bounds. Smaller blast radius, not zero.

## Pricing (hypothesis to test)

**Per payout run**, because the run is the unit of value and of work.

- Test a flat fee per run at two anchors in interviews (for example, a low and a mid price point)
  and listen for the one that gets "fine" without a pause.
- A free tier for runs under a small payee count, so a pilot costs the customer nothing.
- Do not take a percentage of volume: it fights the "the agency holds the money" story.

The real price comes from question 9 of the interview script, not from this document.

## Channels, in order

1. **Direct, warm** — Superteam Nigeria and local agency networks. Founder-led, one conversation
   at a time. Goal: two testnet pilots.
2. **Tempo ecosystem** — ask the Tempo partnerships team for introductions to teams doing payouts.
   FlowRail makes their access keys legible to non-engineers, which helps their story too.
3. **Crypto marketing / KOL agencies** — the best-fit segment, reached cold through ops leads.
4. **Content** — publish the nine-probe evidence (what the chain refused, with hashes). It is the
   kind of post engineers share, and it sells the "enforced by the chain" claim better than copy.

## What has to be true before mainnet

- Tempo mainnet with the access-key features FlowRail relies on.
- Real settlement (the desk's settled count is zero today) and a security review.
- Two pilots completed on testnet with real payee lists.

## Milestones

| By | Milestone |
|---|---|
| 2026-11-24 | 10 interviews logged in the tracker |
| 2026-12-05 | 15 interviews, 5 with numbers, 2 pilots agreed (Colosseum winners announced) |
| 2026-12-31 | First pilot run on Moderato with a real payee list |
