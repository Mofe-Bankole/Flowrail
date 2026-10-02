import { createPublicClient, http, type Address } from "viem";
import { tempoModerato } from "viem/tempo/chains";

export const PATH_USD = "0x20c0000000000000000000000000000000000000" as const;
export const AGENT = "0xd8BB65b3a8e316478c0ae94Cc0cad5C0517729ad" as const;
export const EXPLORER = "https://explore.testnet.tempo.xyz";

const TIP20 = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

export async function readDesk() {
  const client = createPublicClient({ chain: tempoModerato, transport: http() });
  const [head, raw] = await Promise.all([
    client.getBlockNumber(),
    client.readContract({
      address: PATH_USD,
      abi: TIP20,
      functionName: "balanceOf",
      args: [AGENT],
    }),
  ]);
  const scale = BigInt(1_000_000);
  const whole = raw / scale;
  const frac = (raw % scale).toString().padStart(6, "0").replace(/0+$/, "");
  return {
    chainId: tempoModerato.id,
    head: head.toString(),
    address: AGENT as Address,
    pathUsd: frac ? `${whole}.${frac}` : whole.toString(),
  };
}
