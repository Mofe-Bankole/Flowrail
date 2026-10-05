# Crypto World's Fair — submission requirements

What Colosseum actually requires to enter FlowRail, and what we still owe.

Everything below is split into three kinds of statement:

- **[RULES]** — from the Official Hackathon Rules (legal document). Binding.
- **[FAQ]** — from Colosseum's published FAQ. Authoritative on process, not legal terms.
- **[OURS]** — our internal plan or repo state. Not a requirement; may be wrong.

Anything we could not verify from a Colosseum source is marked **TBD** and needs a human with
portal access. Do not upgrade a TBD into a fact by guessing.

## Sources

| Source | URL | Covers |
|---|---|---|
| Official Hackathon Rules (8pp PDF) | <https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf> | Eligibility, timing, judging, prizes, IP, content rules |
| Colosseum Hackathon FAQ | <https://colosseum.com/hackathon> | Submission-form fields, judging process, repo expectations, eligibility clarifications |
| Crypto World's Fair campaign | <https://colosseum.com/worldsfair> | Total prize pool, tracks, judges, accelerator, workshops |
| Developer resources | <https://colosseum.com/worldsfair/resources> | Track-specific technical docs |

Retrieved 2026-10-05. The rules PDF is plain-text extractable; if a future edit changes dates or
prizes, re-pull it. `docs/PLAN.md` is the schedule; this file is the requirement of record.

## The one date that matters

| Event | When | Local (BST) |
|---|---|---|
| Contest opens | **2026-09-14 06:00 PT** (Mon) | Sep 14, 14:00 BST |
| **Registration closes** | **2026-10-12 23:59 PT** (Mon) | **Oct 13, 07:59 BST** |
| **Submission deadline** | **2026-10-12 23:59 PT** (Mon) | **Oct 13, 07:59 BST** |
| Our internal target | 2026-10-12 18:00 PT | Oct 13, 02:00 BST |
| Winners announced | on/about **2026-12-05** (Sat) | — |

- [RULES §5] Contest Period is 6:00am PT Sep 14 → 11:59pm PT Oct 12, 2026. Winners announced by
  December 5, 2026.
- [RULES §6a] After 11:59pm PT Oct 12 the registration form is **disabled**. Anyone who has not
  registered is disqualified.
- [RULES §6b] Every team member registers individually; the **team leader** uploads the submission.
- Colosseum's computer is the official timekeeping device. Dates may shift; check
  <https://colosseum.com/worldsfair> regularly. **[RULES §5]**
- **[OURS]** We are a solo submission. If we add a member, they need their own account and must be
  added by the team leader *during* submission. **[FAQ]**

## Eligibility

Check every box before assuming we are eligible.

- [RULES §3a] Age of majority in country of residence, **or** at least 18, whichever is older, as of
  contest start. Under-18 exceptions are case-by-case via `hello@colosseum.com`.
- [RULES §3b] **Sanctions exclusions.** Not eligible if located or ordinarily resident in:
  Afghanistan, Belarus, Cuba, Iran, North Korea, Russia, Somalia, Syria, the
  Crimea/Sevastopol, Donetsk, Luhansk, Zaporizhzhia and Kherson regions of Ukraine, Venezuela, or
  Yemen; or subject to OFAC or equivalent sanctions; or employed by an entity subject to blocking
  sanctions / Entity List restrictions. Employees, contractors, directors and officers of
  Colosseum, Contest Sponsors and their affiliates — and their Immediate Family — are excluded.
- [RULES §3c] You warrant that participating does not breach any employer policy or third-party
  obligation.
- [RULES §3d] Void where prohibited by local law.
- [FAQ] For **new** startups that have not raised significant outside capital. Established companies
  that have built the same product for years, or are already venture-funded, are not the target.
- [FAQ] **Solo founders may submit.** Teams are recommended but not required.

**TBD — needs the human.** Confirm the sanctions-residence and employer-permission boxes. These are
the only hard gates that are not already satisfied by having an account.

## What the submission form asks for

From the FAQ, the portal asks for the following. This is the submission's actual to-do list.

| # | Field | Our status |
|---|---|---|
| 1 | Product name | Ready — FlowRail |
| 2 | Brief description | Drafted in `docs/PRODUCT.md` §5; needs a tightened portal-length version |
| 3 | Blockchains and tools integrated | Ready — Tempo (Moderato), pathUSD, TIP-69/74 policy keys; see `docs/PROTOCOL.md` |
| 4 | All teammates, backgrounds, prior experience | **TBD — needs the human.** Bio, role, and why-you |
| 5 | Where the team is located | **TBD — needs the human.** City/country, not a privacy risk to skip |
| 6 | Product logo or graphic | **Missing.** `web/public/` has only default Next.js SVGs |
| 7 | GitHub repository link | Ready — <https://github.com/Mofe-Bankole/Flowrail> (public, MIT) |
| 8 | Presentation video, **2–3 minutes** | **Missing.** Due Oct 9 per `docs/PLAN.md` |
| 9 | Product demo video, **max 3 minutes** | **Missing.** Distinct from #8. Due Oct 9 |
| 10 | Go-to-market strategy | **Missing.** Not yet written |
| 11 | Demand validation | **Missing.** See risks below |
| 12 | Distribution plans | **Missing** |
| 13 | Any other information the form invites | Optional |

Notes that change how we fill these in:

- [FAQ] The presentation video "is one of the first resources judges review." It is not an
  afterthought. Budget real time for it.
- [FAQ] The demo video is a **separate** upload capped at three minutes and must explain how the
  product works.
- [FAQ] Open-source repos are encouraged. Private repos are allowed **only** if access is granted to
  `hackathon@colosseum.com`. Ours is public, so this does not bind us.
- [FAQ] Open source by others is explicitly encouraged — "we encourage founders to compose with
  existing crypto protocols." This is the licence for our Tempo integration.

### Limits

- [RULES §7] An Entrant may be a Member of **one** Team. A Team may submit **one** Project
  Submission.
- [FAQ] One product submission per team, therefore one per individual. No second project.
- [RULES §7] **No confidentiality.** Do not assume anything you submit is private.

## Disclosing prior work — the biggest under-rated rule

- [FAQ] Builders **may** use pre-existing code, but **teams must disclose all relevant past
  development work in the submission form**.
- [FAQ] Development may begin before the contest, but products are **judged only on work completed
  between Sep 14 and Oct 12, 2026**.
- [FAQ] Misrepresenting development history or failing to disclose → Colosseum may disqualify the
  team, **ban builders from future hackathons**, and **revoke prizes**.
- [FAQ] Repo review looks for: significant work during the hackathon; done by us rather than a third
  party; strategic prioritisation. It explicitly does **not** look for a particular language or
  framework, design patterns, best practices, or code-quality checks.
- [RULES §9] We must tell Colosseum the status and ownership of any open-source or third-party code
  in the submission.

**Action.** The disclosure is a written answer, and it is the item most likely to be answered
casually and regretted. Draft it deliberately. Our history: 24 commits on `main`, all within the
contest window, developed solo, MIT-licensed, no third-party code beyond declared npm dependencies.
Verify that is still true at submission time.

## How judging works

Two lists exist and both are real. Do not optimise for one and ignore the other.

### Legal criteria — [RULES §8]

- **Functionality** — how well it works; quality of the code.
- **Potential Impact** — TAM, and impact on the broader crypto ecosystem.
- **Novelty** — how unique the concept is.
- **UX** — how well it uses blockchain to create good downstream UX.
- **Open-source** — is it open source; does it compose with other primitives.
- **Business Plan** — is there a viable future business; is the team able to execute.

### Published judging factors — [FAQ]

Founder + Market Fit · Insight · Product + Execution · Potential Market Size · Founder
Communication · Viability · Traction.

[FAQ] "We evaluate more than the product itself… how the opportunity was uncovered, how the team
prioritizes, and whether the founders are committed to building a venture-scale business."

### Process — [FAQ]

1. Colosseum team reviews all submissions; multiple rounds of evaluation.
2. Highest-quality products are shortlisted to the judging panel.
3. After individual judging, a smaller group is invited to a **15-minute Zoom interview**.
4. Winners chosen. Announced roughly one month after the deadline.

- [FAQ] **Not every submitter gets feedback.** Volume prevents it. Every submission is guaranteed
  review, nothing more.
- [FAQ] **Weekly updates are optional** but strongly recommended for anyone serious about competing:
  a concise one-minute video on the previous week's progress and challenges.

### Judges — <https://colosseum.com/worldsfair>

Colosseum team (decides overall winners and accelerator admissions): Clay Robbins, Matty Taylor,
Nate Levine (cofounders), Max Monciardini (engineer), Michael Rinko (associate).

A broader panel of track judges provides feedback and evaluates submissions in dedicated tracks.

**[OURS]** Judged on UX and open-source composition as much as novelty. That rewards the
architecture work in `docs/ARCHITECTURE.md`, which is currently a strength and an underused asset.

## Content rules

- [RULES §12a] **All content must be in English.**
- [RULES §12b] Must not infringe another's IP, privacy, or publicity rights.
- [RULES §12b] Must not disparage Colosseum, sponsors, or affiliates. **No naming Tempo or Colosseum
  sponsors in a way that reads as an endorsement.** "Built on Tempo" is factual integration;
  anything implying partnership is a risk.
- [RULES §12b] Permission required from anyone appearing in content.
- [RULES §12b] No malicious or deceptive components.
- [RULES §12b] Nothing inappropriate, indecent, obscene, hateful, defamatory, or libelous.
- [RULES §12b] Nothing promoting discrimination or harm toward any group.
- [RULES §12b] Nothing unlawful, and nothing violating the terms of the third-party video platform we
  upload to. **Check YouTube/Vimeo/Luma terms before uploading the videos.**
- [RULES §17] Entrants may be subject to **background checks** at Colosseum's sole discretion.
  Sponsor arrangements need prior written approval; do not use Colosseum trademarks or logos without
  written consent.
- [FAQ] A Code of Conduct applies throughout and can trigger disqualification. See
  <https://colosseum.com/code-of-ethics>.

## Prizes

**[RULES §14]** — values are before taxes. Track prizes are **in addition to** the general awards.

| Award | Amount | Count |
|---|---|---|
| Grand Champion | $30,000 Phantom CASH | 1 |
| Next 20 standout teams | $15,000 CASH each | 20 |
| Public Goods | $5,000 CASH | 1 |
| University | $5,000 CASH | 1 |
| **Tempo track** | **$100,000 across 10 → ~$10,000 each** | 10 |
| Solana track | $100,000 across 10 | 10 |
| Hyperliquid track | $100,000 across 10 | 10 |
| Zcash track | $100,000 across 10 | 10 |
| Ethereum L1 track | $25,000 across 5 | 5 |
| Base track | $25,000 across 5 | 5 |
| Arbitrum track | $25,000 across 5 | 5 |
| Robinhood Chain track | $25,000 across 5 | 5 |

Total advertised: **$840,000 in prizes and $2.5M in seed funding** (campaign page). New awards may
be added.

Money mechanics:

- [RULES §15a] Winners are responsible for all tax reporting and payments.
- [RULES §15b] All prizes go to the **Team Leader**. A winning team may be required to set up a
  wallet address as directed by Colosseum. **Have a receiving wallet ready in advance.**
- [RULES §15c] Prizes are non-transferable; no substitution without permission.
- [RULES §15f] If a prize cannot be awarded, Colosseum may substitute an equal or greater prize.
- [RULES §13] **Winning is contingent** on executing Prize Acceptance Documents and passing
  Colosseum's and sponsors' due diligence. Also [RULES §17] background checks.

**[OURS]** FlowRail is entered in the **Tempo track**, which is the smallest realistic target at
~$10,000. The general awards are not winnable for a solo builder in one month. Do the honest
execution that the Tempo track rewards: work that integrates real Tempo primitives, composes with
the ecosystem, and demonstrably works.

## Accelerator (not a prize, and not binding)

- [FAQ / campaign page] All hackathon winners are interviewed and considered for the Colosseum
  Accelerator: **$250,000 pre-seed**, network access, mentorship, 12 weeks in the San Francisco
  office.
- [FAQ] **Winning does not oblige you to join the Accelerator.**
- **[OURS]** If we win, this is the actual prize worth optimising for — the $10,000 track award is
  secondary. It means the submission should read as a company, not a demo.

## Data we are handing over

Be deliberate about this; it is easy to miss.

- [RULES §11] Profile Information is shared **with judges and Contest Sponsors**, and submitting
  opts us in to Colosseum emails.
- [RULES §11] Personal data (name, email, postal address, country, state/province) may be stored on
  servers outside our country and processed by staff in the United States.
- [RULES §11] Privacy rights (access, correction, erasure, objection, portability) — write to
  `hello@colosseum.com`. Contest-specific privacy questions: `hackathon@colosseum.com`.
- [RULES §9] **We keep our IP.** Colosseum claims no ownership of the Project Submission and
  protects our Creative Materials rights instead.
- [RULES §10] Colosseum retains rights in its own contest marketing materials, which may include our
  name, image, likeness, and Content. **[RULES §2 "Creative Materials"]** Assume FlowRail's name and
  logo can be used in contest promotion.
- [RULES §16] Submission is voluntary and not confidential. No employment, fiduciary, or agency
  relationship is created.

## FlowRail readiness

Repo state at 2026-10-05: `main` @ `d659066`, 24 commits, public MIT repo, live at
<https://flowrail.vercel.app/>.

### Met

- [x] Colosseum registration — confirmed by the human.
- [x] GitHub repo, public, MIT (`LICENSE.md`).
- [x] README: what it is, how to run, honest limitations.
- [x] Architecture documented (`docs/ARCHITECTURE.md`), `docs/KNOWLEDGE.md`, `docs/PROTOCOL.md`.
- [x] Security review (`spike/THREAT-MODEL.md`, 208 lines).
- [x] Live HTTPS demo, no auth wall.
- [x] Tests green — 32/32 in `spike`; both packages typecheck; web lint and production build pass.
- [x] Pre-existing-work disclosure drafted (this file, see "prior work" section).

### Not met — ordered by risk

| Item | Why it matters | Due |
|---|---|---|
| **Disclosure answer written out** | Misrepresentation risks disqualification, a ban, and prize revocation **[RULES §9, FAQ]** | Now |
| **Presentation video, 2–3 min** | "One of the first resources judges review" **[FAQ]** | Oct 9 |
| **Demo video, ≤3 min** | Separate required upload **[FAQ]** | Oct 9 |
| **GTM + distribution** | Required form field; also Viability and Traction **[RULES §8, FAQ]** | Oct 10 |
| **Demand validation** | Required form field; Traction is a scored criterion **[FAQ]** | Oct 10 |
| **Logo / product graphic** | Required form field; none exists | Oct 10 |
| **Teammate bios + team location** | Required form fields; cannot be written for us | Now |
| `SECURITY.md` at repo root | We have `docs/SECURITY.md`; GitHub only surfaces root or `.github/SECURITY.md` | Oct 11 |
| `CONTRIBUTING.md` | Open-source signal **[RULES §8e]** | Oct 11 |
| Receiving wallet ready | Prizes go to the team leader **[RULES §15b]** | Oct 11 |
| Verify video platform ToS | **[RULES §12b]** | Oct 9 |
| Update weekly update | Optional but recommended; one-minute video **[FAQ]** | Weekly |

### Known product limits we must not paper over

Anything the README or video claims has to survive these. Colosseum judges "Functionality" and
"Product + Execution", and a discovered overclaim costs more than a small feature.

- No delegated payout has moved. The mechanism is proven; settlement is not.
- Fresh recipients hit `PolicyForbids` — pathUSD onboarding for new payees is unsolved.
- `executeBatch` (atomic multi-payout) is unavailable on Moderato; mainnet support unverified.
- Wallet connection exists, but approval signing and settlement are not wired.
- Multiple held legs are not safely designed or displayed.
- Four dead npm scripts remain: `keys:authorize`, `fleet:authorize`, `probe:boundaries`,
  `probe:period`.
- `docs/HANDOFF.md` is stale and lists already-fixed defects.

**Say "this is what it does today" and show it.** A judge who sees an honest, working
policy-and-authorisation layer beats one who discovers a claim that breaks on the third question.

## Open questions for the human

1. Confirm the [RULES §3b] sanctions-residence and [RULES §3c] employer-permission boxes.
2. Provide team location, and your bio/background for field 4.
3. Is the presentation video or the demo video cut first if time runs short? Recommendation:
   **demo video first** — [RULES §8a] functionality is the criterion we can actually prove on
   camera, and the live site backs it up.
4. Confirm the disclosure answer in the "prior work" section is accurate at submission time.
5. Should `REQUIREMENTS.md` replace the submission checklist in `docs/PLAN.md` so there is one
   source of truth?
