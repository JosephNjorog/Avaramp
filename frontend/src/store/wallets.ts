import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedWallet {
  address:     string;
  name:        string;
  connectorId: string;
  addedAt:     number;
}

interface WalletStore {
  wallets:       SavedWallet[];
  activeAddress: string | null;
  addWallet:     (wallet: SavedWallet) => void;
  removeWallet:  (address: string) => void;
  setActive:     (address: string) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      wallets:       [],
      activeAddress: null,

      addWallet: (wallet) =>
        set((state) => {
          const exists = state.wallets.find(
            (w) => w.address.toLowerCase() === wallet.address.toLowerCase()
          );
          if (exists) return { activeAddress: exists.address };
          return {
            wallets:       [...state.wallets, wallet],
            activeAddress: wallet.address,
          };
        }),

      removeWallet: (address) =>
        set((state) => {
          const remaining = state.wallets.filter((w) => w.address !== address);
          return {
            wallets: remaining,
            activeAddress:
              state.activeAddress === address
                ? (remaining[0]?.address ?? null)
                : state.activeAddress,
          };
        }),

      setActive: (address) => set({ activeAddress: address }),
    }),
    { name: "avaramp-wallets" }
  )
);
