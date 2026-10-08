# FlowRail — Pitch Video Script

Target length: **90–120 seconds** (~275 words; ≈1:50 at a measured 150 wpm, ≈1:40 at a brisk 165).
Deck: `FlowRail-Pitch-Deck.pdf` (8 slides, ~15s each if you cut between them).

Fixed facts in this script — do not improvise different numbers:
40 payees · 39 auto / 1 held · $500 auto cap · Jane stable 40 days ·
9 probes, 5 rejections · no payment has moved · Moderato (Tempo testnet).

---

## Narration

**[0:00 — Hook]**

Who should be allowed to move company money — and for how long, to whom, and up to how much?

**[0:10 — The two bad options]**

A creative agency bills a client and owes that money across forty contributors.
Today it chooses its poison: one hot wallet holding the whole invoice, or forty
individual signatures. Finance teams abandon the second. The first is tomorrow's breach.

**[0:30 — FlowRail + the held line]**

FlowRail rejects both. The customer approves the payout run once. From that approval we
derive a fleet of access keys — each locked to a single payee, capped at exactly what
they're owed, dead within the week. Thirty-nine of this run's forty lines need nobody.
One line still asks a human — and it tells you why. Jane has been stable forty days;
she's held not because she's untrusted, but because her amount crosses the five-hundred
line. Size is a human question. Trust is a policy one.

**[0:55 — The proof]**

And none of this is policy on paper. We ran nine probes against Tempo's testnet. Five
came back as rejections: a key refused for paying the wrong address, reverted one base
unit over its cap, refused again after expiry. The limits are facts the chain enforces.

**[1:15 — Why Tempo]**

That works because Tempo makes authorization native — caps, expiry, recipient scope as
first-class account operations, no custom contract. Its documentation promised weekly
spending windows; the deployed chain doesn't have them, so we verified and built to what
exists: a key's lifetime *is* its window. A key that dies Thursday can't be spent again
Friday.

**[1:40 — Business + open source]**

The buyer is the agency; the payout run is the unit you'd price. The code is open
source — built on Tempo's primitives, not around them.

**[1:50 — Close]**

Slow, or exposed — agencies have lived with those two. FlowRail, on Tempo, is the third.

---

## Recording notes

- Close on the split image: **39 released / 1 held** if you show any visual at all.
- The line "a key that dies Thursday can't be spent again Friday" is the Tempo thesis —
  do not rush it.
- Never claim settlement, atomic batch, or that a payment has moved. The honesty beat
  is deliberate; there is no question it dodges.
- If you need closer to 2:00, slow the probe paragraph — do not add claims.
