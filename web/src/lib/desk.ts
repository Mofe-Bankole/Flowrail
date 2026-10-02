export type ProbeRecord = {
  at: string;
  what: string;
  why: string;
  tx: string;
  href: string;
};

export const probeRecords: ProbeRecord[] = [
  {
    at: "2026-10-01",
    what: "Locked transfer to one address, then paid that address 1 base unit.",
    why: "The allowed recipient succeeded.",
    tx: "0x09acb34e21bf26df67d68293cff406032bb67dbc6724f9b25008cc231aadf4f4",
    href: "https://explore.testnet.tempo.xyz/tx/0x09acb34e21bf26df67d68293cff406032bb67dbc6724f9b25008cc231aadf4f4",
  },
  {
    at: "2026-10-01",
    what: "The same locked key tried to pay a second address.",
    why: "The chain rejected it. The lock is the control.",
    tx: "0x0b156dd779e0c9ffa64c0ef1a019f98018cead856946c0466ed4d7f4d3c29579",
    href: "https://explore.testnet.tempo.xyz/tx/0x0b156dd779e0c9ffa64c0ef1a019f98018cead856946c0466ed4d7f4d3c29579",
  },
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
