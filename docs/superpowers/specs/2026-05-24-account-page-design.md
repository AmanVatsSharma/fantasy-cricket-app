# Account Screen — Design Spec

**Date:** 2026-05-24
**Source:** Figma Make file (`orHbonWsY32LV85S91ydwe`) → `AccountPage.tsx`
**Target:** `mobile/src/app/screens/AccountScreen.tsx`

---

## 1. Overview

Replace the existing `ProfileScreen` with a premium Account Page that reads from three Zustand stores (auth, user, wallet). The screen is accessible via:
- Bottom tab bar `ACCOUNT` tab
- Sidebar drawer "Account" button

---

## 2. Data Architecture

### Existing Stores

| Store | Fields | Purpose |
|---|---|---|
| `useAuthStore` | `token`, `userId`, `email` | Auth (already exists) |

### New Stores

| Store | Fields | Persisted | Source API |
|---|---|---|---|
| `useUserStore` | `name`, `location`, `joinDate`, `totalMatches`, `contestsWon`, `verified`, `kycStatus` | Yes | `GET /api/users/:userId/profile` |
| `useWalletStore` | `balance`, `cashback`, `winnings` | Yes | `GET /api/wallet/:userId/balance` |

### Hydration Pattern

On app start (after login) → `hydrateStores(userId)` fetches both user + wallet in parallel and populates stores. `AccountScreen` reads from stores; never fetches inline. Pull-to-refresh triggers re-fetch.

### Mock Fallback (dev)

If API fails, stores keep their last known value (or empty defaults). No crash — graceful degradation.

---

## 3. Screen Sections

### 3.1 Top Navigation Bar
- **Left:** Hamburger menu → opens sidebar drawer
- **Center:** `11DREAMER` logo (existing pattern from `ModernHeader`)
- **Right:** Wallet pill (`💰 ₹2,500`) + notification bell with green dot
- Border-bottom `rgba(255,255,255,0.05)`, dark bg `#0d0d1a`

### 3.2 Profile Header
- **Red gradient background** — `bg-gradient-to-b from-red-900/30 to-transparent`
- **Avatar:** 80×80 circle, `bg-gradient-to-br from-red-600 to-red-800`, text "11", `border-4 border-red-500`
- **Name row:** Name + blue verified shield badge (inline SVG)
- **Subtitle:** Location + join month
- **Right badge:** "Total Matches" pill with large count (`bg-red-600`)
- Layout: flex row, avatar left, info center, badge right

### 3.3 Stats Row (3 cards)
- **Total Wallet:** `💰 ₹balance` → yellow `#ECBD15`
- **Contests Won:** `🏆 count` → white
- **Total Winnings:** `🎯 ₹winnings` → green `#22C55E`
- Style: `bg-gray-900/80 backdrop-blur`, `border border-gray-800`, `borderRadius 12`

### 3.4 Cashback Card
- "Unutilised Cashback" label → green `#22C55E` large value
- Two buttons side by side: "ADD CASH" (`bg-red-600`) + "WITHDRAW" (transparent, `border-2 border-gray-600`)
- Gradient bg `gray-900 to gray-800`, `borderRadius 16`

### 3.5 Quick Actions (5-tap grid)
Items: Invite & Earn, My Activity, My Teams, Join Private Contest, Help & Support
- Each: icon circle (`bg-red-600/20`, `borderRadius 12`) + label below
- Row layout: `flex-direction: row`, `justifyContent: space-between`
- Icons: SVG inline — Gift, Activity, Users, Lock, HelpCircle

### 3.6 Menu List (6 items)
- KYC Verification (with "Verified" green badge if `kycStatus === 'verified'`)
- Personal Information
- Transaction History
- My Performance
- Settings
- Privacy & Security

Each row: icon box + text (title + subtitle) left, badge/chevron right.
- `bg-gray-900/50`, `borderRadius 12`, hover state `bg-gray-900`

### 3.7 Bottom Tab Bar (Dream11TabBar)
- Update `Dream11TabBar` to render floating raised "Account" center button
- On `ACCOUNT` tab: center button renders as 48px red circle with white User icon, raised `marginTop: -24`
- Other tabs: normal flat label
- All 4 tabs remain navigable

---

## 4. Navigation & Routing

| Entry point | Target | Behavior |
|---|---|---|
| Bottom tab bar ACCOUNT | `AccountScreen` | Full screen |
| Sidebar "Account" button | `AccountScreen` | Opens via `navigation.navigate('Account')` |
| Stack | `AccountScreen` | `Stack.Screen name="Account"` added |

Existing `ProfileScreen` kept as thin shell (`AccountScreen` redirect) for backward compat.

---

## 5. Component Inventory

| Component | Location | Notes |
|---|---|---|
| `AccountScreen` | `screens/AccountScreen.tsx` | Main screen, reads from 3 stores |
| `useUserStore` | `store/useUserStore.ts` | New — user profile state |
| `useWalletStore` | `store/useWalletStore.ts` | New — wallet state |
| `Dream11TabBar` | `components/Dream11TabBar.tsx` | Moved from App.tsx, floating button logic |
| `AccountNavBar` | inline in `AccountScreen` | Top nav bar specific to account |
| `ProfileHeader` | inline in `AccountScreen` | Avatar + name + badge section |
| `StatsGrid` | inline in `AccountScreen` | 3-card stats row |
| `CashbackCard` | inline | Cashback + action buttons |
| `QuickActions` | inline | 5-tap grid |
| `MenuList` | inline | 6-row menu |

All inline components use `StyleSheet.create()` — existing React Native Web pattern.

---

## 6. Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary red | `#CE404D` | CTAs, highlights, floating button |
| Accent gold | `#ECBD15` | Wallet amounts, prize values |
| Success green | `#22C55E` | Positive stats, verified badges, cashback |
| Surface dark | `#0d0d1a` | Background |
| Card bg | `rgba(255,255,255,0.05)` | Cards, list items |
| Border | `rgba(255,255,255,0.08)` | Card borders |
| Muted text | `rgba(255,255,255,0.5)` | Secondary labels |
| Verified badge | `#3B82F6` | Shield icon background |

---

## 7. Error & Loading States

- **Loading:** Full-screen skeleton or spinner while stores hydrate
- **Error (API fail):** Show empty/default values — no crash, no toast
- **Pull-to-refresh:** Triggers `hydrateStores` → re-fetches user + wallet

---

## 8. Scope for Implementation

### Files to create:
1. `mobile/src/app/store/useUserStore.ts`
2. `mobile/src/app/store/useWalletStore.ts`
3. `mobile/src/app/screens/AccountScreen.tsx`
4. `mobile/src/app/components/Dream11TabBar.tsx`

### Files to modify:
1. `mobile/src/app/App.tsx` — import `Dream11TabBar`, add `AccountScreen` route, update `ACCOUNT` tab component
2. `mobile/src/app/screens/ProfileScreen.tsx` — thin redirect shell
3. `mobile/src/app/components/SidebarDrawer.tsx` — ensure "Account" button navigates to `Account` screen