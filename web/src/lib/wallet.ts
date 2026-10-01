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
    try {
      const result = (await getProvider().request({
        method: "wallet_connect",
      })) as { accounts?: readonly { address?: string }[] };
      set({ address: result.accounts?.[0]?.address ?? null, connecting: false });
    } catch (err) {
      set({
        connecting: false,
        error: err instanceof Error ? err.message.split("\n")[0] : "Wallet refused the connection.",
      });
    }
  },
  async disconnect() {
    await getProvider().request({ method: "wallet_disconnect" }).catch(() => undefined);
    set({ address: null, error: null });
  },
}));
