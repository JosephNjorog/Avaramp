import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  phone?: string;
  kycStatus: string;
}

interface AuthState {
  user:    User | null;
  token:   string | null;
  setAuth: (user: User, token: string) => void;
  logout:  () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:  null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") localStorage.setItem("avaramp_token", token);
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("avaramp_token");
        set({ user: null, token: null });
      },
    }),
    { name: "avaramp-auth", partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);
