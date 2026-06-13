/**
 * File:        mobile/src/app/screens/MyContestsScreen.tsx
 * Module:      Mobile · My Contests Screen
 * Purpose:     Bottom-tab screen showing upcoming contests the user has joined
 *              with stats summary and individual contest cards. Replaces toast
 *              from HomeScreen when tapping "My Contests" tab.
 *
 * Exports:
 *   - MyContestsScreen — main screen component
 *
 * Depends on:
 *   - react-native, react-native-svg
 *   - ../components/Toast
 *   - ../components/HomeTabBar
 *   - ../theme/colors
 *   - ../store/useWalletStore (for winnings display)
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { useToast } from '../components/Toast';
import { HomeTabBar, HomeTabName } from '../components/HomeTabBar';
import { useWalletStore } from '../store/useWalletStore';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for user's contest entries
const MOCK_USER_CONTESTS = [
  {
    id: 'e1',
    matchId: 'm1',
    matchName: 'CHE vs KOL',
    teamAbbr1: 'CHE',
    teamName1: 'Chennai Super Kings',
    teamAbbr2: 'KOL',
    teamName2: 'Kolkata Knight Riders',
    team1Color: '#F7C42E',
    team2Color: '#3F2E84',
    contestType: 'Mega Contest',
    entryFee: 49,
    prizePool: '₹50 Crores',
    totalSpots: 100000,
    myTeams: 1,
    potentialWin: 500000,
    startTime: '2026-06-12T20:00:00',
    status: 'upcoming',
  },
  {
    id: 'e2',
    matchId: 'm2',
    matchName: 'HYD vs MUM',
    teamAbbr1: 'HYD',
    teamName1: 'Sunrisers Hyderabad',
    teamAbbr2: 'MUM',
    teamName2: 'Mumbai Indians',
    team1Color: '#F86A1B',
    team2Color: '#004BA0',
    contestType: 'Mega Contest',
    entryFee: 29,
    prizePool: '₹25 Crores',
    totalSpots: 150000,
    myTeams: 2,
    potentialWin: 250000,
    startTime: '2026-06-12T22:30:00',
    status: 'upcoming',
  },
  {
    id: 'e3',
    matchId: 'm3',
    matchName: 'RR vs RCB',
    teamAbbr1: 'RR',
    teamAbbr2: 'RCB',
    teamName1: 'Rajasthan Royals',
    teamName2: 'Royal Challengers Bengaluru',
    team1Color: '#E23A6E',
    team2Color: '#D40026',
    contestType: 'Head to Head',
    entryFee: 25,
    prizePool: '₹5 Lakhs',
    totalSpots: 2,
    myTeams: 1,
    potentialWin: 45,
    startTime: '2026-06-13T19:30:00',
    status: 'upcoming',
  },
  {
    id: 'e4',
    matchId: 'm4',
    matchName: 'PBKS vs DC',
    teamAbbr1: 'PBKS',
    teamAbbr2: 'DC',
    teamName1: 'Punjab Kings',
    teamName2: 'Delhi Capitals',
    team1Color: '#DA1113',
    team2Color: '#004898',
    contestType: 'Mini Grand',
    entryFee: 15,
    prizePool: '₹2 Lakhs',
    totalSpots: 10000,
    myTeams: 3,
    potentialWin: 150000,
    startTime: '2026-05-29T19:30:00',
    status: 'upcoming',
  },
];

// Icon components
const TrophyIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6 17 L6 11 C6 7.5 8.5 5 12 5 C15.5 5 18 7.5 18 11 V17 L20 19 H4 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={5} r={3} fill="none" stroke={color} strokeWidth={1.5} />
  </Svg>
);

const CalendarIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 4 H21 V20 H3 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 2 V6 M8 2 V6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M3 9 H21"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const TeamIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 3 C10 6 8 8 8 12 C8 14 9 15 12 17 C15 15 16 14 16 12 C16 8 14 6 12 3"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GiftIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x={6} y={18} width={12} height={4} rx={1} fill={color} />
    <Rect x={6} y={14} width={12} height={2} fill={color} />
    <Path
      d="M8 14 C8 12 7 11 9 11 C10 11 11 12 11 13 M16 14 C16 12 17 11 15 11 C14 11 13 12 13 13"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// Team Badge component
const TeamBadge = ({ abbr, name, color }: { abbr: string; name: string; color: string }) => (
  <View style={[styles.teamBadge, { backgroundColor: color }]}>
    <Text style={styles.teamAbbr}>{abbr}</Text>
  </View>
);

// Contest Card component
const ContestCard = ({ contest }: { contest: typeof MOCK_USER_CONTESTS[0] }) => {
  const { show } = useToast();
  const statusColor = contest.status === 'upcoming' ? colors.brand.red :
                     contest.status === 'live' ? '#FFA500' : '#666666';

  return (
    <View style={styles.contestCard}>
      {/* Match header */}
      <View style={styles.matchHeader}>
        <View style={styles.teamsRow}>
          <TeamBadge abbr={contest.teamAbbr1} name={contest.teamName1} color={contest.team1Color} />
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <TeamBadge abbr={contest.teamAbbr2} name={contest.teamName2} color={contest.team2Color} />
        </View>
        <View style={styles.contestInfo}>
          <Text style={[styles.contestType, { color: statusColor }]}>{contest.contestType}</Text>
          <Text style={styles.startTime}>
            {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      {/* Prize & entry */}
      <View style={styles.prizeEntryRow}>
        <View style={styles.prizeBox}>
          <Text style={styles.prizeLabel}>PRIZE POOL</Text>
          <Text style={styles.prizeAmount}>{contest.prizePool}</Text>
        </View>
        <View style={styles.entryBox}>
          <Text style={styles.entryLabel}>ENTRY FEE</Text>
          <Text style={styles.entryAmount}>₹{contest.entryFee}</Text>
        </View>
      </View>

      {/* User stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{contest.myTeams}</Text>
          <Text style={styles.statLabel}>TEAMS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{contest.potentialWin.toLocaleString()}</Text>
          <Text style={styles.statLabel}>POTENTIAL WIN</Text>
        </View>
      </View>

      {/* View Teams button */}
      <TouchableOpacity
        style={styles.viewTeamsBtn}
        onPress={() => show(`Viewing teams for ${contest.matchName}...`)}
        activeOpacity={0.8}
      >
        <Text style={styles.viewTeamsText}>VIEW TEAMS</Text>
      </TouchableOpacity>
    </View>
  );
};

export const MyContestsScreen: React.FC = () => {
  const { toast, show } = useToast();
  const { winnings } = useWalletStore();
  const [contests, setContests] = useState(MOCK_USER_CONTESTS);

  // Filter stats
  const totalContests = contests.length;
  const totalEntries = contests.reduce((sum, c) => sum + c.myTeams, 0);
  const totalEntryFees = contests.reduce((sum, c) => sum + (c.entryFee * c.myTeams), 0);
  const totalPotential = contests.reduce((sum, c) => sum + c.potentialWin, 0);

  const handleTabChange = (tab: HomeTabName) => {
    if (tab !== 'contests') {
      const labels: Record<HomeTabName, string> = {
        home: 'Home',
        contests: 'My Contests',
        teams: 'My Teams',
        wallet: 'Wallet',
        more: 'More',
      };
      show(`${labels[tab]} coming soon`);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Contests</Text>
        </View>

        {/* Summary Dashboard */}
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardTitle}>Contest Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.gridItem}>
              <TrophyIcon color={colors.brand.red} size={24} />
              <Text style={styles.gridValue}>{totalContests}</Text>
              <Text style={styles.gridLabel}>Total Contests</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <CalendarIcon color={colors.brand.gold} size={24} />
              <Text style={styles.gridValue}>{totalEntries}</Text>
              <Text style={styles.gridLabel}>Total Entries</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <TeamIcon color={colors.brand.green} size={24} />
              <Text style={styles.gridValue}>₹{totalEntryFees}</Text>
              <Text style={styles.gridLabel}>Total Invested</Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridItem}>
              <GiftIcon color={colors.brand.gold} size={24} />
              <Text style={[styles.gridValue, styles.winningValue]}>
                ₹{winnings}
              </Text>
              <Text style={styles.gridLabel}>Winnings</Text>
            </View>
          </View>
        </View>

        {/* Contest List */}
        <Text style={styles.sectionTitle}>Upcoming Contests</Text>
        {contests.map((contest) => (
          <View key={contest.id} style={styles.contestSpacing}>
            <ContestCard contest={contest} />
          </View>
        ))}
      </ScrollView>

      {/* Bottom tab bar */}
      <HomeTabBar activeTab="contests" onChange={handleTabChange} />

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
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
    paddingBottom: 120,
  },
  header: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // Dashboard card
  dashboardCard: {
    backgroundColor: colors.surface.panel,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  dashboardTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  gridValue: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },
  winningValue: {
    color: colors.brand.green,
  },
  gridLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  gridDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border.subtle,
    marginHorizontal: 8,
  },

  // Section title
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // Contest spacing
  contestSpacing: {
    marginBottom: 12,
  },

  // Contest card
  contestCard: {
    backgroundColor: colors.surface.panel,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchHeader: {
    marginBottom: 12,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  teamBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  teamAbbr: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brand.gold,
  },
  vsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  contestInfo: {
    alignItems: 'center',
    gap: 2,
  },
  contestType: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startTime: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },

  // Prize & entry
  prizeEntryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  prizeBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(236, 189, 21, 0.1)',
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.brand.gold,
  },
  prizeLabel: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  prizeAmount: {
    color: colors.brand.gold,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  entryBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(31, 168, 85, 0.1)',
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.brand.green,
  },
  entryLabel: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  entryAmount: {
    color: colors.brand.green,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.subtle,
    marginHorizontal: 12,
  },

  // View teams button
  viewTeamsBtn: {
    backgroundColor: colors.brand.red,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B7A',
  },
  viewTeamsText: {
    color: colors.text.onRed,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 110,
    left: 24,
    right: 24,
    backgroundColor: colors.surface.panelElevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
  },
  toastText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});