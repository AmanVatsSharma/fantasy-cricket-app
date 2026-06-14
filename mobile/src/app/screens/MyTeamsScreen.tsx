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
  ScrollView,
} from 'react-native';
import {
  MOCK_TEAMS,
  MOCK_STATS,
  MOCK_MATCH,
  ContestType,
} from '../data/mockTeams';
import { useDrawer } from '../../..';
import { useToast } from '../components/Toast';
import { useNavigation } from '@react-navigation/native';

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
    <View style={sb.item} accessible accessibilityRole="text" accessibilityLabel={`${stats.teams} teams`}>
      <Text style={sb.value}>{stats.teams}</Text>
      <Text style={sb.label}>TEAMS</Text>
    </View>
    <View style={sb.divider} />
    <View style={sb.item} accessible accessibilityRole="text" accessibilityLabel={`Total winning ${stats.totalWinning} rupees`}>
      <Text style={sb.value}>₹{stats.totalWinning}</Text>
      <Text style={sb.label}>TOTAL WINNING</Text>
    </View>
    <View style={sb.divider} />
    <View style={sb.item} accessible accessibilityRole="text" accessibilityLabel={`${stats.contestsJoined} contests joined`}>
      <Text style={sb.value}>{stats.contestsJoined}</Text>
      <Text style={sb.label}>CONTESTS JOINED</Text>
    </View>
    <View style={sb.divider} />
    <View style={sb.item} accessible accessibilityRole="text" accessibilityLabel={`${stats.winningTeams} winning teams`}>
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
      return diff;
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

// Per-contest color map for the type pill in the top-left of each card.
const CONTEST_PILL_BG: Record<ContestType, string> = {
  'Mega Contest': '#10B981',
  'Head to Head': '#9333EA',
  'Mini Grand': '#3B82F6',
  'Hot Contest': '#F97316',
  'Beginner Contest': '#D946EF',
};

// Card representation of a single fantasy team. Renders the contest
// type pill, edit / more actions, team name + rank, player avatar
// strip with +5 overflow, points / winning summary, and a CTA button
// that will be wired to navigation in Task 6.
const TeamCard: React.FC<{ team: typeof MOCK_TEAMS[number] }> = ({ team }) => {
  const { show } = useToast();
  const nav = useNavigation();

  return (
    <View style={tc.root}>
      {/* Top row: contest type pill + edit/more actions */}
      <View style={tc.topRow}>
        <View style={[tc.pill, { backgroundColor: CONTEST_PILL_BG[team.contestType] }]}>
          <Text style={tc.pillTxt}>{team.contestType.toUpperCase()}</Text>
        </View>
        <View style={tc.actions}>
          <TouchableOpacity
            style={tc.actionBtn}
            onPress={() => nav.navigate('EditProfile' as any)}
            activeOpacity={0.7}
          >
            <Text style={tc.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tc.actionBtn}
            onPress={() => nav.navigate('AITeamSuggestions' as any)}
            activeOpacity={0.7}
          >
            <Text style={tc.actionIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Name + rank row */}
      <View style={tc.nameRow}>
        <Text style={tc.teamName}>{team.name}</Text>
        <Text style={tc.rank}>{team.rank}</Text>
      </View>

      {/* Avatars + points/winning row */}
      <View style={tc.avatarsRow}>
        <View style={tc.avatarStrip}>
          {team.players.slice(0, 6).map((p) => (
            <View key={p.id} style={[tc.avatar, { backgroundColor: p.color }]}>
              <Text style={tc.avatarTxt}>{p.initials}</Text>
            </View>
          ))}
          <View style={tc.overflowChip}>
            <Text style={tc.overflowTxt}>+5</Text>
          </View>
        </View>
        <View style={tc.metricsCol}>
          <Text style={tc.points}>{team.points}</Text>
          {team.winning > 0 && (
            <Text style={tc.winning}>₹{team.winning}</Text>
          )}
        </View>
      </View>

      {/* CTA row */}
      <View style={tc.ctaRow}>
        <TouchableOpacity
          style={tc.ctaBtn}
          onPress={() => nav.navigate('ContestLobby', {
            matchId: 'm1',
            matchName: 'CHE vs KOL',
            team1: 'CHE',
            team2: 'KOL',
            team1Color: '#F7C42E',
            team2Color: '#3F2E84',
          } as any)}
          activeOpacity={0.7}
        >
          <Text style={tc.ctaTxt}>🏆 VIEW CONTEST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ *
 *  Sub-tab content
 * ------------------------------------------------------------------ */

// Gold-bordered referral banner. A decorative 🎁 is floated
// bottom-right behind a faint gold halo to mirror the clone image.
const ReferralBanner: React.FC = () => (
  <View style={rb.root} accessible accessibilityRole="text" accessibilityLabel="Refer and Earn, invite friends and earn 100 rupees">
    <View style={rb.row}>
      <Text style={rb.copyIcon}>📋</Text>
      <View style={rb.txtCol}>
        <Text style={rb.title}>Refer & Earn</Text>
        <Text style={rb.sub}>Invite friends and earn ₹100</Text>
      </View>
    </View>
    <View style={rb.giftHalo} pointerEvents="none">
      <Text style={rb.giftIcon}>🎁</Text>
    </View>
  </View>
);

// Centered empty state used by the Joined Contests and Saved Teams
// sub-tabs. Renders a dimmed message and a single CTA button. onPress
// is left for Task 6 to wire to a toast.
const EmptySubTab: React.FC<{
  message: string;
  cta: string;
  onPress: () => void;
}> = ({ message, cta, onPress }) => (
  <View style={es.root}>
    <Text style={es.msg}>{message}</Text>
    <TouchableOpacity style={es.cta} onPress={onPress} activeOpacity={0.7}>
      <Text style={es.ctaTxt}>{cta}</Text>
    </TouchableOpacity>
  </View>
);

/* ------------------------------------------------------------------ *
 *  Main screen
 * ------------------------------------------------------------------ */

export const MyTeamsScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('myTeams');
  const { show } = useToast();
  const nav = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: '#080810' }}>
      <ModernHeader />
      <SubTabBar active={activeSubTab} onChange={setActiveSubTab} />
      {activeSubTab === 'myTeams' ? (
        <>
          <StatsBar stats={MOCK_STATS} />
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <MatchInfoCard match={MOCK_MATCH} />
            <FlatList
              data={MOCK_TEAMS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TeamCard team={item} />}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
            <ReferralBanner />
          </ScrollView>
        </>
      ) : activeSubTab === 'joinedContests' ? (
        <EmptySubTab
          message="You haven't joined any contests from this match"
          cta="Browse Contests"
          onPress={() => nav.navigate('ContestLobby' as any)}
        />
      ) : (
        <EmptySubTab
          message="No saved teams yet"
          cta="Create Team"
          onPress={() => nav.navigate('AITeamSuggestions' as any)}
        />
      )}
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

const tc = StyleSheet.create({
  root: {
    backgroundColor: '#14141f',
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  rank: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  overflowChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowTxt: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsCol: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  points: {
    color: '#ECBD15',
    fontSize: 18,
    fontWeight: '900',
  },
  winning: {
    color: '#0FCC74',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  ctaRow: {
    alignItems: 'flex-end',
  },
  ctaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctaTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

const rb = StyleSheet.create({
  root: {
    backgroundColor: 'rgba(236,189,21,0.1)',
    borderColor: '#ECBD15',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copyIcon: {
    fontSize: 22,
  },
  txtCol: {
    flex: 1,
  },
  title: {
    color: '#ECBD15',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  sub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  giftHalo: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236,189,21,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftIcon: {
    fontSize: 36,
    opacity: 0.6,
  },
});

const es = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  msg: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  cta: {
    backgroundColor: '#ECBD15',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaTxt: {
    color: '#080810',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});

export default MyTeamsScreen;
