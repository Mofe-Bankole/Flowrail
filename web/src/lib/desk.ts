export type RunStatus =
  | "reconciled"
  | "awaiting-approval"
  | "keys-unscoped"
  | "ready"
  | "settled";

export type DeskTier = "auto" | "finance" | "dual";

export type DeskLeg = {
  id: string;
  name: string;
  amount: string;
  tier: DeskTier;
  reason: string;
  address: string;
  stableDays: number;
  source: "sample";
};

export type ProbeRecord = {
  at: string;
  what: string;
  why: string;
  tx: string;
  href: string;
};

export const sampleRun = {
  id: "INV-2500",
  label: "Sample run",
  invoice: "$2,500.00",
  token: "pathUSD",
  status: "awaiting-approval" as RunStatus,
  note: "Seeded for the demo. Not a Moderato receipt.",
};

export const sampleLegs: DeskLeg[] = [
  {
    id: "jane",
    name: "Jane Adeyemi",
    amount: "$1,850.00",
    tier: "finance",
    reason: "Amount exceeds the $500 auto cap. Address has been stable 40 days. Size, not trust.",
    address: "0x4c2e91ab",
    stableDays: 40,
    source: "sample",
  },
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `auto-${index + 1}`,
    name: `Standing payee ${index + 1}`,
    amount: "$65.00",
    tier: "auto" as const,
    reason: "Standing payee, within the auto cap.",
    address: `0x10${index}a…${index}4c`,
    stableDays: 21,
    source: "sample" as const,
  })),
];

export const sampleSummary = {
  auto: 39,
  finance: 1,
  dual: 0,
  shown: sampleLegs.length,
};

export const probeRecords: ProbeRecord[] = [
  {
    at: "2026-10-01",
    what: "Authorized a key with a $1 cap and no recipient list.",
    why: "A fresh key is unrestricted until setAllowedCalls lands.",
    tx: "0x9dcff13a6f0bbf65c2988f303fdd1e62cd38fff007dce244f7bdbef73eaa3aed",
    href: "https://explore.testnet.tempo.xyz/tx/0x9dcff13a6f0bbf65c2988f303fdd1e62cd38fff007dce244f7bdbef73eaa3aed",
  },
  {
    at: "2026-10-01",
    what: "That key paid 1 base unit to an address that was not allowlisted.",
    why: "The cap held the amount. It did not hold the recipient.",
    tx: "0xa809a8dbf4f0f5df47dabf4c348fa9f98f8cbae53a46ddcf5caab3424b7f4715",
    href: "https://explore.testnet.tempo.xyz/tx/0xa809a8dbf4f0f5df47dabf4c348fa9f98f8cbae53a46ddcf5caab3424b7f4715",
  },
];

export const statusCopy: Record<RunStatus, string> = {
  reconciled: "Matched to the roster. Not approved.",
  "awaiting-approval": "One payout needs a person.",
  "keys-unscoped": "Keys exist. Recipients are not locked.",
  ready: "Every live key has a confirmed recipient lock.",
  settled: "Batch landed. Audit rows point at receipts.",
};
