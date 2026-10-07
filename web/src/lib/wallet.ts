"use client";

import { Provider, tempoWallet } from "accounts";
import { tempoModerato } from "viem/tempo/chains";
import { create } from "zustand";

type WalletState = {
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

let provider: ReturnType<typeof Provider.create> | null = null;

const CONNECT_TIMEOUT_MS = 10_000;

function getProvider() {
  provider ??= Provider.create({
    adapter: tempoWallet(),
    chains: [tempoModerato],
    testnet: true,
  });
  return provider;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  connecting: false,
  error: null,
  async connect() {
    set({ connecting: true, error: null });
    let timedOut = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const request = getProvider().request({ method: "wallet_connect" });
      timer = setTimeout(() => {
        timedOut = true;
        set({
          connecting: false,
          error:
            "No wallet responded in 10 seconds. Approve the request in your wallet, or install a Tempo-compatible wallet to sign.",
        });
      }, CONNECT_TIMEOUT_MS);
      const result = (await request) as {
        accounts?: readonly { address?: string }[];
      };
      set({
        address: result.accounts?.[0]?.address ?? null,
        connecting: false,
        error: null,
      });
    } catch (err) {
      if (!timedOut) {
        set({
          connecting: false,
          error:
            err instanceof Error
              ? err.message.split("\n")[0]
              : "Wallet refused the connection.",
        });
      }
    } finally {
      clearTimeout(timer);
    }
  },
  async disconnect() {
    await getProvider().request({ method: "wallet_disconnect" }).catch(() => undefined);
    set({ address: null, error: null });
  },
}));
