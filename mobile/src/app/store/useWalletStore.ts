/**
 * File:        mobile/src/app/store/useWalletStore.ts
 * Module:      Mobile · Auth Store
 * Purpose:     Zustand store for wallet balance, cashback, and winnings state with hydration from the API.
 *
 * Exports:
 *   - useWalletStore                    — Zustand store (extends WalletState)
 *
 * Depends on:
 *   - zustand                          — state management
 *   - @/app/api/apiClient              — axios client with auth interceptor
 *
 * Side-effects:
 *   - Reads/writes wallet-storage in localStorage (via persist middleware)
 *   - Calls GET /api/wallet/:userId/balance on hydrate
 *
 * Key invariants:
 *   - hydrate() requires a valid userId; if the API call fails the existing values are preserved silently
 *
 * Read order:
 *   1. WalletState — data shape and store interface
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-05-24
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { apiClient } from '../api/apiClient';

interface WalletState {
  balance: number;
  cashback: number;
  winnings: number;
  loading: boolean;

  hydrate: (userId: number) => Promise<void>;
  setBalance: (balance: number) => void;
  addCashback: (amount: number) => void;
  logout: () => void;
  isEmpty: () => boolean;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      cashback: 0,
      winnings: 0,
      loading: false,

      hydrate: async (userId: number) => {
        set({ loading: true });
        try {
          const { data } = await apiClient.get(`/wallet/${userId}/balance`);
          set({
            balance: data.balance ?? get().balance,
            cashback: data.cashback ?? get().cashback,
            winnings: data.winnings ?? get().winnings,
          });
        } catch {
          // Silently keep existing values on failure.
        } finally {
          set({ loading: false });
        }
      },

      setBalance: (balance: number) => set({ balance }),

      addCashback: (amount: number) =>
        set({ cashback: get().cashback + amount }),

      logout: () =>
        set({ balance: 0, cashback: 0, winnings: 0, loading: false }),

      isEmpty: () => {
        const { balance, cashback, winnings } = get();
        return balance === 0 && cashback === 0 && winnings === 0;
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
