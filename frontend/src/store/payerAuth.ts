import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PayerUser {
  id:            string;
  walletAddress: string;
  phone?:        string;
  email?:        string;
  kycStatus:     string;
  createdAt:     string;
}

interface PayerAuthState {
  user:       PayerUser | null;
  token:      string | null;
  isNew:      boolean;          // true on first sign-in (welcome message)
  setAuth:    (user: PayerUser, token: string, isNew: boolean) => void;
  setUser:    (user: PayerUser) => void;
  logout:     () => void;
}

const PAYER_TOKEN_KEY = "avaramp_payer_token";

export const usePayerAuth = create<PayerAuthState>()(
  persist(
    (set) => ({
      user:    null,
      token:   null,
      isNew:   false,

      setAuth: (user, token, isNew) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(PAYER_TOKEN_KEY, token);
        }
        set({ user, token, isNew });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(PAYER_TOKEN_KEY);
        }
        set({ user: null, token: null, isNew: false });
      },
    }),
    {
      name:       "avaramp-payer-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
