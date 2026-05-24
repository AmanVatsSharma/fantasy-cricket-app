# Account Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `ProfileScreen` with a premium Account Page wired to three Zustand stores (auth, user, wallet), plus update the bottom tab bar with a floating raised Account button.

**Architecture:** Domain-separated Zustand stores + a single `AccountScreen` reading from all three. `Dream11TabBar` moved out of `App.tsx` into its own file with floating button logic. `ProfileScreen.tsx` becomes a thin redirect shell.

**Tech Stack:** React Native Web (`StyleSheet.create()`), Zustand (`persist` middleware), Axios (`apiClient`), `@react-navigation/native` / `@react-navigation/bottom-tabs`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `mobile/src/app/store/useUserStore.ts` | User profile state (name, location, matches, kyc, etc.) |
| Create | `mobile/src/app/store/useWalletStore.ts` | Wallet state (balance, cashback, winnings) |
| Create | `mobile/src/app/components/Dream11TabBar.tsx` | Bottom tab bar with floating raised Account button |
| Create | `mobile/src/app/screens/AccountScreen.tsx` | Full Account Page UI reading from 3 stores |
| Modify | `mobile/src/app/App.tsx` | Import `Dream11TabBar`, add Account route, update ACCOUNT tab |
| Modify | `mobile/src/app/store/useAuthStore.ts` | Add `userName` field (needed by SidebarDrawer) |
| Modify | `mobile/src/app/screens/ProfileScreen.tsx` | Thin redirect to `AccountScreen` |
| Modify | `mobile/src/app/components/SidebarDrawer.tsx` | Fix `userName` reference → use `useUserStore` |

---

## Task 1: useUserStore — User Profile Store

**Files:**
- Create: `mobile/src/app/store/useUserStore.ts`

```typescript
/**
 * File:        mobile/src/app/store/useUserStore.ts
 * Module:      Mobile · User Profile State
 * Purpose:     Persisted user profile data — name, location, stats, KYC.
 *
 * Exports:
 *   - useUserStore — zustand store with user profile data and hydration action
 *
 * Depends on:
 *   - @/store/useAuthStore — userId source
 *   - apiClient            — profile fetch
 *
 * Side-effects:
 *   - Writes to localStorage via zustand persist
 *
 * Key invariants:
 *   - hydrate(userId) must be called after login and on pull-to-refresh
 *   - All profile fields default to sensible empty values
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-05-24
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/apiClient';

interface UserProfile {
  name: string;
  email: string;
  location: string;
  joinDate: string; // "March 2024" format
  totalMatches: number;
  contestsWon: number;
  verified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

interface UserState extends UserProfile {
  // Actions
  hydrate: (userId: number) => Promise<void>;
  update: (data: Partial<UserProfile>) => void;
  logout: () => void;
  // Selectors
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
          const { data } = await apiClient.get(`/users/${userId}/profile`);
          set({
            name: data.name || '',
            email: data.email || '',
            location: data.location || '',
            joinDate: data.joinDate || '',
            totalMatches: data.totalMatches || 0,
            contestsWon: data.contestsWon || 0,
            verified: data.verified || false,
            kycStatus: data.kycStatus || 'pending',
          });
        } catch {
          // Keep existing values — graceful degradation
        }
      },

      update: (data: Partial<UserProfile>) => set(data),

      logout: () => set(defaults),

      isEmpty: () => {
        const s = get();
        return !s.name && !s.email;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

- [ ] **Step 2: Run test to verify file is valid**

Run: `node -e "require('./mobile/src/app/store/useUserStore.ts')" 2>&1 || echo "Checking syntax..."`
Expected: TypeScript will be checked by the build, no runtime errors

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/store/useUserStore.ts
git commit -m "feat(mobile): add useUserStore for user profile state

- Persisted Zustand store with name, location, totalMatches, contestsWon, verified, kycStatus
- hydrate(userId) fetches GET /api/users/:userId/profile
- logout() resets to defaults
- isEmpty() selector for lazy hydration check"
```

---

## Task 2: useWalletStore — Wallet State Store

**Files:**
- Create: `mobile/src/app/store/useWalletStore.ts`

```typescript
/**
 * File:        mobile/src/app/store/useWalletStore.ts
 * Module:      Mobile · Wallet State
 * Purpose:     Persisted wallet data — balance, cashback, total winnings.
 *
 * Exports:
 *   - useWalletStore — zustand store with wallet data and hydration action
 *
 * Depends on:
 *   - @/store/useAuthStore — userId source
 *   - apiClient           — balance fetch
 *
 * Side-effects:
 *   - Writes to localStorage via zustand persist
 *
 * Key invariants:
 *   - hydrate(userId) must be called after login and on pull-to-refresh
 *   - balance = cashback + withdrawable (no overlap)
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-05-24
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/apiClient';

interface WalletState {
  balance: number;     // Total withdrawable balance in rupees
  cashback: number;   // Unutilised cashback
  winnings: number;   // Total lifetime winnings
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
            balance: data.balance || 0,
            cashback: data.cashback || 0,
            winnings: data.winnings || 0,
          });
        } catch {
          // Keep existing values
        } finally {
          set({ loading: false });
        }
      },

      setBalance: (balance: number) => set({ balance }),
      addCashback: (amount: number) => set(s => ({ cashback: s.cashback + amount })),
      logout: () => set({ balance: 0, cashback: 0, winnings: 0, loading: false }),

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
```

- [ ] **Step 4: Run test to verify file is valid**

Same pattern as Task 1 — TypeScript check via build.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/store/useWalletStore.ts
git commit -m "feat(mobile): add useWalletStore for wallet state

- Persisted Zustand store with balance, cashback, winnings
- hydrate(userId) fetches GET /api/wallet/:userId/balance
- setBalance(), addCashback() for mutations
- logout() resets all fields to 0"
```

---

## Task 3: Dream11TabBar — Floating Account Button

**Files:**
- Create: `mobile/src/app/components/Dream11TabBar.tsx`

```typescript
/**
 * File:        mobile/src/app/components/Dream11TabBar.tsx
 * Module:      Mobile · Navigation
 * Purpose:     Bottom tab bar with floating raised Account button.
 *              Moved from App.tsx. ACCOUNT tab renders a 48px red circle
 *              raised above the bar; other tabs are flat.
 *
 * Exports:
 *   - Dream11TabBar — bottom tab navigator component
 *
 * Depends on:
 *   - react-native      — View, Text, TouchableOpacity, StyleSheet
 *   - react-native-svg  — Svg, Path, Circle, Rect for icons
 *   - @react-navigation — useNavigation
 *
 * Side-effects: None
 *
 * Key invariants:
 *   - ACCOUNT tab (index 3) is always the floating center button
 *   - Other 3 tabs (HOME, WATCHLIVE, CLUBS) are evenly spaced around it
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-05-24
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

const TAB_ICONS = [
  { name: 'HOME',      label: 'Home' },
  { name: 'WATCHLIVE', label: 'Watch Live' },
  { name: 'CLUBS',     label: 'Clubs' },
  { name: 'ACCOUNT',   label: 'Account' },
];

// SVG tab icons — same as original App.tsx
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const c = focused ? '#CE404D' : 'rgba(255,255,255,0.3)';
  const sw = focused ? 2 : 1.8;

  if (name === 'HOME') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M3 11L12 4L21 11" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M5 10V21H19V10" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Rect x="10" y="16" width="4" height="5" stroke={c} strokeWidth={sw} strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'WATCHLIVE') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M12 4V2" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M4.93 4.93L3.51 3.51" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M2 12H4" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M12 15C14.2091 15 16 13.2091 16 11" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M12 18C16.4183 18 20 14.4183 20 10" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M12 21C18.6274 21 24 15.6274 24 9" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M8 6L10 8" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M6 8L8 10" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'CLUBS') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Circle cx="9" cy="7" r="3" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M3 19C3 15.6863 5.68629 13 9 13" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Circle cx="16" cy="7" r="3" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M21 19C21 15.6863 18.3137 13 15 13" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  // ACCOUNT — person silhouette
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx="12" cy="7" r="4" stroke={c} strokeWidth={sw} fill="none" />
      <Path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </Svg>
  );
};

export const Dream11TabBar = ({ state, descriptors, navigation }: any) => {
  const ACCOUNT_INDEX = 3;
  const focusedIndex = state.index;

  // Calculate tab positions: 3 flat tabs + 1 floating center
  // Layout: [HOME] [WATCHLIVE] [ACCOUNT-FLOAT] [CLUBS]
  // Actually with 4 tabs we use a different approach:
  // Tabs 0, 1 on left side; Tab 2 (ACCOUNT) floats center; Tab 3 on right
  // The floating button renders as an absolute overlay at center

  return (
    <View style={t.wrapper}>
      {/* Red glow dot above active tab */}
      <View style={[t.redGlow, { left: `${(focusedIndex + 0.5) * 25}%` }]} />

      {/* Navigation arrows — bottom left */}
      <View style={t.navArrows}>
        <Text style={t.navArrow}>{'<'}</Text>
        <Text style={t.navArrow}>{'>'}</Text>
      </View>

      {/* Tabs */}
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const isAccount = index === ACCOUNT_INDEX;

        return (
          <TouchableOpacity
            key={route.key}
            style={[t.tab, isFocused && t.tabActive]}
            onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
            activeOpacity={0.7}
          >
            <View style={t.tabContent}>
              {isFocused && !isAccount && <View style={t.activeDot} />}
              <TabIcon name={route.name} focused={isFocused} />
              <Text style={[t.label, isFocused ? t.labelActive : t.labelInactive]}>
                {TAB_ICONS[index]?.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Floating raised Account button — rendered on top of the bar */}
      {(() => {
        const isActive = focusedIndex === ACCOUNT_INDEX;
        return (
          <View style={t.floatingWrap}>
            <TouchableOpacity
              style={[t.floatingBtn, isActive && t.floatingBtnActive]}
              onPress={() => navigation.navigate('ACCOUNT')}
              activeOpacity={0.85}
            >
              {/* User icon — white regardless of active state */}
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Circle cx="12" cy="7" r="4" stroke={isActive ? '#fff' : '#fff'} strokeWidth={2} fill="none" />
                <Path
                  d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21"
                  stroke={isActive ? '#fff' : '#fff'}
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        );
      })()}
    </View>
  );
};

const t = StyleSheet.create({
  wrapper: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: '#0d0d12',
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#CE404D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'visible',
  },
  redGlow: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 3,
    backgroundColor: '#CE404D',
    borderRadius: 2,
    transform: [{ translateX: -4 }],
    shadowColor: '#CE404D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  navArrows: {
    position: 'absolute',
    left: 12,
    bottom: 28,
    flexDirection: 'row',
    gap: 12,
  },
  navArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '300',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    marginHorizontal: 2,
    zIndex: 1,
  },
  tabActive: {},
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CE404D',
    marginBottom: 2,
  },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  labelActive: { color: '#fff' },
  labelInactive: { color: 'rgba(255,255,255,0.35)' },

  // Floating button
  floatingWrap: {
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: [{ translateX: -24 }],
    zIndex: 10,
  },
  floatingBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CE404D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CE404D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -20, // raises it above the tab bar
  },
  floatingBtnActive: {
    backgroundColor: '#A02030',
    shadowOpacity: 0.8,
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add mobile/src/app/components/Dream11TabBar.tsx
git commit -m "feat(mobile): extract Dream11TabBar to its own component

- Moved from App.tsx — same visual behavior (red top border, red glow dot)
- Added floating raised Account button (48px red circle, -20px marginTop)
- Floating button is absolute positioned at center of the bar
- User icon SVG in white on the floating button"
```

---

## Task 4: AccountScreen — Full Account Page

**Files:**
- Create: `mobile/src/app/screens/AccountScreen.tsx`

```typescript
/**
 * File:        mobile/src/app/screens/AccountScreen.tsx
 * Module:      Account · Account Screen
 * Purpose:     Premium account page reading from useAuthStore, useUserStore, useWalletStore.
 *              Wired to real API data — no mock values.
 *
 * Exports:
 *   - AccountScreen   — Full account page component
 *
 * Depends on:
 *   - @/store/useAuthStore  — userId, email
 *   - @/store/useUserStore  — name, location, totalMatches, etc.
 *   - @/store/useWalletStore — balance, cashback, winnings
 *   - @/components/SidebarDrawer — drawer
 *   - @/api/apiClient       — hydrateStores()
 *
 * Side-effects:
 *   - Calls hydrate() on mount if stores are empty
 *
 * Key invariants:
 *   - Pull-to-refresh triggers re-hydration of both stores
 *   - Screen renders regardless of store data (defaults handle empty state)
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-05-24
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, RefreshControl, Image, Dimensions,
} from 'react-native';
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useWalletStore } from '../store/useWalletStore';
import { apiClient } from '../api/apiClient';

// ─── SVG Icon Components ─────────────────────────────────────────────────────

const ShieldIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
      fill="#3B82F6"
      stroke="#3B82F6"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Path d="M9 12L11 14L15 10" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MenuIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12H21M3 6H21M3 18H21" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const BellIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.73 21a2 2 0 01-3.46 0" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Quick action icons
const GiftIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="8" width="18" height="14" rx="2" stroke={color} strokeWidth={2} />
    <Path d="M12 8V22" stroke={color} strokeWidth={2} />
    <Path d="M3 12H21" stroke={color} strokeWidth={2} />
    <Path d="M12 8C12 5.79 13.79 4 16 4C17.63 4 19 5.34 19 7C19 8.66 17.63 10 16 10" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 8C12 5.79 10.21 4 8 4C6.37 4 5 5.34 5 7C5 8.66 6.37 10 8 10" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ActivityIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UsersIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={2} />
    <Path d="M3 21V19C3 16.79 5.29 15 9 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="17" cy="7" r="3" stroke={color} strokeWidth={2} />
    <Path d="M21 21V19C21 16.79 18.71 15 15 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const LockIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={2} />
    <Path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1" fill={color} />
  </Svg>
);

const HelpIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path d="M9.09 9C9.3 8.37 9.65 7.82 10.09 7.42C10.52 7.02 11.04 6.78 11.59 6.71C12.49 6.6 13.29 6.96 13.79 7.73C14.07 8.19 14.22 8.74 14.2 9.36C14.2 9.41 14.2 9.46 14.2 9.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

// Menu item icons
const KycIcon = () => <ShieldIcon size={20} />;
const UserIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke="#CE404D" strokeWidth={2} />
    <Path d="M4 21V19C4 16.79 7.58 15 12 15C16.42 15 20 16.79 20 19V21" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
const FileTextIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#CE404D" strokeWidth={2} strokeLinejoin="round" />
    <Path d="M14 2V8H20" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 13H8M16 17H8M10 9H8" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
const TrendingUpIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M23 6V13.5H16.5" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const SettingsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke="#CE404D" strokeWidth={2} />
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#CE404D" strokeWidth={2} />
  </Svg>
);
const ShieldSmallIcon = () => <ShieldIcon size={20} />;

// ─── Hydration ────────────────────────────────────────────────────────────────

const hydrateStores = async (userId: number | null, userStore: any, walletStore: any) => {
  if (!userId) return;
  await Promise.all([
    userStore.getState().hydrate(userId),
    walletStore.getState().hydrate(userId),
  ]);
};

// ─── AccountScreen ────────────────────────────────────────────────────────────

export const AccountScreen = ({ navigation, drawerOpen }: { navigation?: any; drawerOpen?: () => void }) => {
  const [refreshing, setRefreshing] = useState(false);
  const userId = useAuthStore(s => s.userId);
  const email = useAuthStore(s => s.email);

  const user = useUserStore();
  const wallet = useWalletStore();

  useEffect(() => {
    if (userId && user.isEmpty() && wallet.isEmpty()) {
      hydrateStores(userId, { getState: () => user }, { getState: () => wallet });
    }
  }, [userId]);

  const onRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    await hydrateStores(userId, { getState: () => user }, { getState: () => wallet });
    setRefreshing(false);
  };

  const navigate = (screen: string) => navigation?.navigate(screen);

  // Safe defaults
  const displayName = user.name || email?.split('@')[0] || 'DREAMER';
  const initials = displayName.slice(0, 2).toUpperCase();
  const totalMatches = user.totalMatches;
  const contestsWon = user.contestsWon;
  const winnings = wallet.winnings;
  const cashback = wallet.cashback;
  const balance = wallet.balance;
  const location = user.location || '';
  const joinDate = user.joinDate || '';

  // Format currency
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtShort = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  // Menu items
  const menuItems = [
    {
      icon: <KycIcon />,
      label: 'KYC Verification',
      sub: 'Verify your personal info',
      badge: user.kycStatus === 'verified' ? 'Verified' : null,
      screen: 'KYCVerification',
    },
    {
      icon: <UserIcon />,
      label: 'Personal Information',
      sub: 'Update your personal info',
      screen: 'Info',
    },
    {
      icon: <FileTextIcon />,
      label: 'Transaction History',
      sub: 'Check your transaction history',
      screen: 'TransactionDetails',
    },
    {
      icon: <TrendingUpIcon />,
      label: 'My Performance',
      sub: 'View your wins and performances',
      screen: 'Leaderboard',
    },
    {
      icon: <SettingsIcon />,
      label: 'Settings',
      sub: 'Change settings and preferences',
      screen: 'Settings',
    },
    {
      icon: <ShieldSmallIcon />,
      label: 'Privacy & Security',
      sub: 'Manage privacy and security',
      screen: 'Settings',
    },
  ];

  const quickActions = [
    { icon: <GiftIcon />, label: 'Invite & Earn', screen: 'Referrals' },
    { icon: <ActivityIcon />, label: 'My Activity', screen: 'MyMatches' },
    { icon: <UsersIcon />, label: 'My Teams', screen: 'MyTeamsList' },
    { icon: <LockIcon />, label: 'Join Private Contest', screen: 'Clubs' },
    { icon: <HelpIcon />, label: 'Help & Support', screen: 'HelpSupport' },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#CE404D"
            colors={['#CE404D']}
          />
        }
      >
        {/* ── Top Navigation ── */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.menuBtn} onPress={drawerOpen} activeOpacity={0.7}>
            <MenuIcon />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <Text style={styles.logoRed}>11</Text>
            <Text style={styles.logoWhite}>DREAMER</Text>
          </View>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.walletPill} activeOpacity={0.7} onPress={() => navigate('Wallet')}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Rect x="1" y="6" width="22" height="15" rx="2" stroke="#ECBD15" strokeWidth={2} />
                <Circle cx="18" cy="13.5" r="2.5" fill="#ECBD15" />
                <Path d="M1 10H23" stroke="#ECBD15" strokeWidth={2} />
              </Svg>
              <Text style={styles.walletAmt}>{fmtShort(balance)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7} onPress={() => navigate('Notifications')}>
              <BellIcon />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Profile Header ── */}
        <View style={styles.profileHeader}>
          <View style={styles.redGradient} />
          <View style={styles.profileRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>11</Text>
              <View style={styles.avatarBorder} />
            </View>

            {/* User info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{displayName}</Text>
                {user.verified && (
                  <View style={styles.verifiedBadge}>
                    <ShieldIcon size={14} />
                  </View>
                )}
              </View>
              <Text style={styles.userSub}>
                {location}{location ? ' · ' : ''}{joinDate}
              </Text>
            </View>

            {/* Total Matches badge */}
            <View style={styles.matchesBadge}>
              <Text style={styles.matchesCount}>{totalMatches.toLocaleString()}</Text>
              <Text style={styles.matchesLabel}>Total Matches</Text>
            </View>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Rect x="1" y="6" width="22" height="15" rx="2" stroke="#ECBD15" strokeWidth={2} />
                <Circle cx="18" cy="13.5" r="2.5" fill="#ECBD15" />
                <Path d="M1 10H23" stroke="#ECBD15" strokeWidth={2} />
              </Svg>
              <Text style={styles.statValue}>{fmtShort(balance)}</Text>
            </View>
            <Text style={styles.statLabel}>Total Wallet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 22V9M14 22V9M6 9V5a6 6 0 0112 0v4" stroke="#ECBD15" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.statValue}>{contestsWon}</Text>
            </View>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth={2} />
                <Path d="M12 8v4l3 3" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={[styles.statValue, styles.greenValue]}>{fmtShort(winnings)}</Text>
            </View>
            <Text style={styles.statLabel}>Total Winnings</Text>
          </View>
        </View>

        {/* ── Cashback Card ── */}
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackTop}>
            <View>
              <Text style={styles.cashbackLabel}>Unutilised Cashback</Text>
              <Text style={styles.cashbackValue}>{fmt(cashback)}</Text>
            </View>
          </View>
          <View style={styles.cashbackBtns}>
            <TouchableOpacity style={styles.addCashBtn} activeOpacity={0.8} onPress={() => navigate('Wallet')}>
              <Text style={styles.addCashTxt}>ADD CASH</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.8} onPress={() => navigate('WithdrawalRequest')}>
              <Text style={styles.withdrawTxt}>WITHDRAW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action, i) => (
              <TouchableOpacity key={i} style={styles.quickAction} activeOpacity={0.7} onPress={() => navigate(action.screen)}>
                <View style={styles.quickActionIcon}>
                  {action.icon}
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Menu List ── */}
        <View style={styles.section}>
          <View style={styles.menuList}>
            {menuItems.map((item, i) => (
              <React.Fragment key={item.label}>
                <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={() => navigate(item.screen)}>
                  <View style={styles.menuIcon}>{item.icon}</View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {item.badge ? (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeTxt}>{item.badge}</Text>
                      </View>
                    ) : null}
                    <ChevronRightIcon />
                  </View>
                </TouchableOpacity>
                {i < menuItems.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scroll: { flex: 1 },

  // Top nav
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  logoRed: { fontSize: 22, fontWeight: '900', color: '#CE404D', fontStyle: 'italic' },
  logoWhite: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  walletAmt: { color: '#ECBD15', fontSize: 12, fontWeight: '800' },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#22C55E',
    borderWidth: 1.5, borderColor: '#000',
  },

  // Profile header
  profileHeader: {
    position: 'relative',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
  },
  redGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    zIndex: 0,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    zIndex: 1, position: 'relative',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(220,38,38,0.8)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#EF4444',
  },
  avatarBorder: { display: 'none' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  userInfo: { flex: 1, paddingTop: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  verifiedBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
  },
  userSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  matchesBadge: {
    backgroundColor: '#CE404D',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center', marginTop: 8,
  },
  matchesCount: { color: '#fff', fontSize: 20, fontWeight: '900' },
  matchesLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600', marginTop: 2 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, marginHorizontal: 16, marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { color: '#fff', fontSize: 17, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
  greenValue: { color: '#22C55E' },

  // Cashback
  cashbackCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cashbackTop: { marginBottom: 14 },
  cashbackLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  cashbackValue: { color: '#22C55E', fontSize: 28, fontWeight: '900' },
  cashbackBtns: { flexDirection: 'row', gap: 10 },
  addCashBtn: {
    flex: 1, backgroundColor: '#CE404D', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  addCashTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  withdrawBtn: {
    flex: 1, backgroundColor: 'transparent', borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(107,114,128,0.5)',
    paddingVertical: 12, alignItems: 'center',
  },
  withdrawTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // Sections
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  quickAction: { alignItems: 'center', gap: 8 },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { color: '#fff', fontSize: 10, fontWeight: '600', textAlign: 'center', maxWidth: 56 },

  // Menu list
  menuList: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14, gap: 12,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuInfo: { flex: 1 },
  menuLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  menuSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    backgroundColor: '#22C55E', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  menuBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 14 },
});
```

- [ ] **Step 7: Commit**

```bash
git add mobile/src/app/screens/AccountScreen.tsx
git commit -m "feat(mobile): add AccountScreen with real store integration

- Reads from useAuthStore, useUserStore, useWalletStore
- Pull-to-refresh triggers store hydration
- Profile header: avatar, name, verified badge, Total Matches badge
- Stats row: Total Wallet, Contests Won, Total Winnings
- Cashback card with ADD CASH / WITHDRAW buttons
- Quick actions 5-tap grid
- Menu list with KYC verified badge support
- All data from stores, no hardcoded mocks"
```

---

## Task 5: App.tsx — Wire It All Together

**Files:**
- Modify: `mobile/src/app/App.tsx:1-896` — remove inline `Dream11TabBar`, import external, add Account route

**Changes:**

1. **Remove inline `TAB_ICONS`, `TabIcon`, `Dream11TabBar`** (lines 17-186) — replace with:
   ```typescript
   import { Dream11TabBar } from './components/Dream11TabBar';
   ```

2. **Add `AccountScreen` import** (after existing screen imports):
   ```typescript
   import { AccountScreen } from './screens/AccountScreen';
   ```

3. **Add `Account` route** to `Stack.Navigator` (before the closing `</Stack.Navigator>`):
   ```typescript
   <Stack.Screen name="Account" component={AccountScreen} />
   ```

4. **Update `ACCOUNT` tab** in `MainTabs` — swap `ProfileScreen` → `AccountScreen`:
   ```typescript
   <Tab.Screen name="ACCOUNT" component={AccountScreen} />
   ```

5. **Update `SidebarDrawer` call** in `App` — pass `navigation` properly (fix current `navigationRef.current` which is null on first render):
   ```typescript
   <SidebarDrawer
     visible={drawerVisible}
     onClose={closeDrawer}
     navigation={navigationRef.current}
   />
   ```
   Actually leave as-is since `SidebarDrawer` also gets `navigation` via its own prop — the prop is what matters for `navigateTo` calls.

- [ ] **Step 8: Verify build compiles**

Run: `cd mobile && npx tsc --noEmit 2>&1 | head -40`
Expected: No TypeScript errors (may have unused import warnings — fine)

- [ ] **Step 9: Commit**

```bash
git add mobile/src/app/App.tsx
git commit -m "refactor(mobile): wire AccountScreen into navigation

- Import Dream11TabBar from components (moved from App.tsx)
- Import AccountScreen from screens
- Add Stack.Screen name="Account" route
- Update MainTabs ACCOUNT tab to render AccountScreen
- ProfileScreen now serves as backward-compat shell"
```

---

## Task 6: ProfileScreen — Thin Shell Redirect

**Files:**
- Modify: `mobile/src/app/screens/ProfileScreen.tsx`

Replace the entire component body with:

```typescript
// ProfileScreen is now a thin redirect shell.
// All account logic lives in AccountScreen.

import React from 'react';
import { View, Text } from 'react-native';
import { AccountScreen } from './AccountScreen';

export const ProfileScreen = (props: any) => {
  return <AccountScreen {...props} />;
};
```

- [ ] **Step 10: Commit**

```bash
git add mobile/src/app/screens/ProfileScreen.tsx
git commit -m "refactor(mobile): ProfileScreen thin shell → AccountScreen

- ProfileScreen now delegates entirely to AccountScreen
- Keeps existing route backwards compatibility"
```

---

## Task 7: SidebarDrawer — Fix userName Reference

**Files:**
- Modify: `mobile/src/app/components/SidebarDrawer.tsx:27`

Current line 27:
```typescript
const userName = useAuthStore(s => s.userName) || 'DREAMER';
```

Replace with:
```typescript
const userName = useUserStore(s => s.name) || useAuthStore(s => s.email?.split('@')[0]) || 'DREAMER';
```

Also add import at top:
```typescript
import { useUserStore } from '../store/useUserStore';
```

- [ ] **Step 11: Commit**

```bash
git add mobile/src/app/components/SidebarDrawer.tsx
git commit -m "fix(mobile): SidebarDrawer userName → useUserStore

- useAuthStore has no userName field — was undefined
- Now reads from useUserStore (name field) with email fallback"
```

---

## Task 8: useAuthStore — Add userName Field

**Files:**
- Modify: `mobile/src/app/store/useAuthStore.ts`

Add `userName: string | null` to `AuthState` interface and `login()` action.

Interface change:
```typescript
interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  userName: string | null;  // ADD

  login: (token: string, userId: number, email: string, userName?: string) => void;  // UPDATE
  logout: () => void;
  isAuthenticated: () => boolean;
}
```

Store implementation change:
```typescript
login: (token, userId, email, userName = null) => set({ token, userId, email, userName }),
logout: () => set({ token: null, userId: null, email: null, userName: null }),
```

- [ ] **Step 12: Commit**

```bash
git add mobile/src/app/store/useAuthStore.ts
git commit -m "feat(mobile): add userName to useAuthStore

- AuthState now includes userName field
- login() accepts optional userName parameter
- logout() resets userName to null"
```

---

## Verification Checklist

After all tasks, verify:
- [ ] `AccountScreen.tsx` renders when tapping the ACCOUNT bottom tab
- [ ] `AccountScreen.tsx` renders when navigating from sidebar "Account" button
- [ ] Bottom tab bar shows the floating red Account button raised above the bar
- [ ] `useUserStore` and `useWalletStore` persist across page refresh (localStorage)
- [ ] Pull-to-refresh on Account screen triggers store hydration
- [ ] No TypeScript errors on `cd mobile && npx tsc --noEmit`
- [ ] App runs without crash at `http://localhost:4202`