/**
 * On-chain evidence, transcribed from Moderato testnet runs.
 *
 * Every row is something we executed and observed. Anything we have not proven
 * is deliberately absent rather than described optimistically.
 *
 * Note on `tx`: a reverted call produces no transaction hash of its own. Where
 * the interesting artefact is a rejection, `tx` is the transaction that created
 * the constraint being violated (the authorisation, or the lock), and `txLabel`
 * says so. Nothing here is a hash we did not receive from the chain.
 */

export type Proof = {
  id: string;
  claim: string;
  attempt: string;
  outcome: "accepted" | "reverted";
  detail: string;
  tx?: string;
  txLabel?: string;
  at: string;
};

export const EXPLORER = "https://explore.testnet.tempo.xyz";

export function explorerTx(tx: string): string {
  return `${EXPLORER}/tx/${tx}`;
}

export const proofs: Proof[] = [
  {
    id: "unscoped",
    claim: "A fresh key is unrestricted",
    attempt: "Paid an address that was never allowlisted",
    outcome: "accepted",
    detail:
      "The cap held the amount, but nothing held the recipient. This is why setAllowedCalls is mandatory rather than an optimisation.",
    tx: "0xa809a8dbf4f0f5df47dabf4c348fa9f98f8cbae53a46ddcf5caab3424b7f4715",
    txLabel: "the unauthorised transfer",
    at: "2026-10-01",
  },
  {
    id: "unscoped-auth",
    claim: "That key was authorised without a recipient list",
    attempt: "authorizeKey with an empty recipient set",
    outcome: "accepted",
    detail: "Moderato's authorizeKey takes no scopes at all. Locking is a second transaction.",
    tx: "0x9dcff13a6f0bbf65c2988f303fdd1e62cd38fff007dce244f7bdbef73eaa3aed",
    txLabel: "the authorisation",
    at: "2026-10-01",
  },
  {
    id: "lock",
    claim: "A recipient lock is accepted on-chain",
    attempt: "setAllowedCalls binding the key to one address",
    outcome: "accepted",
    detail: "Locking is what turns a scoped key from intent into enforcement.",
    tx: "0x0b156dd779e0c9ffa64c0ef1a019f98018cead856946c0466ed4d7f4d3c29579",
    txLabel: "the lock",
    at: "2026-10-01",
  },
  {
    id: "locked-allowed",
    claim: "A locked key still pays its one recipient",
    attempt: "1 base unit of pathUSD to the allowlisted address",
    outcome: "accepted",
    detail: "The lock does not break normal settlement.",
    tx: "0x09acb34e21bf26df67d68293cff406032bb67dbc6724f9b25008cc231aadf4f4",
    txLabel: "the allowed transfer",
    at: "2026-10-01",
  },
  {
    id: "locked-denied",
    claim: "A locked key pays nobody else",
    attempt: "The same key, a different address",
    outcome: "reverted",
    detail:
      "Rejected with Account keychain error: InvalidCallScope. This is the control the entire custody argument rests on.",
    tx: "0x0b156dd779e0c9ffa64c0ef1a019f98018cead856946c0466ed4d7f4d3c29579",
    txLabel: "the lock that refused it",
    at: "2026-10-01",
  },
  {
    id: "over-cap",
    claim: "The authorised amount is a hard ceiling",
    attempt: "1.000001 pathUSD against a 1.00 cap",
    outcome: "reverted",
    detail:
      "One base unit over the authorised amount was rejected. The cap is a lifetime total, not a per-transaction one.",
    tx: "0xd239f832569a211edcb54f7ec4b64092a0ad8ca655e2f715455bddf6f59df8a7",
    txLabel: "the capped authorisation",
    at: "2026-10-01",
  },
  {
    id: "expired",
    claim: "Expiry is enforced by the chain",
    attempt: "A transfer 70 seconds after the key expired",
    outcome: "reverted",
    detail:
      "Keys are short-lived by construction. Standing keys run 7 days, one-time keys 12 hours.",
    tx: "0xd29ced643a7028d52488f35ea9be2743f313a1d9f8c383f96f4d6979f3418179",
    txLabel: "the expiring authorisation",
    at: "2026-10-01",
  },
  {
    id: "no-batch",
    claim: "Moderato exposes no atomic batch call",
    attempt: "wallet_sendCalls with two memo transfers",
    outcome: "reverted",
    detail:
      "The RPC rejects the method outright. We settle leg by leg with a receipt each, and we do not claim single-transaction settlement.",
    at: "2026-10-01",
  },
  {
    id: "token-policy",
    claim: "pathUSD gates recipients it has not seen",
    attempt: "A first transfer to a brand-new address",
    outcome: "reverted",
    detail:
      "Rejected with PolicyForbids before the access key was consulted. New payees must already be inside the token's transfer policy.",
    at: "2026-10-01",
  },
];