# FlowRail — Build Spec (v1)

Status: agreed direction, pre-implementation
Team: Daniel Asaboro · Mofe · Pizelxx
Chain: **Tempo only.** Solana and AI features are out of scope.

## 1. What FlowRail is

A payout operations layer for businesses that pay many people on Tempo. An agency receives a client payment. Fixed, rule-based policies then decide when money leaves, who gets it, and who approved it. Every payout carries a reference and an approval record anyone can check.

The product is **the rules that govern payouts**, not a wallet or a checkout.

## 2. Decisions

| Decision | Choice |
|---|---|
| Network | **Moderato testnet**, chain ID `42431` (mainnet deferred) |
| Root key custody | **Customer-held passkey** (P256/WebAuthn, domain-bound, stays on the customer's device). Fallback: Tempo Wallet. |
| Policy enforcement | Off-chain policy engine that follows fixed rules, plus scoped access keys the protocol enforces |
| Custom Solidity | **None in v1** |
| Stack | TypeScript everywhere (`viem`, `wagmi`, `ox`), Postgres |

### Network details

| Property | Value |
|---|---|
| RPC | `https://rpc.moderato.tempo.xyz` |
| WebSocket | `wss://rpc.moderato.tempo.xyz` |
| Explorer | `https://explore.testnet.tempo.xyz` |
| Faucet | `cast rpc tempo_fundAddress <ADDRESS> --rpc-url https://rpc.moderato.tempo.xyz` |

Testnet tokens (6 decimals): pathUSD `0x20c0…0000`, AlphaUSD `0x20c0…0001`, BetaUSD `0x20c0…0002`, ThetaUSD `0x20c0…0003`.

## 3. Architecture

| Plane | Contents | Rule |
|---|---|---|
| Control (FlowRail) | Payees, policies, budgets, approvals, reconciliation, audit | Never holds key material that can act on its own |
| Execution (FlowRail) | Scoped access keys, transaction builder | Can only use keys the customer has authorized, and only within their limits |
| Settlement (Tempo) | TIP-20, payment lanes, Tempo Transactions, Account Keychain | Enforced by the protocol |

**Core rule:** If the server is compromised, an attacker can misuse an existing authorization but cannot create a new one. The root key lives only on the customer's device, and only the root key can create keys, add recipients, or raise limits.

## 4. Tempo primitives used

| Primitive | Purpose in FlowRail |
|---|---|
| TIP-20 `transferWithMemo` (32 bytes) | Each payout carries its invoice/period reference |
| Virtual addresses | Each invoice has its own deposit address, so incoming payments identify themselves |
| Payment lanes | Reserved blockspace keeps payroll fees predictable |
| Stablecoin fees + fee sponsorship | Payees never handle gas; FlowRail pays it |
| Batching | All payouts in a run succeed or fail together |
| Scheduling (`valid_after` / `valid_before`) | Runs execute in a set time window without a cron bot |
| Access keys: recipient scopes (TIP-1011) | A key can only pay the addresses listed in it |
| Access keys: periodic `TokenLimit` | Period budget is enforced on-chain and resets automatically |
| `witness` + burned set (TIP-1053) | Ties a key to a specific authorization artifact; can be revoked before use |
| Passkeys (P256/WebAuthn) | Customer approves with Face ID; no seed phrase |

Not used: StablecoinDEX / Fee AMM, MPP / payment channels, privacy transactions, EIP-7702 delegation.

### ABI and deployment status (verified 2026-09-30)

- TIP-1011 is live on **mainnet at T3**; TIP-1053 is live on **mainnet at T5**. Access keys are therefore treated as a post-T3 surface.
- Modern `authorizeKey` selector: `0x980a6025`. The legacy selector `0x54063a55` is the pre-T3 form. The flattened-variant encoding (which hashes to `0x203e2736`) is **rejected** — do not hand-roll argument encoding, use the first-party SDK.
- Period budgets read through `getRemainingLimitWithPeriod`. Never compute remaining budget locally.
- Account precompile: `0xAAAAAAAA00000000000000000000000000000000`.
- Signature types: `0` secp256k1, `1` raw P256, `2` WebAuthn.
- SDK: first-party TypeScript SDK only.
- **Unverified:** whether Moderato actually exposes T3/T5-era access keys and the TIP-1049 scheduling surface. Mainnet deployment status does not prove the separate Moderato deployment. This is the first thing the spike establishes.

## 5. Trust tiers

| Tier | When it applies | Key used | Worst case if the server is compromised |
|---|---|---|---|
| Auto | Payee is `STABLE`, amount ≤ payee cap, budget remains | Standing key: recipients = stable payees, periodic limit, ~90-day expiry | At most one period's budget, paid only to trusted addresses |
| Finance | Payee is `VERIFIED`, or amount is $500–$2,000 | One-time key: exact recipients, exact total, `period=0`, short `valid_before`, `witness` | Only the batch that was approved |
| Dual | Over $2,000, or any address change | Two human signatures included in `witness` | Nothing moves without both signatures |

Admin access keys have no limits by design, so they must never be stored on a server. `burnKeyAuthorizationWitness` is likewise **admin-only**, and key management is **root-only**.

**Consequence for revocation:** FlowRail cannot revoke on the customer's behalf, because it holds no admin key and no root key. Revocation is therefore **customer-triggered** — one tap in the customer's wallet, signed by the customer's own root. FlowRail's design must make that path obvious and reachable in one step. Short one-time-key expiry is the primary containment mechanism; the tap is the backstop.

## 6. Payee lifecycle (low-friction roster changes)

```
PENDING → VERIFIED → STABLE      (any address change or human demotion → PENDING / SUSPENDED)
```

1. Only `STABLE` addresses (approved **and** unchanged for N days, default 7) are in the standing key.
2. An address change counts as a demotion: the payee returns to `PENDING`, a second approver is required, and the next payout uses a one-time key.
3. **One passkey signature per payroll run** covers the one-time keys and the standing-key renewal.
4. If many payees become `STABLE` in one period, the whole group is flagged for review.

## 7. Authorization artifact

`witness = keccak256(canonical(artifact))`, stored in the `KeyAuthorization`.

```
artifact_version, business_id, policy_id, policy_version,
payee_id, payee_address, amount, token, invoice_ref,
batch_id, leg_id, budget{limit, period, consumed_before},
approvals[{approver, role, signed_at, sig_hash}],
valid_after, valid_before
```

## 8. Components

- **Policy engine**: a pure function with no I/O and no clock reads. Returns `AUTO | NEEDS_APPROVAL | BLOCKED` plus a reason code.
- **Key manager**: requests passkey signatures, stores access keys, and uses `getRemainingLimitWithPeriod` as the source of truth for budgets.
- **Reconciler**: matches `TransferWithMemo` events to invoices by virtual address and memo, never by guessing from amount or timing.
- **Executor**: builds sponsored, batched Tempo Transactions. Before signing, it checks that the key's recipients, limit and expiry fully cover the artifact.
- **Audit log**: append-only chain: artifact → KeyAuthorization → tx hash → on-chain events.
- **Approval screen**: shows every payout with recipient, amount and reference, never a single opaque total. Surfaces a **customer-triggered revoke** action that walks the customer through signing against their own root — FlowRail cannot do this itself.

## 9. Build phases (each must pass before the next starts)

1. **Protocol spike (gate — nothing else starts until this passes).** A standalone TypeScript package plus `SPIKE.md` recording every result, written to:
   - Confirm T3-era access keys and T5-era witness support actually exist on Moderato. If not, the architecture changes and this spec is revised before any other work.
   - Customer-held passkey root authorizes a scoped access key. (The witness-based flow may use a throwaway admin key purely to prove the *protocol capability* — that key is never part of the product.)
   - Prove reverts: transfer **over the limit** fails, transfer **to an unlisted recipient** fails, expired `valid_before` fails.
   - Prove `getRemainingLimitWithPeriod` across a period rollover, and settle the calendar-month vs rolling-window question with evidence.
   - Prove a batched, fee-sponsored `transferWithMemo` on Moderato via the payment lane.
   - Confirm the passkey/account-precompile signing path (signature type `2`).
   - Demonstrate the `witness` revocation path, including who is actually able to execute it.
2. **Custody proof**: a passkey root key authorizes a scoped access key. Confirm that **transfers over the limit and to unlisted recipients both revert.**
3. **Control plane**: policy engine (unit-tested first), then key manager, executor and audit log.
4. **Approval screen**: full breakdown of every payout, plus the customer-triggered revoke.
5. **Roster state machine**: payee lifecycle and batched re-authorization.
6. **Demo**: $2,500 invoice → reconciliation → 40 payouts, 39 automatic and 1 approved (Jane, $1,850) → audit trail.

## 10. Before any mainnet move (deferred)

Revocation drill, payee sanctions screening, audit log retention, liability terms for payouts the customer approved, and a legal review of the delegated-credential position. Holding scoped access keys is delegation, not a disclaimer — FlowRail should not market itself as non-custodial on the strength of a technical control alone.

Also unresolved for mainnet: how a passkey-only root gets funded and pays for its own gas.

## 11. Open items

- Confirm T3/T5 access keys and TIP-1049 scheduling are live on Moderato (Phase 1 spike settles this).
- Budget period: calendar month or rolling window (spike settles this with evidence).
- Design-partner agency and currency assumptions.
- Passkey funding/on-ramp path for a future mainnet launch. Not blocking for the testnet demo.
