/**
 * File:        mobile/src/app/screens/MyTeamsScreen.tsx
 * Module:      Mobile · My Teams Screen
 * Purpose:     Skeleton for the "My Teams" page. Renders the global
 *              ModernHeader (menu / logo / wallet / bell) and a 3-tab
 *              sub-nav (My Teams / Joined Contests / Saved Teams).
 *              StatsBar, MatchInfoCard, TeamCard list, ReferralBanner,
 *              and toast wiring are added in Tasks 3-6.
 *
 * Exports:
 *   - MyTeamsScreen — primary screen
 *
 * Depends on:
 *   - react-native, react-native-svg
 *   - ../data/mockTeams (MOCK_TEAMS, MOCK_STATS, MOCK_MATCH)
 *   - ../../../index (useDrawer) — same pattern as App.tsx
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-13
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import { MOCK_TEAMS, MOCK_STATS, MOCK_MATCH } from '../data/mockTeams';
import { useDrawer } from '../../..';

/* ------------------------------------------------------------------ *
 *  Sub-components
 * ------------------------------------------------------------------ */

// Modern compact header above tab bar — mirrors App.tsx so the page
// reads as part of the same app shell. Kept local on purpose: the
// "My Teams" screen needs the same chrome but is invoked outside the
// tab navigator in some flows, and HomeScreen uses the same pattern
// of an inline header.
const ModernHeader: React.FC = () => {
  const { openDrawer } = useDrawer();

  return (
    <View style={h.root}>
      <TouchableOpacity style={h.menuBtn} onPress={openDrawer} activeOpacity={0.7}>
        <Text style={h.menuTxt}>☰</Text>
      </TouchableOpacity>

      <View style={h.center}>
        <View style={h.logoWrap}>
          <Text style={h.logoMain}>
            11<Text style={h.logoGold}>DREAMER</Text>
          </Text>
          <Text style={h.logoSub}>FANTASY CRICKET</Text>
        </View>
      </View>

      <View style={h.right}>
        <TouchableOpacity style={h.walletPill} activeOpacity={0.7}>
          <Text style={h.walletIcon}>💰</Text>
          <Text style={h.walletAmt}>₹2,500</Text>
        </TouchableOpacity>
        <TouchableOpacity style={h.bellBtn} activeOpacity={0.7}>
          <Text style={h.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 3-tab sub-nav. Active tab gets the brand-red pill; inactive tabs
// are just dimmed text labels. Children are rendered as a row that
// grows with the container so the three labels share equal width.
type SubTab = 'myTeams' | 'joinedContests' | 'savedTeams';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'myTeams', label: 'My Teams' },
  { key: 'joinedContests', label: 'Joined Contests' },
  { key: 'savedTeams', label: 'Saved Teams' },
];

const SubTabBar: React.FC<{
  active: SubTab;
  onChange: (tab: SubTab) => void;
}> = ({ active, onChange }) => (
  <View style={st.row}>
    {SUB_TABS.map((t) => {
      const isActive = active === t.key;
      return (
        <TouchableOpacity
          key={t.key}
          style={[st.tab, isActive && st.tabActive]}
          onPress={() => onChange(t.key)}
          activeOpacity={0.7}
        >
          <Text style={[st.tabTxt, isActive && st.tabTxtActive]}>{t.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// Summary metrics row sitting just under the sub-tab bar. Gold values
// draw the eye; uppercase dim labels keep the bar readable without
// competing with the countdowns further down.
const StatsBar: React.FC<{ stats: typeof MOCK_STATS }> = ({ stats }) => (
  <View style={sb.root}>
    <View style={sb.item}>
      <Text style={sb.value}>{stats.teams}</Text>
      <Text style={sb.label}>TEAMS</Text>
    </View>
    <View style={sb.divider} />
    <View style={sb.item}>
      <Text style={sb.value}>₹{stats.totalWinning}</Text>
      <Text style={sb.label}>TOTAL WINNING</Text>
    </View>
    <View style={sb.divider} />
    <View style={sb.item}>
      <Text style={sb.value}>{stats.contestsJoined}</Text>
      <Text style={sb.label}>CONTESTS JOINED</Text>
    </View>
    <View style={sb.divider} />
    <View style={sb.item}>
      <Text style={sb.value}>{stats.winningTeams}</Text>
      <Text style={sb.label}>WINNING TEAMS</Text>
    </View>
  </View>
);

// Compact match info card with a live ticking countdown. The card
// spans the row with team1 / VS / team2 and the time-left line below
// in the brand gold. Timer self-cleans on unmount.
const MatchInfoCard: React.FC<{ match: typeof MOCK_MATCH }> = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(match.matchDateTime).getTime() - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft({ h, m, s });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [match.matchDateTime]);

  return (
    <View style={mic.root}>
      <Text style={mic.team}>{match.team1Short}</Text>
      <View style={mic.vsWrap}>
        <Text style={mic.vs}>VS</Text>
      </View>
      <Text style={mic.team}>{match.team2Short}</Text>
      <Text style={mic.countdown}>{timeLeft.h}h {timeLeft.m}m {timeLeft.s}s</Text>
    </View>
  );
};

/* ------------------------------------------------------------------ *
 *  Main screen
 * ------------------------------------------------------------------ */

export const MyTeamsScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('myTeams');

  return (
    <View style={{ flex: 1, backgroundColor: '#080810' }}>
      <ModernHeader />
      <SubTabBar active={activeSubTab} onChange={setActiveSubTab} />
      <StatsBar stats={MOCK_STATS} />
      <MatchInfoCard match={MOCK_MATCH} />
    </View>
  );
};

/* ------------------------------------------------------------------ *
 *  Styles
 * ------------------------------------------------------------------ */

const h = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1117',
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  logoWrap: { gap: 0 },
  logoMain: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  logoGold: { color: '#ECBD15' },
  logoSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginTop: 1,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  walletIcon: { fontSize: 13 },
  walletAmt: { color: '#ECBD15', fontSize: 12, fontWeight: '800' },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bellIcon: { fontSize: 15 },
});

const st = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#CE404D',
  },
  tabTxt: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTxtActive: {
    color: '#fff',
  },
});

const sb = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: '#14141f',
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    color: '#ECBD15',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  label: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

const mic = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#14141f',
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  team: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  vsWrap: {
    alignItems: 'center',
    gap: 4,
  },
  vs: {
    color: '#CE404D',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  countdown: {
    color: '#ECBD15',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default MyTeamsScreen;
