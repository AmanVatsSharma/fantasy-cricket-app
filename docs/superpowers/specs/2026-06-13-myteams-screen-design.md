# My Teams Screen — Design Spec

**Date:** 2026-06-13
**Source:** Clone image (5-tab My Teams dashboard)
**Target:** `mobile/src/app/screens/MyTeamsScreen.tsx` + tab bar + data file

---

## 1. Overview

Add a new `MyTeamsScreen` that lists the user's fantasy teams for a selected match, with a 4-stat summary, a match info strip, sub-tab navigation (My Teams / Joined Contests / Saved Teams), and per-team cards. Update the bottom tab bar from 4 tabs to 5 tabs to match the image. All data is hardcoded mock data in a separate typed module; no new stores, no API calls.

The screen is reached via:
- New `My Teams` tab in the bottom tab bar (default)
- Future: deep link or drawer entry (not in this scope)

---

## 2. Goals & Non-Goals

### Goals
- Pixel-level match of the clone image (stats, match strip, team cards, referral banner, 5-tab bar)
- Reuse existing tokens (`#080810`, `#CE404D`, `#ECBD15`) and existing `ModernHeader`
- New mock data file keeps the screen lean and makes future API integration mechanical
- 5-tab bottom navigation: Home / My Contests / My Teams / Wallet / More

### Non-Goals
- No real API integration (mock data only)
- No new Zustand stores
- No "Create Team" screen (toast placeholder only)
- No unit tests (matches existing screen conventions)
- No analytics, no share extension, no deep links

---

## 3. Data Architecture

### New File: `mobile/src/app/data/mockTeams.ts`

Strongly typed, no runtime cost, swappable for a real fetch later.

```ts
export type ContestType =
  | 'Mega Contest'
  | 'Head to Head'
  | 'Mini Grand'
  | 'Hot Contest'
  | 'Beginner Contest';

export type Player = {
  id: string;
  name: string;       // full name (used for accessibility, not rendered)
  initials: string;   // 1-2 chars, rendered inside circle avatar
  color: string;      // background color of avatar circle
};

export type FantasyTeam = {
  id: string;
  name: string;       // "Team 1" .. "Team 5"
  contestType: ContestType;
  points: number;     // e.g. 624.5
  rank: string;       // "#1,245" or "#-" when unranked
  winning: number;    // INR amount, 0 when no win
  players: Player[];  // 11 entries; UI renders first 6 + "+5" overflow chip
};

export const MOCK_TEAMS: FantasyTeam[] = [
  // 5 entries matching the screenshot
  {
    id: 't1',
    name: 'Team 1',
    contestType: 'Mega Contest',
    points: 624.5,
    rank: '#1,245',
    winning: 75,
    players: [/* 11 entries with diverse initials + colors */],
  },
  // ...Team 2..5 with Head to Head, Mini Grand, Hot Contest, Beginner Contest
];

export const MOCK_STATS = {
  teams: 5,
  totalWinning: 152,        // INR
  contestsJoined: 12,
  winningTeams: 4,
};

export const MOCK_MATCH = {
  team1Short: 'CHE',
  team2Short: 'KOL',
  team1Name: 'Chennai Super Kings',
  team2Name: 'Kolkata Knight Riders',
  matchDateTime: '2026-06-13T19:30:00+05:30',  // future date so countdown is positive
  format: 'T20',
};
```

The 11 player objects per team use realistic IPL-style initials (e.g. "MSD", "VK", "RP", "JJ", "SKY", "AR") with 6 distinct background colors cycled.

---

## 4. Component Architecture

`MyTeamsScreen.tsx` exports a default component. It composes internal sub-components (kept inside the file, like `MyContestsScreen` does, to avoid premature splitting):

```
MyTeamsScreen (default export)
├── ModernHeader          // imported from App.tsx? No — re-instantiated locally
│                          // to keep screens self-contained (matches HomeScreen pattern)
├── SubTabBar             // 3 segments: My Teams / Joined Contests / Saved Teams
├── StatsBar              // 4 metrics in a row
├── MatchInfoCard         // CHE vs KOL with live countdown
├── FlatList of TeamCard  // 5 cards (vertical)
│     └── TeamCard        // contest pill, team name, player avatars, points/rank/winning, actions
├── ReferralBanner        // invite & earn card
└── Dream11TabBar         // bottom nav, 5 tabs (updated)
```

### 4.1 Why a local ModernHeader, not imported?
`ModernHeader` in `App.tsx` is a non-exported const. Importing it across screens would require exporting it from `App.tsx` and creating a circular-ish dependency. Local re-instantiation is the path of least resistance and matches `HomeScreen`/`MyContestsScreen` patterns where each screen owns its header.

### 4.2 Sub-components — all internal
- `SubTabBar({ active, onChange })`
- `StatsBar({ stats })`
- `MatchInfoCard({ match })` — uses `useEffect` + `setInterval` for 1s countdown
- `TeamCard({ team })` — pure render, no internal state
- `ReferralBanner()`

All internal sub-components are small (< 100 lines each) and read from props, making the screen easy to reason about and re-style.

---

## 5. Visual Design

### 5.1 Color Tokens (reuse existing + 2 new)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#080810` | screen background |
| `card` | `#14141f` | card surfaces |
| `border` | `rgba(255,255,255,0.08)` | card border |
| `accent` | `#CE404D` | active tab, primary CTA, brand |
| `gold` | `#ECBD15` | currency, "Create Team" pill |
| `text` | `#FFFFFF` | primary text |
| `textDim` | `rgba(255,255,255,0.4)` | secondary text |
| `green` | `#0FCC74` | "winning" amounts |
| `greenPill` | `#10B981` | Mega Contest badge bg |

### 5.2 Contest Type Color Map

| Contest Type | Pill BG | Pill Text |
|---|---|---|
| Mega Contest | `#10B981` | `#FFFFFF` |
| Head to Head | `#9333EA` | `#FFFFFF` |
| Mini Grand | `#3B82F6` | `#FFFFFF` |
| Hot Contest | `#F97316` | `#FFFFFF` |
| Beginner Contest | `#D946EF` | `#FFFFFF` |

### 5.3 Layout per section (top → bottom)

1. **Header** — `ModernHeader` pattern: ☰ / logo + "11DREAMER" / 💰 wallet pill / 🔔
2. **SubTabBar** — 3 segments, full-width, pill-shaped, accent on active
3. **StatsBar** — 4 columns separated by thin dividers; label on top, value below; winning total in green
4. **MatchInfoCard** — horizontal strip: team1 flag/abbr | VS badge | team2 flag/abbr | countdown right-aligned
5. **FlatList** — vertical, 5 TeamCards, each ~180px tall
6. **ReferralBanner** — gold-bordered card with copy icon and "Refer & Earn ₹100"
7. **Dream11TabBar** — fixed bottom, 5 tabs

### 5.4 TeamCard anatomy

```
┌────────────────────────────────────────────┐
│ [Mega Contest pill]      [✏️] [⋮]          │  ← row 1: contest + actions
│ Team 1                          #1,245      │  ← row 2: name + rank
│ ┌──┬──┬──┬──┬──┬──┬──┐                     │
│ │MS│VK│RP│JJ│SK│AR│+5│  624.5  ₹75        │  ← row 3: avatars + points + winning
│ └──┴──┴──┴──┴──┴──┴──┘  pts    won        │
│                                            │
│ 🏆 View Contest                  →          │  ← row 4: contest action
└────────────────────────────────────────────┘
```

Card height: ~140px. Player avatar circle: 32x32. "+5" overflow chip: same size, dimmer.

---

## 6. Navigation Wiring

### 6.1 New `MyTeamsScreen` registration in `App.tsx`

Add to `Stack.Navigator` (line ~660) as a stack screen:
```tsx
<Stack.Screen name="MyTeams" component={MyTeamsScreen} />
```

Add to `MainTabs` Tab.Navigator:
```tsx
<Tab.Screen name="MYTEAMS" component={MyTeamsScreen} />
```

### 6.2 Tab bar changes (`Dream11TabBar.tsx`)

- Update `TAB_ICONS` from 4 entries to 5:
  ```ts
  [
    { name: 'HOME',       label: 'Home',       icon: 'home' },
    { name: 'MYCONTESTS', label: 'My Contests', icon: 'trophy' },
    { name: 'MYTEAMS',    label: 'My Teams',   icon: 'shield' },
    { name: 'WALLET',     label: 'Wallet',     icon: 'wallet' },
    { name: 'MORE',       label: 'More',       icon: 'dots' },
  ];
  ```
- Update `redGlow` math: `(focusedIndex + 0.5) * 20` (was `25` for 4 tabs)
- Add 5 new SVG icon renderers in `TabIcon` (or import from a shared icon set)
- Remove the `FloatingAccountButton` (replaced by tab-based Wallet)
- Remove the `< >` nav arrows (match image: no arrows visible)

### 6.3 Action wiring (from inside MyTeamsScreen)

| Action | Behavior |
|---|---|
| Sub-tab "My Contests" | Switches internal state, renders empty state |
| Sub-tab "Saved Teams" | Switches internal state, renders empty state |
| `+ Create Team` pill | `useToast().show('Team creation coming soon')` |
| `✏️` edit per team | `useToast().show('Edit team: <name>')` |
| `⋮` more per team | `useToast().show('Menu: Edit / Copy / Share')` |
| `🏆 View Contest` per team | `nav.navigate('ContestLobby', { matchId: 'm1', matchName: 'CHE vs KOL', team1: 'CHE', team2: 'KOL', team1Color: '#F7C42E', team2Color: '#3F2E84' })` (matches existing `ContestLobby` param shape per [ContestLobbyScreen.tsx:12](mobile/src/app/screens/ContestLobbyScreen.tsx#L12); mock values are hardcoded since the screen is reached from a static card) |
| Tab `MYCONTESTS` | renders `MyContestsScreen` (extracted from current HomeScreen flow — but since it already exists as a stack screen, we can wrap it) |
| Tab `WALLET` | renders `AccountScreen` (existing) |
| Tab `MORE` | toast "More options coming soon" |
| Tab `HOME` | renders existing `HomeContent` |

---

## 7. Sub-Tab State Behavior

| Active sub-tab | Content |
|---|---|
| My Teams (default) | Full FlatList of 5 TeamCards |
| Joined Contests | Inline empty state: "You haven't joined any contests from this match" + "Browse Contests" button (toast) |
| Saved Teams | Inline empty state: "No saved teams yet" + "Create Team" button (toast) |

Switching tabs is pure local state (`useState<string>('myTeams')`); no data refetch.

---

## 8. Error / Empty / Loading States

### 8.1 Loading (initial 1.5s)
5 shimmer-skeleton cards matching `TeamCard` dimensions. Uses `Animated` opacity loop (0.3 → 0.6 → 0.3, 1s cycle). No external lib.

### 8.2 Empty (no teams — theoretical)
"Icon + You haven't created any teams yet" + big gold "Create Team" button (toast). Mock data is non-empty in this spec, but the empty state is wired for future API integration.

### 8.3 Error
Toast: "Failed to load teams. Pull to refresh." (mock data never errors, but the hook is there.)

---

## 9. File-by-File Change List

| File | Action | Reason |
|---|---|---|
| `mobile/src/app/screens/MyTeamsScreen.tsx` | **CREATE** | New screen (~600 lines) |
| `mobile/src/app/data/mockTeams.ts` | **CREATE** | Typed mock data (~150 lines) |
| `mobile/src/app/components/Dream11TabBar.tsx` | **MODIFY** | 4→5 tabs, new icons, no floating button, no arrows (~100 lines added) |
| `mobile/src/app/App.tsx` | **MODIFY** | Register `MyTeamsScreen` in Stack, add `MYTEAMS` Tab (~5 lines added) |

No store changes, no new dependencies, no package.json changes.

---

## 10. Implementation Order

1. Create `mockTeams.ts` (data first, no UI dependencies)
2. Create `MyTeamsScreen.tsx` skeleton (header + sub-tab bar only, blank body)
3. Add `StatsBar`, `MatchInfoCard`, `TeamCard`, `ReferralBanner` sub-components
4. Wire empty states for "Joined Contests" and "Saved Teams" sub-tabs
5. Update `Dream11TabBar.tsx` (5 tabs, new icons, redGlow math)
6. Update `App.tsx` (register screens)
7. Manual smoke test: tab bar, sub-tabs, scroll, taps, toasts

---

## 11. Testing Strategy

- **TypeScript:** `npx tsc --noEmit` (zero errors)
- **Bundle:** `npx expo export --platform web` (or Metro `--reset-cache`) compiles cleanly
- **Manual smoke (Android emulator or web):**
  - Tab bar shows 5 tabs; redGlow is centered on the active one
  - Sub-tab bar switches content
  - All 5 team cards render with correct stats
  - Player avatars show initials and colored backgrounds
  - Countdown ticks every second
  - "View Contest" navigates to ContestLobby
  - Toasts appear for placeholder actions
  - "Wallet" tab opens AccountScreen
  - "My Contests" tab opens existing MyContestsScreen
  - "More" tab toasts
- **Visual regression:** compare side-by-side to the clone image
- **No unit tests** (matches existing screens; YAGNI)

---

## 12. Open Questions

None — all clarifying questions resolved during brainstorming. Two risks to flag:
1. **My Contests tab** — the existing screen is reached via a stack route, not as a tab. Solution: mount `MyContestsScreen` directly inside the `MYCONTESTS` `Tab.Screen`. React Navigation allows the same component to be a tab and a stack target.
2. **Hardcoded navigation params for View Contest** — when the user is on the team card, we don't have the live `ContestLobby` params for *that* team, so we hardcode the mock match params. A future iteration could enrich `FantasyTeam` with `contestId` and look up the params, but that's out of scope.
