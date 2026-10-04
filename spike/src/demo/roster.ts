/**
 * The canonical demo run: 40 payees, 39 automatic, 1 finance approval.
 *
 * This is generated rather than hand-typed so the roster stays internally
 * consistent (every stable payee is stable for at least POLICY.addressStabilityDays),
 * and so the landing page can claim "forty payees, one exception" without
 * that number being invented in a headline.
 *
 * Addresses are deterministic placeholders on a dead testnet prefix. They are
 * shaped like real addresses so the UI reads correctly; they hold no funds.
 */

import type { InvoiceLine, Payee } from '../domain/types.js'

type Seed = { name: string; role: string; amount: string; stableDays: number }

const CREATORS: Seed[] = [
  { name: 'Ada Okonkwo', role: 'Creator', amount: '65.00', stableDays: 21 },
  { name: 'Rafa Mendes', role: 'Creator', amount: '120.00', stableDays: 34 },
  { name: 'Yuki Tanabe', role: 'Creator', amount: '48.50', stableDays: 12 },
  { name: 'Priya Raman', role: 'Creator', amount: '310.00', stableDays: 58 },
  { name: 'Tomasz Wrona', role: 'Creator', amount: '75.25', stableDays: 9 },
  { name: 'Amara Nwosu', role: 'Creator', amount: '220.00', stableDays: 44 },
  { name: 'Lena Fischer', role: 'Creator', amount: '95.00', stableDays: 27 },
  { name: 'Diego Salas', role: 'Creator', amount: '180.40', stableDays: 63 },
  { name: 'Mei Lin Chow', role: 'Creator', amount: '52.00', stableDays: 15 },
  { name: 'Oskar Nowak', role: 'Creator', amount: '144.99', stableDays: 31 },
  { name: 'Zara Haddad', role: 'Creator', amount: '60.00', stableDays: 8 },
  { name: 'Felix Braun', role: 'Creator', amount: '275.00', stableDays: 52 },
  { name: 'Nia Abara', role: 'Creator', amount: '88.75', stableDays: 19 },
  { name: 'Hugo Lefevre', role: 'Creator', amount: '132.00', stableDays: 40 },
  { name: 'Sana Qureshi', role: 'Creator', amount: '41.20', stableDays: 11 },
  { name: 'Bilal Karim', role: 'Creator', amount: '199.99', stableDays: 29 },
  { name: 'Ingrid Dahl', role: 'Creator', amount: '70.50', stableDays: 22 },
  { name: 'Marco Bianchi', role: 'Creator', amount: '245.00', stableDays: 47 },
  { name: 'Ayo Balogun', role: 'Creator', amount: '58.00', stableDays: 14 },
  { name: 'Freya Lindqvist', role: 'Creator', amount: '163.30', stableDays: 37 },
  { name: 'Karim Zaid', role: 'Creator', amount: '84.00', stableDays: 25 },
  { name: 'Noor Petran', role: 'Creator', amount: '121.60', stableDays: 33 },
  { name: 'Emil Rask', role: 'Creator', amount: '39.90', stableDays: 10 },
]

const VENDORS: Seed[] = [
  { name: 'Northlight Studio', role: 'Vendor', amount: '480.00', stableDays: 71 },
  { name: 'Copperline Legal', role: 'Vendor', amount: '425.00', stableDays: 64 },
  { name: 'Field & Form Print', role: 'Vendor', amount: '318.40', stableDays: 38 },
  { name: 'Signal House Media', role: 'Vendor', amount: '260.00', stableDays: 26 },
  { name: 'Ardent Print Co', role: 'Vendor', amount: '199.00', stableDays: 55 },
  { name: 'Kestrel Hosting', role: 'Vendor', amount: '142.75', stableDays: 30 },
  { name: 'Vantage Accounting', role: 'Vendor', amount: '475.00', stableDays: 82 },
  { name: 'Bright Loom Events', role: 'Vendor', amount: '225.50', stableDays: 41 },
  { name: 'Sable Freight', role: 'Vendor', amount: '138.20', stableDays: 18 },
  { name: 'Lumen Translation', role: 'Vendor', amount: '164.00', stableDays: 36 },
  { name: 'Ironwood Insurance', role: 'Vendor', amount: '488.00', stableDays: 67 },
  { name: 'Quill & Bramble', role: 'Vendor', amount: '153.10', stableDays: 24 },
]

const SUBCONTRACTORS: Seed[] = [
  { name: 'Rosa Iglesias', role: 'Subcontractor', amount: '340.00', stableDays: 23 },
  { name: 'Kwame Boateng', role: 'Subcontractor', amount: '395.00', stableDays: 46 },
  { name: 'Elif Demir', role: 'Subcontractor', amount: '288.60', stableDays: 17 },
  { name: 'Jonas Keller', role: 'Subcontractor', amount: '455.00', stableDays: 59 },
]

/**
 * The single exception. A long-known address, but large enough that policy
 * sends it to a human. This is the whole thesis in one line: amount alone is a
 * size check, never a trust check.
 */
const EXCEPTION: Seed = {
  name: 'Jane Adeyemi',
  role: 'Partner retainer',
  amount: '1850.00',
  stableDays: 40,
}

/** A line the engine cannot resolve. It must survive as unresolved, never vanish. */
export const UNRESOLVED_LINE: InvoiceLine = { payeeId: 'vendor-041', amount: '96.00' }

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Deterministic, well-formed, obviously-synthetic address. */
function fakeAddress(seed: string): `0x${string}` {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  let out = ''
  for (let i = 0; i < 40; i += 1) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0
    out += ((h >>> 24) & 0xf).toString(16)
  }
  return `0x${out}` as `0x${string}`
}

const ALL: Seed[] = [...CREATORS, ...VENDORS, ...SUBCONTRACTORS, EXCEPTION]

export const demoRoster: Payee[] = ALL.map((seed) => ({
  id: slug(seed.name),
  name: seed.name,
  address: fakeAddress(seed.name),
  addressStableForDays: seed.stableDays,
}))

export const demoLines: InvoiceLine[] = [
  ...ALL.map((seed) => ({ payeeId: slug(seed.name), amount: seed.amount })),
  UNRESOLVED_LINE,
]

export const rosterById = new Map(demoRoster.map((payee) => [payee.id, payee]))

/** roleById[payeeId] -> "Creator" | "Vendor" | "Subcontractor" | "Partner retainer" */
export const roleById: Record<string, string> = Object.fromEntries(
  ALL.map((seed) => [slug(seed.name), seed.role]),
)

/** Fixed clock so the exported run is byte-stable across regenerations. */
export const DEMO_NOW = 1_767_225_600 // 2026-01-01T00:00:00Z

export const DEMO_RUN_ID = 'INV-2500'