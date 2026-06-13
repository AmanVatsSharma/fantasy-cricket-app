/**
 * File:        mobile/src/app/screens/ContestLobbyScreen.tsx
 * Module:      Mobile · Contest Lobby Screen
 * Purpose:     Shows all available contests for a single match. User picks
 *              which contest to enter by viewing prize pool, entry fee,
 *              spots filled, and clicking JOIN.
 *
 * Exports:
 *   - ContestLobbyScreen — main screen component
 *
 * Navigation:
 *   - route.params: { matchId: string; matchName: string; team1: string; team2: string; team1Color: string; team2Color: string }
 *   - navigates to: ContestJoinScreen with contest details
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React, { useState } from 'react';
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
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock contest data
const MOCK_CONTESTS = [
  {
    id: 'c1',
    type: 'Mega Contest',
    icon: 'trophy' as const,
    iconColor: colors.brand.gold,
    prizePool: '₹50 Crores',
    entryFee: 49,
    spots: 100000,
    filled: 50000,
    filledPct: 50,
    winners: '1,00,000',
    firstPrize: '₹1 Crore',
  },
  {
    id: 'c2',
    type: 'Hot Contest',
    icon: 'star' as const,
    iconColor: colors.brand.red,
    prizePool: '₹1 Lakh',
    entryFee: 10,
    spots: 10000,
    filled: 2000,
    filledPct: 20,
    winners: '1,000',
    firstPrize: '₹10,000',
  },
  {
    id: 'c3',
    type: 'Head to Head',
    icon: 'shield2' as const,
    iconColor: '#9C5BD8',
    prizePool: '₹5 Lakhs',
    entryFee: 25,
    spots: 2,
    filled: 1,
    filledPct: 50,
    winners: '1',
    firstPrize: '₹40,000',
  },
  {
    id: 'c4',
    type: 'Mini Grand',
    icon: 'shieldM' as const,
    iconColor: '#3F8FFF',
    prizePool: '₹2 Lakhs',
    entryFee: 15,
    spots: 10000,
    filled: 6500,
    filledPct: 65,
    winners: '5,000',
    firstPrize: '₹20,000',
  },
];

// Icon components
const TrophyIcon = ({ color, size = 28 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6 4 H18 V12 C18 15 15 17 12 17 C9 17 6 15 6 12 V4 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path d="M6 6 H4 V8 C4 9 5 10 6 10" fill="none" stroke={color} strokeWidth={1.8} />
    <Path d="M18 6 H20 V8 C20 9 19 10 18 10" fill="none" stroke={color} strokeWidth={1.8} />
    <Rect x={9} y={17} width={6} height={3} fill={color} />
    <Rect x={8} y={20} width={8} height={2} rx={1} fill={color} />
  </Svg>
);

const StarIcon = ({ color, size = 28 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2 L15 9 L22 9 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9 L9 9 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldIcon = ({ color, size = 28 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2 L20 5 V12 C20 16 16 19 12 21 C8 19 4 16 4 12 V5 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldM = ({ color, size = 28 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2 L20 5 V12 C20 16 16 19 12 21 C8 19 4 16 4 12 V5 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M8 8 V16 M8 8 L12 14 L16 8 M16 8 V16"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const BackIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M15 6 L9 12 L15 18"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FilterIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 4 H21 L14 12 V20 L10 18 V12 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

const getContestIcon = (kind: 'trophy' | 'star' | 'shield2' | 'shieldM', color: string, size = 28) => {
  switch (kind) {
    case 'trophy':
      return <TrophyIcon color={color} size={size} />;
    case 'star':
      return <StarIcon color={color} size={size} />;
    case 'shield2':
      return <ShieldIcon color={color} size={size} />;
    case 'shieldM':
      return <ShieldM color={color} size={size} />;
  }
};

// Team Badge component
const TeamBadge = ({ abbr, color }: { abbr: string; color: string }) => (
  <View style={[styles.teamBadge, { backgroundColor: color }]}>
    <Text style={styles.teamAbbr}>{abbr}</Text>
  </View>
);

// Contest Card component
const ContestCard = ({ contest }: { contest: typeof MOCK_CONTESTS[0] }) => {
  const { show } = useToast();
  const progressColor = contest.filledPct >= 60 ? colors.brand.red :
                       contest.filledPct >= 30 ? colors.brand.gold : '#3F8FFF';

  return (
    <View style={styles.contestCard}>
      {/* Header row */}
      <View style={styles.contestHeader}>
        <View style={styles.contestIconWrap}>
          {getContestIcon(contest.icon, contest.iconColor, 32)}
        </View>
        <View style={styles.contestTitleBox}>
          <Text style={styles.contestType}>{contest.type}</Text>
          <View style={styles.firstPrizeRow}>
            <Text style={styles.firstPrizeLabel}>1st Prize:</Text>
            <Text style={styles.firstPrizeValue}>{contest.firstPrize}</Text>
          </View>
        </View>
      </View>

      {/* Prize pool */}
      <View style={styles.prizeSection}>
        <Text style={styles.prizeLabel}>PRIZE POOL</Text>
        <Text style={styles.prizeAmount}>{contest.prizePool}</Text>
      </View>

      {/* Winners info */}
      <View style={styles.winnersRow}>
        <View style={styles.winnerItem}>
          <Text style={styles.winnerLabel}>Winners</Text>
          <Text style={styles.winnerValue}>{contest.winners}</Text>
        </View>
        <View style={styles.winnerDivider} />
        <View style={styles.winnerItem}>
          <Text style={styles.winnerLabel}>Total Spots</Text>
          <Text style={styles.winnerValue}>{contest.spots.toLocaleString()}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{contest.filled.toLocaleString()} spots filled</Text>
          <Text style={styles.progressPercent}>{contest.filledPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${contest.filledPct}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Join button */}
      <TouchableOpacity
        style={styles.joinBtn}
        onPress={() => show(`Joining ${contest.type} for ₹${contest.entryFee}...`)}
        activeOpacity={0.85}
      >
        <Text style={styles.joinBtnText}>JOIN ₹{contest.entryFee}</Text>
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path
            d="M9 6 L15 12 L9 18"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

export const ContestLobbyScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }) => {
  const { toast, show } = useToast();

  // Get match details from route params or use defaults
  const matchName = route?.params?.matchName || 'CHE vs KOL';
  const team1 = route?.params?.team1 || 'CHE';
  const team2 = route?.params?.team2 || 'KOL';
  const team1Color = route?.params?.team1Color || '#F7C42E';
  const team2Color = route?.params?.team2Color || '#3F2E84';

  const [filter, setFilter] = useState<'all' | 'free' | 'mega'>('all');
  const [contests] = useState(MOCK_CONTESTS);

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      show('Cannot go back');
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
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contests</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => show('Filters coming soon')} activeOpacity={0.7}>
            <FilterIcon />
          </TouchableOpacity>
        </View>

        {/* Match Info Card */}
        <View style={styles.matchCard}>
          <View style={styles.matchTeamsRow}>
            <TeamBadge abbr={team1} color={team1Color} />
            <View style={styles.matchVSBox}>
              <Text style={styles.matchVSText}>VS</Text>
              <Text style={styles.matchSubtext}>T20 • 8:00 PM</Text>
            </View>
            <TeamBadge abbr={team2} color={team2Color} />
          </View>
          <Text style={styles.matchTitle}>{matchName}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {[
            { key: 'all', label: 'All Contests' },
            { key: 'mega', label: 'Mega' },
            { key: 'free', label: 'Free' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contest List */}
        <View style={styles.contestList}>
          {contests.map((contest) => (
            <View key={contest.id} style={styles.contestSpacing}>
              <ContestCard contest={contest} />
            </View>
          ))}
        </View>
      </ScrollView>

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
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },

  // Match card
  matchCard: {
    backgroundColor: colors.surface.panel,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  matchTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  teamAbbr: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  matchVSBox: {
    alignItems: 'center',
    gap: 4,
  },
  matchVSText: {
    color: colors.brand.red,
    fontSize: 18,
    fontWeight: '900',
  },
  matchSubtext: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  matchTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Filter tabs
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface.panel,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  filterTabActive: {
    backgroundColor: colors.brand.red,
    borderColor: colors.brand.red,
  },
  filterTabText: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  filterTabTextActive: {
    color: colors.text.onRed,
  },

  // Contest list
  contestList: {
    paddingHorizontal: 16,
  },
  contestSpacing: {
    marginBottom: 12,
  },

  // Contest card
  contestCard: {
    backgroundColor: colors.surface.panel,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  contestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  contestIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contestTitleBox: {
    flex: 1,
  },
  contestType: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  firstPrizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  firstPrizeLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  firstPrizeValue: {
    color: colors.brand.gold,
    fontSize: 12,
    fontWeight: '900',
  },

  // Prize section
  prizeSection: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(236, 189, 21, 0.08)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 189, 21, 0.2)',
  },
  prizeLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  prizeAmount: {
    color: colors.brand.gold,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    textShadowColor: colors.brand.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // Winners row
  winnersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerItem: {
    flex: 1,
    alignItems: 'center',
  },
  winnerLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  winnerValue: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  winnerDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.subtle,
  },

  // Progress section
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Join button
  joinBtn: {
    backgroundColor: colors.brand.red,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FF6B7A',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  joinBtnText: {
    color: colors.text.onRed,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 24,
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