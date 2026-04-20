import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WalletState {
  isInstalled: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
  setInstalled: (value: boolean) => void;
  setConnection: (connected: boolean, publicKey: string | null, network: string | null) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isInstalled: false,
      isConnected: false,
      publicKey: null,
      network: null,
      isLoading: false,
      error: null,
      setInstalled: (value) => set({ isInstalled: value }),
      setConnection: (connected, publicKey, network) =>
        set({ isConnected: connected, publicKey, network, error: null }),
      setLoading: (value) => set({ isLoading: value }),
      setError: (value) => set({ error: value }),
      disconnect: () => set({ isConnected: false, publicKey: null, network: null, error: null })
    }),
    { name: "paluwaga-wallet-state" }
  )
);
