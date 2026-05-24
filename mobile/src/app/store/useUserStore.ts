/**
 * File:        mobile/src/app/store/useUserStore.ts
 * Module:      Mobile · Auth Store
 * Purpose:     Zustand store for user profile data, persisted to localStorage.
 *
 * Exports:
 *   - useUserStore — Zustand store with UserState interface
 *
 * Depends on:
 *   - @/store/useAuthStore — clears auth state on logout
 *   - @/api/apiClient — fetches user profile from backend
 *
 * Side-effects:
 *   - Reads/writes localStorage via zustand persist middleware
 *   - HTTP GET /users/:id/profile on hydrate()
 *
 * Key invariants:
 *   - hydrate() is silent-fail — existing values are preserved on error
 *   - isEmpty() returns true when name is falsy (used to detect missing profile)
 *
 * Read order:
 *   1. UserProfile — data shape
 *   2. UserState — store interface
 *   3. defaults — initial state values
 *   4. useUserStore — the store itself
 *
 * Author:      Aman Sharma
 * Last-updated: 2026-05-24
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/apiClient';

export interface UserProfile {
  name: string;
  email: string;
  location: string;
  joinDate: string;
  totalMatches: number;
  contestsWon: number;
  verified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface UserState extends UserProfile {
  hydrate: (userId: number) => Promise<void>;
  update: (data: Partial<UserProfile>) => void;
  logout: () => void;
  isEmpty: () => boolean;
}

const defaults: UserProfile = {
  name: '',
  email: '',
  location: '',
  joinDate: '',
  totalMatches: 0,
  contestsWon: 0,
  verified: false,
  kycStatus: 'pending',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...defaults,

      hydrate: async (userId: number) => {
        try {
          const response = await apiClient.get(`/users/${userId}/profile`);
          const data = response.data as Partial<UserProfile>;
          set({
            name: data.name ?? '',
            email: data.email ?? '',
            location: data.location ?? '',
            joinDate: data.joinDate ?? '',
            totalMatches: data.totalMatches ?? 0,
            contestsWon: data.contestsWon ?? 0,
            verified: data.verified ?? false,
            kycStatus: data.kycStatus ?? 'pending',
          });
        } catch {
          // Silent degradation — existing values are preserved
        }
      },

      update: (data: Partial<UserProfile>) => {
        set(data);
      },

      logout: () => {
        set({ ...defaults });
      },

      isEmpty: () => {
        return !get().name;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);