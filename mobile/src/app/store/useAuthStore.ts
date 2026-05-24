/**
 * File:        mobile/src/app/store/useAuthStore.ts
 * Module:      Mobile · Auth State
 * Purpose:     Persisted auth state (token + userId) for the mobile/web app.
 *
 * Exports:
 *   - useAuthStore — zustand store with login/logout actions and persisted token
 *
 * Depends on:
 *   - zustand/middleware — persist middleware for localStorage persistence on web
 *
 * Side-effects:
 *   - Writes to localStorage (web) via zustand persist on every state change
 *
 * Key invariants:
 *   - token is the raw JWT returned by POST /api/auth/login
 *   - userId is decoded from the JWT sub claim after login
 *   - On web (react-native-web), localStorage is synchronous so persist reads are instant
 *
 * Author:      Aman Sharma
 * Last-updated: 2026-05-10
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  userName: string | null;

  login: (token: string, userId: number, email: string, userName?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      email: null,
      userName: null,

      login: (token, userId, email, userName = null) => set({ token, userId, email, userName }),
      logout: () => set({ token: null, userId: null, email: null, userName: null }),
      isAuthenticated: () => get().token !== null,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
