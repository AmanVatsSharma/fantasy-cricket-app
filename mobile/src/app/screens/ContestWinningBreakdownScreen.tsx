/**
 * File:        mobile/src/app/screens/ContestWinningBreakdownScreen.tsx
 * Module:      Contest · Winning Breakdown Screen
 * Purpose:     Detailed prize breakdown for a contest — header card, prize pool distribution, your rank card, and winner list
 *
 * Exports:
 *   - ContestWinningBreakdownScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, ScrollView, TouchableOpacity, StyleSheet
 *   - react-native-svg                — Svg, Path, Rect, Circle
 *   - @react-navigation/native         — useNavigation
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Svg, Path, Rect, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const TrophyIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M7 4h10v4a5 5 0 01-5 5 5 5 0 01-5-5V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M9 14h6v3H9zM8 19h8v2H8z"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
  </Svg>
);

const RupeeIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M7 5h10M7 9h10M7 13s3 0 5 2c2 2 5 2 5 2M7 5l10 14"
      stroke={color}
      strokeWidth={1.8}
      fill="none"
    />
  </Svg>
);

const CrownIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M3 18h18l-2-9-4 4-3-6-3 6-4-4-2 9z" fill={color} />
  </Svg>
);

const ArrowUpIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24">
    <Path d="M12 5v14M5 12l7-7 7 7" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PRIZE_DIST = [
  { rank: '1st', winners: 1, prize: '₹1,00,000', tag: 'Top Rank' },
  { rank: '2nd', winners: 1, prize: '₹50,000', tag: '' },
  { rank: '3rd', winners: 1, prize: '₹25,000', tag: '' },
  { rank: '4th - 10th', winners: 7, prize: '₹10,000', tag: '' },
  { rank: '11th - 100th', winners: 90, prize: '₹1,000', tag: '' },
  { rank: '101st - 1000th', winners: 900, prize: '₹100', tag: '' },
];

const TOP_WINNERS = [
  { rank: 1, name: 'Vikram S.', points: 856, prize: '₹1,00,000' },
  { rank: 2, name: 'Arjun K.', points: 821, prize: '₹50,000' },
  { rank: 3, name: 'Rohit M.', points: 798, prize: '₹25,000' },
  { rank: 4, name: 'Suresh R.', points: 776, prize: '₹10,000' },
  { rank: 5, name: 'Karan P.', points: 754, prize: '₹10,000' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const ContestWinningBreakdownScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'breakdown' | 'winners' | 'leaderboard'>('breakdown');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Winning Breakdown</Text>
        <View style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <TrophyIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>MEGA CONTEST WINNINGS</Text>
              <Text style={styles.heroTitle}>IND vs AUS · T20 Final</Text>
            </View>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>₹10,00,000</Text>
              <Text style={styles.heroStatLabel}>Prize Pool</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>5,000</Text>
              <Text style={styles.heroStatLabel}>Total Winners</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>₹100</Text>
              <Text style={styles.heroStatLabel}>Entry Fee</Text>
            </View>
          </View>
        </View>

        {/* Your Rank Card */}
        <View style={styles.yourRankCard}>
          <View style={styles.yourRankLeft}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>#42</Text>
            </View>
            <View>
              <Text style={styles.yourRankLabel}>YOUR RANK</Text>
              <Text style={styles.yourRankValue}>₹1,000 Won</Text>
            </View>
          </View>
          <View style={styles.yourRankRight}>
            <View style={styles.trendPill}>
              <ArrowUpIcon />
              <Text style={styles.trendText}>+18</Text>
            </View>
            <Text style={styles.pointsLabel}>728 points</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(['breakdown', 'winners', 'leaderboard'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'breakdown' ? 'Prize Breakdown' : t === 'winners' ? 'Top Winners' : 'Leaderboard'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {tab === 'breakdown' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prize Distribution</Text>
            {PRIZE_DIST.map((p, i) => (
              <View key={i} style={styles.prizeRow}>
                <View style={styles.prizeRowLeft}>
                  <Text style={styles.prizeRank}>{p.rank}</Text>
                  {p.tag !== '' && (
                    <View style={styles.prizeTag}>
                      <CrownIcon />
                      <Text style={styles.prizeTagText}>{p.tag}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.prizeRowMid}>
                  <Text style={styles.prizeWinners}>{p.winners} winner{p.winners > 1 ? 's' : ''}</Text>
                  <View style={styles.prizeBar}>
                    <View
                      style={[
                        styles.prizeBarFill,
                        {
                          width: `${Math.max(8, 100 - i * 15)}%`,
                          backgroundColor: i === 0 ? '#ECBD15' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.brandPrimary,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.prizeRowRight}>
                  <RupeeIcon color={i === 0 ? '#ECBD15' : '#fff'} />
                  <Text style={[styles.prizeAmt, i === 0 && { color: '#ECBD15' }]}>
                    {p.prize.replace('₹', '')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'winners' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 5 Winners</Text>
            {TOP_WINNERS.map((w, i) => (
              <View key={i} style={styles.winnerRow}>
                <View style={[styles.winnerRank, i === 0 && styles.winnerRankGold]}>
                  {i < 3 ? <CrownIcon color={i === 0 ? '#080810' : '#fff'} /> : <Text style={styles.winnerRankText}>{w.rank}</Text>}
                </View>
                <View style={styles.winnerAvatar}>
                  <Text style={styles.winnerAvatarText}>{w.name.charAt(0)}</Text>
                </View>
                <View style={styles.winnerInfo}>
                  <Text style={styles.winnerName}>{w.name}</Text>
                  <Text style={styles.winnerPoints}>{w.points} points</Text>
                </View>
                <View style={styles.winnerPrizeWrap}>
                  <Text style={[styles.winnerPrize, i === 0 && { color: '#ECBD15' }]}>{w.prize}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.viewAllWinnersBtn}
              onPress={() => navigation.navigate('Winners' as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.viewAllWinnersBtnTxt}>VIEW ALL WINNERS</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M9 6 L15 12 L9 18" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'leaderboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Position</Text>
            <View style={styles.leaderboardCard}>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardLabel}>Your Rank</Text>
                <Text style={styles.leaderboardValue}>#42 / 10,000</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardLabel}>Your Points</Text>
                <Text style={styles.leaderboardValue}>728</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardLabel}>Rank Up By</Text>
                <Text style={[styles.leaderboardValue, { color: '#27c28a' }]}>↑ 18 positions</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardLabel}>Prize Won</Text>
                <Text style={[styles.leaderboardValue, { color: '#ECBD15' }]}>₹1,000</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  shareBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(206,64,77,0.15)' },
  shareBtnText: { color: colors.brandPrimary, fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingBottom: 20 },

  heroCard: {
    margin: 16,
    marginTop: 8,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#10101c',
    borderWidth: 1,
    borderColor: 'rgba(236,189,21,0.25)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(236,189,21,0.12)',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  heroIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(236,189,21,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroLabel: { color: '#8a8a9a', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 2 },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  heroStatLabel: { color: '#8a8a9a', fontSize: 10, marginTop: 4 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  yourRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(39,194,138,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(39,194,138,0.3)',
  },
  yourRankLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#27c28a',
    alignItems: 'center', justifyContent: 'center',
  },
  rankBadgeText: { color: '#080810', fontSize: 18, fontWeight: '900' },
  yourRankLabel: { color: '#8a8a9a', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  yourRankValue: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 2 },
  yourRankRight: { alignItems: 'flex-end' },
  trendPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: 'rgba(39,194,138,0.2)', borderRadius: 8,
  },
  trendText: { color: '#27c28a', fontSize: 11, fontWeight: '700' },
  pointsLabel: { color: '#8a8a9a', fontSize: 11, marginTop: 6 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#10101c',
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: colors.brandPrimary },
  tabText: { color: '#8a8a9a', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 },

  prizeRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 8,
    backgroundColor: '#10101c',
    borderRadius: 12,
  },
  prizeRowLeft: { width: 90, gap: 4 },
  prizeRank: { color: '#fff', fontSize: 13, fontWeight: '700' },
  prizeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(236,189,21,0.15)', borderRadius: 6, alignSelf: 'flex-start',
  },
  prizeTagText: { color: '#ECBD15', fontSize: 9, fontWeight: '700' },
  prizeRowMid: { flex: 1, paddingHorizontal: 8 },
  prizeWinners: { color: '#8a8a9a', fontSize: 10, marginBottom: 4 },
  prizeBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  prizeBarFill: { height: '100%', borderRadius: 2 },
  prizeRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prizeAmt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  winnerRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 8,
    backgroundColor: '#10101c', borderRadius: 12, gap: 12,
  },
  winnerRank: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  winnerRankGold: { backgroundColor: '#ECBD15' },
  winnerRankText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  winnerAvatar: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  winnerAvatarText: { color: colors.brandPrimary, fontSize: 16, fontWeight: '800' },
  winnerInfo: { flex: 1 },
  winnerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  winnerPoints: { color: '#8a8a9a', fontSize: 11, marginTop: 2 },
  winnerPrizeWrap: { alignItems: 'flex-end' },
  winnerPrize: { color: '#fff', fontSize: 13, fontWeight: '800' },

  leaderboardCard: { backgroundColor: '#10101c', borderRadius: 14, padding: 16 },
  leaderboardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  leaderboardLabel: { color: '#8a8a9a', fontSize: 13 },
  leaderboardValue: { color: '#fff', fontSize: 13, fontWeight: '700' },

  viewAllWinnersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.red,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    gap: 8,
  },
  viewAllWinnersBtnTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});

export default ContestWinningBreakdownScreen;
