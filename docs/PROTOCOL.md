# Tempo protocol notes — what is actually deployed

_Last verified 2026-10-01 against `https://rpc.moderato.tempo.xyz`, chain id **42431**,
head ≈ block **37,681,427**._

**Every claim here carries one of three labels. Preserve them when editing.**

| Label | Meaning |
|---|---|
| `VERIFIED` | Probed first-hand against the live Moderato precompile. Trust it. |
| `CONFIRMED` | Not probed, but independently corroborated by viem's published ABI. Trust it. |
| `FROM-TIP` | Specified in a Tempo TIP. **Not evidence that it exists on Moderato.** |
| `OPEN` | Unknown. Do not assume. |

---

## 1. The thing that matters most

Tempo's TIPs describe a **richer access-key system than Moderato actually implements.**

| Capability | In TIP-1011? | On Moderato? |
|---|---|---|
| `authorizeKey` with scopes in the same call | ✅ `FROM-TIP` | ❌ **No** — scopes are a second tx |
| Per-token limit **update** | ✅ `FROM-TIP` | ⚠️ Only a no-token-arg variant |
| Rolling **spend period** windows | ✅ `FROM-TIP` | ❌ **No period field in the ABI** |
| `getRemainingLimit` (rich read) | ✅ `FROM-TIP` | ❌ Selector unrecognised |
| Absolute cap per token | ✅ | ✅ `VERIFIED` |
| Key expiry | ✅ | ✅ `VERIFIED` |
| `revokeKey` | ✅ | ✅ `VERIFIED` |

Consequence for the product: **you cannot promise "this key can spend $X per week."** You can
promise "this key can spend at most $X, ever, and dies at time T." That is still a strong
guarantee — it is a lifetime allowance, not a rate limit — but the marketing copy must say so.
See `docs/PRODUCT.md` §5.

## 2. Network constants — `VERIFIED`

| Constant | Value |
|---|---|
| Moderato chain id | `42431` (`0xa5bf`) |
| Moderato RPC | `https://rpc.moderato.tempo.xyz` |
| Moderato explorer | `https://explore.testnet.tempo.xyz` |
| Tempo mainnet chain id | `4217` |
| Account precompile address | `0xAAAAAAAA00000000000000000000000000000000` |
| Precompile deployed code | `0xef` (`VERIFIED` — non-empty via `eth_getCode`) |
| `pathUSD` | `0x20c0000000000000000000000000000000000000` |
| Token decimals | `6` (all Tempo stablecoins) |

`viem`'s `tempoModerato` chain object matches chain id `42431`. Note viem does **not** populate
`explorerUrl` for it; the URL above is ours.

## 3. The deployed access-key ABI — `VERIFIED`

Derived by Keccak-256 over candidate signatures, then confirmed by probing which selectors the
precompile recognises (an unrecognised selector gives a distinct error). Hardcoded in
`spike/src/adapters/tempo/config.ts`.

### Recognised

| Function | Selector |
|---|---|
| `authorizeKey(address,uint8,uint64,bool,(address,uint256)[])` | `0x54063a55` |
| `updateSpendingLimit(address,address,uint256)` | `0xcbbb4480` |
| `getKey(address,address)` | `0xbc298553` |
| `getAllowedCalls(address,address)` | `0x0163e7ec` |
| `revokeKey(address)` | `0x5ae7ab32` |
| `setAllowedCalls(address,(address,(bytes4,address[])[])[])` | `0xf5456703` |
| `removeAllowedCalls(address,address)` | `0xf3941811` |
| `burnKeyAuthorizationWitness(bytes32)` | `0xcff31c46` |

Plus standard TIP-20: `transferWithMemo` `0x95777d59`, `transfer` `0xa9059cbb`,
`approve` `0x095ea7b3`.

### Not recognised on Moderato

| Function | Selector | Status |
|---|---|---|
| `authorizeKey(…,(address,uint256,uint64)[],bool,…)` — the canonical 7-arg form | `0x203e2736` | ❌ absent |
| `getRemainingLimit(address,address,address)` | `0x63b4290d` | ❌ absent |
| `updateSpendingLimit(address,address,address,uint256)` — per-token | `0x2a05ca72` | ❌ absent |
| `getRemainingLimitWithPeriod` | `0xa7f72cab` | ❌ absent |
| `getKeyInfo` | `0x00e7f223` | ❌ absent |
| *(unknown — matched nothing)* | `0x980a6025` | ❌ unidentified |

The gap between `0x203e2736` (canonical) and `0x54063a55` (deployed) **is** the period-and-scopes
feature set. That is the single most important finding in this document.

### Independent corroboration — `CONFIRMED`

`viem@2.57.2`'s published `authorizeKey` ABI is:

```solidity
authorizeKey(
  address keyId,
  uint8   signatureType,
  uint64  expiry,
  bool    enforceLimits,
  tuple[] limits          // (address token, uint256 amount)
)
```

That is **byte-for-byte the signature we brute-forced from the live precompile**, discovered
independently and before consulting viem. It confirms:

- The deployed `authorizeKey` really is the 5-parameter form.
- `limits` entries are `(token, absoluteAmount)` — **per-token absolute caps are supported.**
- There is **no period field** in the deployed encoding.

This also corrects an earlier note in this repo that said limits have "no per-token
dimension." That was wrong. Per-token absolute caps exist. What does **not** exist is the
rolling *window*.

## 4. Signatures — `FROM-TIP-1011`

`signatureType` enum: `0` = secp256k1, `1` = P-256, `2` = WebAuthn.

**Custody note.** FlowRail's product design wants the *customer* to hold the root key
(preferrably passkey/WebAuthn), so the type the server sees is largely dictated by the
customer's wallet, not by us. The server-side spike root key is plain secp256k1 held in a
gitignored file. **That is a test fixture, not the product.**

## 5. Witness (TIP-1053) — `FROM-TIP`, partially `VERIFIED`

TIP-1053 is Mainnet/T5. A key authorization carries an **optional trailing `bytes32` witness**.

- Digest: `keccak256(rlp(key_authorization))`.
- `burnKeyAuthorizationWitness(bytes32)` — **VERIFIED** recognised on Moderato (`0xcff31c46`).
- Calling it without authorization returned a human-readable Tempo error of the form
  `Account keychain error: Unauthorized`.

**What a witness is and is not — this is easy to get catastrophically wrong:**

- ✅ It binds one signature to arbitrary off-chain context (e.g. a server-issued challenge).
- ✅ Burning it invalidates a **signed-but-not-yet-submitted** authorization.
- ❌ It does **not** revoke a **live** key. Burning a witness does not kill money that already
  has a deployed key.
- ❌ It is **not** one-time-use and it is **not** consumed on use.
- ❌ It is not FlowRail's kill switch. Burning is admin/root-controlled.

**Live-key revocation is `revokeKey`**, and it is root/admin-only. A FlowRail server that
cannot reach the customer's root key therefore **cannot revoke a live key it previously
created.** Say this plainly in the UI and in the pitch. Do not imply a "panic button"
exists if it does not.

**`VERIFIED` — fail-open.** Moderato's `authorizeKey` has no scopes parameter. A key
authorized with a cap and no `setAllowedCalls` spent pathUSD to an arbitrary address
(`0xa809a8dbf4f0f5df47dabf4c348fa9f98f8cbae53a46ddcf5caab3424b7f4715`). An empty
`getAllowedCalls` result is not a deny. Scope before the key is usable.

## 6. Events — `VERIFIED`

Seen in live Moderato logs:

| Event | topic0 |
|---|---|
| `KeyAuthorized(address,address,uint8,uint64)` | `0x7c46af0758d3eca5e8195833bff1e5153f6249fc0f2968a878fd28544315a03c` |
| `KeyRevoked(address,address)` | `0x14ce4f0c8c12936436b733974fb13d10fc13e8c41c06dc8e19d82001c93d7989` |

`KeyAuthorized` log data was **2 words**. No authorization transaction was visible in the
sampled block, which suggests it is raised internally/systematically rather than from a
directly-callable precompile tx — so do **not** assume you will find a standalone
authorization tx in a block by grepping. Follow the logs, not the block body.

## 7. `getKey` — `OPEN`

- For a **nonexistent** account/key pair it returned **160 zero bytes** (`VERIFIED`).
- The struct layout for a **populated** key has never been observed.

Until it is, `OnChainKey` in `src/ports/index.ts:74-83` is an **unverified guess**. Do not build
UI that renders decoded key fields from it. Probe it against a real key first.

## 8. Toolchain

| Package | Version | Notes |
|---|---|---|
| `accounts` | `0.19.0` | Official Tempo SDK. Peer-requires `viem >= 2.56.9`. |
| `viem` | `2.57.2` | Has first-class Tempo support: `viem/tempo`, `tempoModerato`. |
| `ox` | 0.14.x | Lower-level Tempo helpers (`KeyAuthorization`, `Period`, `Scopes`). |
| Node | `v26.4.0` | |
| `cast` (Foundry) | `1.7.1` | Available for raw RPC: `cast rpc tempo_fundAddress <addr>`. |

### The path we decided to use

`viem`'s Tempo client has first-class key-authorization actions, so **do not hand-roll RLP or
signing.** Canonical usage from viem's own docs:

```ts
import { createClient, http } from 'viem'
import { tempoModerato } from 'viem/tempo/chains'
import { tempoActions, Account } from 'viem/tempo'
import { generatePrivateKey } from 'viem/accounts'

const client = createClient({ account, chain: tempoModerato, transport: http() }).extend(tempoActions())

const accessKey = Account.fromP256(generatePrivateKey(), { access: account })

await client.accessKey.authorize({
  accessKey,
  expiry: Math.floor((Date.now() + 30_000) / 1000),
  limits: [{ token, limit, period }],   // period accepted by the type — see §1
  scopes,                                // undefined = UNRESTRICTED. See §5.
  witness,                              // optional 32 bytes
})
```

Also available on the decorator: `accessKey.authorizeSync`, `accessKey.burnWitness`, and witness
"was it burned?" checks. `KeyAuthorizationManager` exists for tracking pending authorizations.

**`admin: true` is a trap.** viem documents that admin keys are unrestricted and that
`expiry`, `limits`, and `scopes` are **ignored** (requires T6 hardfork). Never pass it.

The `accounts` package's **CLI** requires a browser Tempo Wallet device-code flow and is not
usable for automation here. Use its server-side pinned `secp256k1` adapter for the spike root key.