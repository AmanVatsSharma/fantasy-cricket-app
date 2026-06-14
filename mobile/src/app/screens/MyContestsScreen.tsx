/**
 * File:        mobile/src/app/screens/MyContestsScreen.tsx
 * Module:      Mobile · My Contests Screen
 * Purpose:     "My Contests" tab — header chrome, status tabs (Upcoming /
 *              Live / Completed), filter row, summary dashboard, and a
 *              per-match contest card list. Matches the design spec for
 *              a fantasy-cricket "My Contests" entry-point.
 *
 * Exports:
 *   - MyContestsScreen — bottom-tab screen for the user's joined contests
 *
 * Depends on:
 *   - react-native, react-native-svg
 *   - ../components/Toast
 *   - ../components/HomeTabBar
 *   - ../theme/colors
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useToast, ToastView } from '../components/Toast';
import { HomeTabBar, HomeTabName } from '../components/HomeTabBar';
import { colors } from '../theme/colors';

/* ------------------------------------------------------------------ *
 *  Mock data
 * ------------------------------------------------------------------ */

type ContestStatus = 'upcoming' | 'live' | 'completed';

type UserContest = {
  id: string;
  matchName: string;
  team1: { abbr: string; color: string; textColor: string };
  team2: { abbr: string; color: string; textColor: string };
  startsIn: string;          // mock countdown string
  startTime: string;         // e.g. "Today, 8:00 PM" / "Tomorrow, 7:30 PM" / "29 May, 7:30 PM"
  contestType: 'Mega Contest' | 'Head to Head' | 'Mini Grand' | 'Hot Contest';
  entryFee: number;
  totalSpots: number;
  myTeams: number;
  potentialWin: number;
  status: ContestStatus;
};

const MOCK_CONTESTS: UserContest[] = [
  {
    id: 'e1',
    matchName: 'CHE vs KOL',
    team1: { abbr: 'CHE', color: '#F7C42E', textColor: '#1A1A22' },
    team2: { abbr: 'KOL', color: '#3F2E84', textColor: '#FFFFFF' },
    startsIn: '2h 15m',
    startTime: 'Today, 8:00 PM',
    contestType: 'Mega Contest',
    entryFee: 49,
    totalSpots: 100000,
    myTeams: 1,
    potentialWin: 500000,
    status: 'upcoming',
  },
  {
    id: 'e2',
    matchName: 'HYD vs MUM',
    team1: { abbr: 'HYD', color: '#F86A1B', textColor: '#FFFFFF' },
    team2: { abbr: 'MUM', color: '#004BA0', textColor: '#FFFFFF' },
    startsIn: '4h 45m',
    startTime: 'Today, 10:30 PM',
    contestType: 'Mega Contest',
    entryFee: 29,
    totalSpots: 150000,
    myTeams: 2,
    potentialWin: 250000,
    status: 'upcoming',
  },
  {
    id: 'e3',
    matchName: 'RR vs RCB',
    team1: { abbr: 'RR', color: '#E23A6E', textColor: '#FFFFFF' },
    team2: { abbr: 'RCB', color: '#D40026', textColor: '#FFFFFF' },
    startsIn: '1d 2h',
    startTime: 'Tomorrow, 7:30 PM',
    contestType: 'Head to Head',
    entryFee: 25,
    totalSpots: 2,
    myTeams: 1,
    potentialWin: 45,
    status: 'upcoming',
  },
  {
    id: 'e4',
    matchName: 'PBKS vs DC',
    team1: { abbr: 'PBKS', color: '#DA1113', textColor: '#FFFFFF' },
    team2: { abbr: 'DC', color: '#004898', textColor: '#FFFFFF' },
    startsIn: '2d 4h',
    startTime: '29 May, 7:30 PM',
    contestType: 'Mini Grand',
    entryFee: 15,
    totalSpots: 10000,
    myTeams: 3,
    potentialWin: 150000,
    status: 'upcoming',
  },
];

/* ------------------------------------------------------------------ *
 *  Header chrome (matches HomeScreen)
 * ------------------------------------------------------------------ */

const Wordmark: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const fontSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  return (
    <View style={styles.wordmark}>
      <View style={styles.wordmarkEleven}>
        <Text style={[styles.wordmarkElevenText, { fontSize: fontSize + 2 }]}>11</Text>
      </View>
      <Text style={[styles.wordmarkDreamer, { fontSize, fontStyle: 'italic' }]}>DREAMER</Text>
    </View>
  );
};

const BellIcon: React.FC<{ color?: string }> = ({ color = colors.text.primary }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M6 17 L6 11 C6 7.5 8.5 5 12 5 C15.5 5 18 7.5 18 11 V17 L20 19 H4 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path d="M10 21 C10.5 22 11 22 12 22 C13 22 13.5 22 14 21" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx={17.5} cy={6} r={2.5} fill={colors.brand.red} />
  </Svg>
);

const ProfileIcon: React.FC<{ color?: string }> = ({ color = colors.text.primary }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={4} fill="none" stroke={color} strokeWidth={1.8} />
    <Path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const AppHeader: React.FC = () => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Wordmark size="md" />
      <View style={styles.walletPill}>
        <Svg width={12} height={12} viewBox="0 0 24 24">
          <Rect x={3} y={6} width={18} height={13} rx={2} fill="none" stroke={colors.brand.gold} strokeWidth={1.8} />
          <Circle cx={17} cy={12.5} r={1} fill={colors.brand.gold} />
        </Svg>
        <Text style={styles.walletAmount}>₹125.50</Text>
      </View>
    </View>
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications' as never)}>
        <BellIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Account' as never)}>
        <ProfileIcon />
      </TouchableOpacity>
    </View>
  </View>
);

/* ------------------------------------------------------------------ *
 *  Filter dropdowns (visual only — taps fire a toast)
 * ------------------------------------------------------------------ */

const FilterDropdown: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity style={styles.filterDropdown} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.filterLabel}>{label}</Text>
    <Svg width={12} height={12} viewBox="0 0 24 24">
      <Path d="M6 9 L12 15 L18 9" fill="none" stroke={colors.text.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </TouchableOpacity>
);

/* ------------------------------------------------------------------ *
 *  Status tab strip (Upcoming / Live / Completed)
 * ------------------------------------------------------------------ */

type StatusTab = 'upcoming' | 'live' | 'completed';

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Completed' },
];

const StatusTabs: React.FC<{ active: StatusTab; onChange: (s: StatusTab) => void }> = ({ active, onChange }) => (
  <View style={styles.statusTabsRow}>
    {STATUS_TABS.map((t) => {
      const focused = t.key === active;
      return (
        <TouchableOpacity
          key={t.key}
          style={styles.statusTab}
          onPress={() => onChange(t.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.statusTabLabel, focused && styles.statusTabLabelActive]}>{t.label}</Text>
          {focused && <View style={styles.statusTabUnderline} />}
        </TouchableOpacity>
      );
    })}
  </View>
);

/* ------------------------------------------------------------------ *
 *  Summary dashboard (4 stat columns)
 * ------------------------------------------------------------------ */

const SummaryStat: React.FC<{ value: string; label: string; accent?: 'green' }> = ({ value, label, accent }) => (
  <View style={styles.statCell}>
    <Text style={[styles.statValue, accent === 'green' && styles.statValueGreen]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SummaryDashboard: React.FC<{
  totalContests: number;
  totalEntries: number;
  totalWinnings: number;
  totalInvested: number;
}> = ({ totalContests, totalEntries, totalWinnings, totalInvested }) => (
  <View style={styles.dashboardCard}>
    <SummaryStat value={String(totalContests)} label="Total Contests" />
    <View style={styles.statDividerV} />
    <SummaryStat value={`₹${totalInvested}`} label="Total Entries" />
    <View style={styles.statDividerV} />
    <SummaryStat value={`₹${totalWinnings}`} label="Winning" accent="green" />
    <View style={styles.statDividerV} />
    <SummaryStat value={`₹${totalWinnings}`} label="Winnings" accent="green" />
  </View>
);

/* ------------------------------------------------------------------ *
 *  Contest type icon (color-coded)
 * ------------------------------------------------------------------ */

const ContestTypeIcon: React.FC<{ kind: UserContest['contestType']; size?: number }> = ({ kind, size = 24 }) => {
  if (kind === 'Mega Contest') {
    // green megaphone-ish
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3 10 V14 H7 L14 18 V6 L7 10 Z" fill={colors.brand.green} />
        <Path d="M16 9 C18 10 18 14 16 15" fill="none" stroke={colors.brand.green} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    );
  }
  if (kind === 'Head to Head') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z" fill="#9C5BD8" opacity={0.25} />
        <Path d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z" fill="none" stroke="#9C5BD8" strokeWidth={1.6} strokeLinejoin="round" />
        <Path d="M7 12 H10 L12 9 L14 15 L16 12 H17" fill="none" stroke="#9C5BD8" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  // Mini Grand or Hot Contest → blue shield
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z" fill="#3F8FFF" opacity={0.25} />
      <Path d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z" fill="none" stroke="#3F8FFF" strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 *  Contest card (one per match)
 * ------------------------------------------------------------------ */

const TeamBadge: React.FC<{ abbr: string; color: string; textColor: string }> = ({ abbr, color, textColor }) => (
  <View style={[styles.teamBadge, { backgroundColor: color }]}>
    <Text style={[styles.teamBadgeText, { color: textColor }]}>{abbr}</Text>
  </View>
);

const ContestCard: React.FC<{ contest: UserContest; onViewTeams: () => void; onContestPress: () => void }> = ({ contest, onViewTeams, onContestPress }) => (
  <TouchableOpacity style={styles.contestCard} onPress={onContestPress} activeOpacity={0.85}>
    {/* Top row: countdown + teams */}
    <View style={styles.cardTopRow}>
      <View style={styles.timeBlock}>
        <View style={styles.timeBadge}>
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={9} fill="none" stroke={colors.brand.gold} strokeWidth={1.8} />
            <Path d="M12 7 V12 L15 14" fill="none" stroke={colors.brand.gold} strokeWidth={1.8} strokeLinecap="round" />
          </Svg>
          <Text style={styles.startsInText}>{contest.startsIn} remaining</Text>
        </View>
        <Text style={styles.startTimeText}>{contest.startTime}</Text>
      </View>
      <View style={styles.cardTeamsRow}>
        <TeamBadge abbr={contest.team1.abbr} color={contest.team1.color} textColor={contest.team1.textColor} />
        <Text style={styles.cardVs}>VS</Text>
        <TeamBadge abbr={contest.team2.abbr} color={contest.team2.color} textColor={contest.team2.textColor} />
      </View>
    </View>

    {/* Contest type + entry/spots */}
    <View style={styles.cardTypeRow}>
      <View style={styles.contestTypeWrap}>
        <ContestTypeIcon kind={contest.contestType} size={20} />
        <Text style={styles.contestTypeText}>{contest.contestType}</Text>
      </View>
      <Text style={styles.entrySpotsText}>
        Entry ₹{contest.entryFee} • {contest.totalSpots.toLocaleString('en-IN')} spots
      </Text>
    </View>

    {/* You-entered pill + potential win */}
    <View style={styles.cardStatusRow}>
      <View style={styles.enteredPill}>
        <Svg width={12} height={12} viewBox="0 0 24 24">
          <Path d="M5 12 L10 17 L19 7" fill="none" stroke={colors.brand.green} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={styles.enteredPillText}>
          You've Entered {contest.myTeams} Team{contest.myTeams > 1 ? 's' : ''}
        </Text>
      </View>
      <Text style={styles.potentialWinText}>
        ₹{contest.potentialWin.toLocaleString('en-IN')}
      </Text>
    </View>

    {/* View teams CTA */}
    <TouchableOpacity style={styles.viewTeamsBtn} onPress={onViewTeams} activeOpacity={0.85}>
      <Text style={styles.viewTeamsBtnText}>VIEW TEAMS</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

/* ------------------------------------------------------------------ *
 *  Empty state for Live / Completed
 * ------------------------------------------------------------------ */

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <View style={styles.emptyState}>
    <Svg width={56} height={56} viewBox="0 0 56 56">
      <Circle cx={28} cy={28} r={26} fill="none" stroke={colors.border.subtle} strokeWidth={1.5} />
      <Path d="M18 30 L26 38 L40 22" fill="none" stroke={colors.brand.red} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

/* ------------------------------------------------------------------ *
 *  Referral banner (red themed)
 * ------------------------------------------------------------------ */

const ReferralBanner: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.referralBanner} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.referralLeft}>
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Rect x={6} y={22} width={44} height={28} rx={2} fill={colors.brand.gold} />
        <Rect x={6} y={18} width={44} height={6} fill="#B89015" />
        <Rect x={25} y={18} width={6} height={32} fill={colors.brand.red} />
        <Path d="M15 18 C11 18 9 14 11 11 C13 8 17 10 17 14 L17 18" fill={colors.brand.gold} stroke="#B89015" strokeWidth={1.4} />
        <Path d="M41 18 C45 18 47 14 45 11 C43 8 39 10 39 14 L39 18" fill={colors.brand.gold} stroke="#B89015" strokeWidth={1.4} />
      </Svg>
    </View>
    <View style={styles.referralText}>
      <Text style={styles.referralTitle}>Invite Your Friends & Earn</Text>
      <Text style={styles.referralSub}>
        Earn <Text style={styles.referralAmount}>₹100</Text> as your friend joins & plays!
      </Text>
    </View>
    <View style={styles.referralCta}>
      <View style={styles.referralInviteBtn}>
        <Text style={styles.referralInviteText}>INVITE NOW</Text>
      </View>
    </View>
  </TouchableOpacity>
);

/* ------------------------------------------------------------------ *
 *  Main screen
 * ------------------------------------------------------------------ */

export const MyContestsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { toast, show } = useToast();

  const [statusTab, setStatusTab] = useState<StatusTab>('upcoming');
  const topPadding = Platform.OS === 'ios' ? insets.top : 20;

  // Filter contests for the active status tab. The mock data is all
  // 'upcoming' — Live and Completed show the empty state.
  const visibleContests = useMemo(
    () => MOCK_CONTESTS.filter((c) => c.status === statusTab),
    [statusTab]
  );

  // Summary numbers across the user's full portfolio (matches the
  // spec's "12 contests / ₹286 entries / ₹520 winning / ₹520 winnings"
  // pattern). Computed once from the full set so switching tabs does
  // not hide the dashboard.
  const summary = useMemo(() => {
    const totalContests = MOCK_CONTESTS.length;
    const totalEntries = MOCK_CONTESTS.reduce((sum, c) => sum + c.entryFee * c.myTeams, 0);
    return {
      totalContests,
      totalEntries,
      // Mock: winnings + winning shown as the same number (₹520 in the
      // spec). When the wallet store is wired up, swap this for the
      // store value.
      totalWinnings: 520,
    };
  }, []);

  const handleTabChange = (tab: HomeTabName) => {
    if (tab === 'home') {
      if ((nav as any).canGoBack?.() || (nav as any).getCurrentRoute?.()?.name !== 'Home') {
        (nav as any).popToTop?.();
      }
      return;
    }
    if (tab === 'contests') {
      // Already here
      return;
    }
    const labels: Record<HomeTabName, string> = {
      home: 'Home',
      contests: 'My Contests',
      teams: 'My Teams',
      wallet: 'Wallet',
      more: 'More',
    };
    show(`${labels[tab]} coming soon`);
  };

  const handleViewTeams = (matchName: string) => {
    if (nav?.navigate) {
      nav.navigate('AITeamSuggestions' as never);
    }
  };

  const handleContestPress = (c: UserContest) => {
    if (nav?.navigate) {
      nav.navigate('ContestWinningBreakdown' as never, {
        matchId: c.id,
        matchName: c.matchName,
        team1: c.team1.abbr,
        team2: c.team2.abbr,
        team1Color: c.team1.color,
        team2Color: c.team2.color,
        entryFee: c.entryFee,
        myTeams: c.myTeams,
        potentialWin: c.potentialWin,
      });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding, paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AppHeader />

        {/* Page title */}
        <Text style={styles.pageTitle}>My Contests</Text>

        {/* Status tabs */}
        <StatusTabs active={statusTab} onChange={setStatusTab} />

        {/* Filters row */}
        <View style={styles.filtersRow}>
          <FilterDropdown label="All Sports" onPress={() => show('Filter applied: All Sports')} />
          <FilterDropdown label="All Contests" onPress={() => show('Filter applied: All Contests')} />
          <View style={{ flex: 1 }} />
          <FilterDropdown label="Sort By" onPress={() => show('Sort: Recommended')} />
        </View>

        {/* Summary dashboard */}
        <SummaryDashboard
          totalContests={summary.totalContests}
          totalEntries={summary.totalEntries}
          totalWinnings={summary.totalWinnings}
          totalInvested={summary.totalEntries}
        />

        {/* Contest list (or empty state) */}
        {visibleContests.length === 0 ? (
          <EmptyState
            title={`No ${statusTab} contests`}
            subtitle={
              statusTab === 'live'
                ? 'You have no live contests right now. Join one from the Home tab.'
                : 'You have no completed contests yet. Win one to see it here.'
            }
          />
        ) : (
          visibleContests.map((c) => (
            <View key={c.id} style={styles.contestWrap}>
              <ContestCard
                contest={c}
                onViewTeams={() => handleViewTeams(c.matchName)}
                onContestPress={() => handleContestPress(c)}
              />
            </View>
          ))
        )}

        {/* Referral banner */}
        <View style={styles.referralWrap}>
          <ReferralBanner onPress={() => show('Referral link copied!')} />
        </View>
      </ScrollView>

      {/* Bottom tab bar */}
      <HomeTabBar activeTab="contests" onChange={handleTabChange} />

      <ToastView toast={toast} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* Header chrome */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 189, 21, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 189, 21, 0.55)',
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkEleven: {
    backgroundColor: colors.brand.red,
    paddingHorizontal: 4,
    borderRadius: 3,
    marginRight: 4,
  },
  wordmarkElevenText: {
    color: colors.text.onRed,
    fontWeight: '900',
  },
  wordmarkDreamer: {
    color: colors.text.primary,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  /* Page title */
  pageTitle: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 12,
    marginBottom: 14,
  },

  /* Status tabs */
  statusTabsRow: {
    flexDirection: 'row',
    gap: 22,
    marginBottom: 14,
  },
  statusTab: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  statusTabLabel: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  statusTabLabelActive: {
    color: colors.text.primary,
    fontWeight: '900',
  },
  statusTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: colors.brand.red,
  },

  /* Filters */
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.surface.panelElevated,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '700',
  },

  /* Summary dashboard */
  dashboardCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginBottom: 18,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  statValueGreen: {
    color: colors.brand.green,
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  statDividerV: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border.subtle,
  },

  /* Contest cards */
  contestWrap: {
    marginBottom: 12,
  },
  contestCard: {
    backgroundColor: colors.surface.panel,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  timeBlock: {
    width: 96,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  startsInText: {
    color: colors.brand.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  startTimeText: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  cardTeamsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  teamBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  cardVs: {
    color: colors.brand.red,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 10,
  },
  contestTypeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contestTypeText: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  entrySpotsText: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  enteredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(31, 168, 85, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(31, 168, 85, 0.5)',
  },
  enteredPillText: {
    color: colors.brand.green,
    fontSize: 10,
    fontWeight: '800',
  },
  potentialWinText: {
    color: colors.brand.green,
    fontSize: 14,
    fontWeight: '900',
  },

  viewTeamsBtn: {
    backgroundColor: colors.brand.red,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewTeamsBtnText: {
    color: colors.text.onRed,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 14,
  },
  emptySubtitle: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },

  /* Referral banner */
  referralWrap: {
    marginTop: 22,
  },
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(206, 64, 77, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(206, 64, 77, 0.4)',
    padding: 14,
  },
  referralLeft: {
    marginRight: 12,
  },
  referralText: {
    flex: 1,
  },
  referralTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  referralSub: {
    color: colors.text.muted,
    fontSize: 10.5,
    marginTop: 2,
  },
  referralAmount: {
    color: colors.brand.gold,
    fontWeight: '900',
  },
  referralCta: {
    alignItems: 'center',
  },
  referralInviteBtn: {
    backgroundColor: colors.brand.red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  referralInviteText: {
    color: colors.text.onRed,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
