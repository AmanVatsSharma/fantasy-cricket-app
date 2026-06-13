# My Teams Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new MyTeamsScreen with 5-tab navigation, team cards, and sub-tabs matching the clone image exactly.

**Architecture:** Component-based screen with internal sub-components, mock data separation, and updated Dream11TabBar. Each sub-component is pure render (no internal state) for easy testing and maintenance.

**Tech Stack:** React Navigation, React Native, TypeScript, React Native SVG, StyleSheet

---

### File Structure Overview

**New Files:**
- `mobile/src/app/data/mockTeams.ts` — strongly typed mock data for teams and stats
- `mobile/src/app/screens/MyTeamsScreen.tsx` — main screen with all sub-components

**Modified Files:**
- `mobile/src/app/components/Dream11TabBar.tsx` — update from 4→5 tabs, remove floating button, add new icons, redGlow math
- `mobile/src/app/App.tsx` — register `MyTeamsScreen` in stack and tabs

---

## Task 1: Create `mockTeams.ts` Data Module

**Files:**
- Create: `mobile/src/app/data/mockTeams.ts`

- [ ] **Step 1: Create the file with type definitions and mock data**

See the full type definitions and 5 mock teams in the spec at `docs/superpowers/specs/2026-06-13-myteams-screen-design.md` section 3. The file exports:
- `ContestType` union type
- `Player` type
- `FantasyTeam` type
- `MOCK_TEAMS` array of 5 teams
- `MOCK_STATS` object
- `MOCK_MATCH` object

- [ ] **Step 2: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/data/mockTeams.ts
git commit -m "feat: add mockTeams.ts data module for MyTeamsScreen"
```

---

## Task 2: Create `MyTeamsScreen` skeleton

**Files:**
- Create: `mobile/src/app/screens/MyTeamsScreen.tsx`

- [ ] **Step 1: Create the file with imports and ModernHeader**

Write the file with:
- React/useState imports
- View/Text/TouchableOpacity/StyleSheet/FlatList/Animated from react-native
- Svg/Path/Circle/Rect from react-native-svg
- `MOCK_STATS, MOCK_MATCH` imports from `../data/mockTeams`
- `MyTeamsScreen` function exporting the component
- Inline `ModernHeader` sub-component (re-instantiated, not imported from App.tsx)
- Inline `SubTabBar` sub-component

- [ ] **Step 2: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/screens/MyTeamsScreen.tsx
git commit -m "feat: add MyTeamsScreen skeleton with header and sub-tabs"
```

---

## Task 3: Add StatsBar and MatchInfoCard components

**Files:**
- Modify: `mobile/src/app/screens/MyTeamsScreen.tsx`

- [ ] **Step 1: Add StatsBar component**

Add `StatsBar({ stats })` component rendering 4 columns (5 TEAMS / ₹152 TOTAL WINNING / 12 CONTESTS JOINED / 4 WINNING TEAMS). Style with `sb` StyleSheet object.

- [ ] **Step 2: Add MatchInfoCard component with countdown**

Add `MatchInfoCard({ match })` component:
- Left: team1 short name
- Center: VS badge with two dots
- Right: team2 short name
- Far right: countdown timer (h/m/s)

Use `useEffect` + `setInterval` to tick the countdown every second.

- [ ] **Step 3: Wire StatsBar and MatchInfoCard into render**

Update the component return to render `<StatsBar stats={MOCK_STATS} />` and `<MatchInfoCard match={MOCK_MATCH} />` after the SubTabBar.

- [ ] **Step 4: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/screens/MyTeamsScreen.tsx
git commit -m "feat: add StatsBar and MatchInfoCard to MyTeamsScreen"
```

---

## Task 4: Add TeamCard component and list

**Files:**
- Modify: `mobile/src/app/screens/MyTeamsScreen.tsx`

- [ ] **Step 1: Add TeamCard component**

Add `TeamCard({ team })` component with:
- Top row: contest type pill (color-coded by contest type) + edit/more action buttons
- Name row: team name + rank
- Avatars row: 6 player avatar circles + "+5" overflow chip + points/winning
- CTA row: "🏆 View Contest" button

Add `tc` StyleSheet object with all styles.

- [ ] **Step 2: Add FlatList rendering TeamCards**

Add `<FlatList data={mockTeams} renderItem={({item}) => <TeamCard team={item} />} />` to the component return.

- [ ] **Step 3: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add mobile/src/app/screens/MyTeamsScreen.tsx
git commit -m "feat: add TeamCard component and FlatList to MyTeamsScreen"
```

---

## Task 5: Add sub-tab content and ReferralBanner

**Files:**
- Modify: `mobile/src/app/screens/MyTeamsScreen.tsx`

- [ ] **Step 1: Add sub-tab content rendering**

Add `renderSubTabContent()` function that returns:
- For 'myTeams': FlatList of TeamCards
- For 'joinedContests': empty state with "Browse Contests" button
- For 'savedTeams': empty state with "Create Team" button

- [ ] **Step 2: Add ReferralBanner component**

Add `ReferralBanner()` component with:
- Gold-bordered card
- 📋 icon + "Refer & Earn" + "Invite friends and earn ₹100"
- Decorative 🎁 icon in bottom-right corner
- Position absolute decoration with opacity 0.2 gold circle

- [ ] **Step 3: Wire sub-tab and ReferralBanner into render**

Update component return:
- If activeSubTab === 'myTeams': show StatsBar + MatchInfoCard + FlatList + ReferralBanner
- Else: show renderSubTabContent()

- [ ] **Step 4: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/screens/MyTeamsScreen.tsx
git commit -m "feat: add sub-tab content and ReferralBanner to MyTeamsScreen"
```

---

## Task 6: Add useToast and action handlers

**Files:**
- Modify: `mobile/src/app/screens/MyTeamsScreen.tsx`

- [ ] **Step 1: Add useToast import and hook usage**

Add `import { useToast } from '../components/Toast';` and call `const { show } = useToast();` in `MyTeamsScreen`.

- [ ] **Step 2: Add onPress handlers to TeamCard actions**

In `TeamCard`:
- Edit button: `onPress={() => show('Edit team: ' + team.name)}`
- More button: `onPress={() => show('Menu: Edit / Copy / Share')}`

- [ ] **Step 3: Add navigation to View Contest button**

Add `useNavigation` import and `const nav = useNavigation();` in `MyTeamsScreen`. In TeamCard's View Contest button:
```tsx
onPress={() => nav.navigate('ContestLobby', { 
  matchId: 'm1', 
  matchName: 'CHE vs KOL', 
  team1: 'CHE', 
  team2: 'KOL', 
  team1Color: '#F7C42E', 
  team2Color: '#3F2E84' 
})}
```

- [ ] **Step 4: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/screens/MyTeamsScreen.tsx
git commit -m "feat: add useToast and navigation handlers to MyTeamsScreen"
```

---

## Task 7: Update Dream11TabBar to 5 tabs

**Files:**
- Modify: `mobile/src/app/components/Dream11TabBar.tsx`

- [ ] **Step 1: Replace TAB_ICONS with 5 entries**

Update `TAB_ICONS`:
```ts
[
  { name: 'HOME',       label: 'Home' },
  { name: 'MYCONTESTS', label: 'My Contests' },
  { name: 'MYTEAMS',    label: 'My Teams' },
  { name: 'WALLET',     label: 'Wallet' },
  { name: 'MORE',       label: 'More' },
]
```

- [ ] **Step 2: Update TabIcon to render new icons**

Add SVG renderers for:
- HOME: house icon (existing)
- MYCONTESTS: trophy icon
- MYTEAMS: shield/team icon
- WALLET: wallet icon
- MORE: 3 dots icon

- [ ] **Step 3: Update redGlow math from 25% to 20%**

Change: `{ left: `${(focusedIndex + 0.5) * 25}%` }` → `{ left: `${(focusedIndex + 0.5) * 20}%` }`

- [ ] **Step 4: Remove FloatingAccountButton and nav arrows**

Delete the entire `FloatingAccountButton` component and the `<View style={t.navArrows}>...</View>` block from the main `Dream11TabBar` render.

- [ ] **Step 5: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add mobile/src/app/components/Dream11TabBar.tsx
git commit -m "feat: update Dream11TabBar to 5 tabs, remove floating button and arrows"
```

---

## Task 8: Register MyTeamsScreen in App.tsx

**Files:**
- Modify: `mobile/src/app/App.tsx`

- [ ] **Step 1: Add MyTeamsScreen import**

Add `import { MyTeamsScreen } from './screens/MyTeamsScreen';`

- [ ] **Step 2: Add MyTeamsScreen to Stack.Navigator**

Add `<Stack.Screen name="MyTeams" component={MyTeamsScreen} />` to the stack.

- [ ] **Step 3: Update MainTabs to 5 tabs**

Update `MainTabs`:
```tsx
<Tab.Navigator tabBar={Dream11TabBar} screenOptions={{ headerShown: false }}>
  <Tab.Screen name="HOME" component={HomeContent} />
  <Tab.Screen name="MYCONTESTS" component={MyContestsScreen} />
  <Tab.Screen name="MYTEAMS" component={MyTeamsScreen} />
  <Tab.Screen name="WALLET" component={AccountScreen} />
  <Tab.Screen name="MORE" component={() => <View style={{flex:1,backgroundColor:'#080810'}}><Text style={{color:'#fff',textAlign:'center',marginTop:40}}>More coming soon</Text></View>} />
</Tab.Navigator>
```

- [ ] **Step 4: Run TypeScript to verify it passes**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/App.tsx
git commit -m "feat: register MyTeamsScreen in App navigation stack and tabs"
```

---

## Task 9: Final smoke test and verification

**Files:**
- All created/modified files

- [ ] **Step 1: Verify TypeScript compilation**

Run: `npx tsc --noEmit --project tsconfig.base.json`
Expected: PASS

- [ ] **Step 2: Start Metro bundler**

Run: `cd mobile && npx expo start --clear`
Expected: Metro bundler starts without errors

- [ ] **Step 3: Manual smoke test checklist**

- [ ] Tab bar shows 5 tabs (Home / My Contests / My Teams / Wallet / More)
- [ ] "My Teams" tab shows the new screen
- [ ] Sub-tab bar shows 3 tabs with active state
- [ ] Stats bar shows 4 values correctly
- [ ] Match info shows CHE vs KOL with live countdown
- [ ] 5 TeamCards render with correct stats
- [ ] Player avatars show initials and colored backgrounds
- [ ] Sub-tab "Joined Contests" shows empty state
- [ ] Sub-tab "Saved Teams" shows empty state
- [ ] Edit/more icons show toasts
- [ ] View Contest navigates to ContestLobby
- [ ] "Wallet" tab opens AccountScreen
- [ ] "More" tab shows placeholder
- [ ] ReferralBanner appears at bottom

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete MyTeamsScreen with all components and navigation"
```

---

### Implementation Notes

1. **No new dependencies** — all use existing React Native libraries and patterns
2. **Mock data first** — screen renders without API calls
3. **Pure component state** — only useState and useEffect (no Redux/Zustand needed for this screen)
4. **Reused existing colors** — from theme/colors.ts (#080810, #CE404D, #ECBD15)
5. **Optimized tab bar** — Dream11TabBar simplified to match image design pattern (HomeTabBar style)
