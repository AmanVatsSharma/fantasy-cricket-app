/**
 * File:        mobile/src/app/screens/WinnersScreen.tsx
 * Module:      Contest · Winners Screen
 * Purpose:     Winners showcase screen — header, podium for top 3, full winners list with filters and stats
 *
 * Exports:
 *   - WinnersScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, ScrollView, TouchableOpacity, StyleSheet
 *   - react-native-svg                — Svg, Path, Circle, Rect
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
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const TrophyIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path
      d="M7 4h10v4a5 5 0 01-5 5 5 5 0 01-5-5V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M9 14h6v3H9zM8 19h8v2H8z"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
  </Svg>
);

const CrownIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M3 18h18l-2-9-4 4-3-6-3 6-4-4-2 9z" fill={color} />
  </Svg>
);

const FilterIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const SearchIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M21 21l-5-5" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PODIUM = [
  { rank: 2, name: 'Arjun K.', prize: '₹50,000', points: 821, color: '#C0C0C0' },
  { rank: 1, name: 'Vikram S.', prize: '₹1,00,000', points: 856, color: '#ECBD15' },
  { rank: 3, name: 'Rohit M.', prize: '₹25,000', points: 798, color: '#CD7F32' },
];

const ALL_WINNERS = [
  { rank: 1, name: 'Vikram S.', points: 856, prize: '₹1,00,000', city: 'Mumbai' },
  { rank: 2, name: 'Arjun K.', points: 821, prize: '₹50,000', city: 'Bangalore' },
  { rank: 3, name: 'Rohit M.', points: 798, prize: '₹25,000', city: 'Delhi' },
  { rank: 4, name: 'Suresh R.', points: 776, prize: '₹10,000', city: 'Chennai' },
  { rank: 5, name: 'Karan P.', points: 754, prize: '₹10,000', city: 'Pune' },
  { rank: 6, name: 'Amit T.', points: 743, prize: '₹10,000', city: 'Hyderabad' },
  { rank: 7, name: 'Nitin J.', points: 731, prize: '₹10,000', city: 'Kolkata' },
  { rank: 8, name: 'Ravi B.', points: 725, prize: '₹10,000', city: 'Jaipur' },
  { rank: 9, name: 'Manoj V.', points: 718, prize: '₹10,000', city: 'Lucknow' },
  { rank: 10, name: 'Deepak L.', points: 712, prize: '₹10,000', city: 'Ahmedabad' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const WinnersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'all' | 'mega' | 'head2head'>('all');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Winners</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <FilterIcon />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIconWrap}>
            <TrophyIcon />
          </View>
          <Text style={styles.heroTitle}>CONTEST CHAMPIONS</Text>
          <Text style={styles.heroSubtitle}>IND vs AUS · T20 Final · 10,000 Players</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>5,000</Text>
              <Text style={styles.heroStatLabel}>Winners</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>₹10L</Text>
              <Text style={styles.heroStatLabel}>Distributed</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>50%</Text>
              <Text style={styles.heroStatLabel}>Win Rate</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterBar}>
          {([
            { key: 'all', label: 'All Winners' },
            { key: 'mega', label: 'Mega Contests' },
            { key: 'head2head', label: 'Head to Head' },
          ] as const).map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            >
              <Text style={[styles.filterPillText, filter === f.key && styles.filterPillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <SearchIcon />
          <Text style={styles.searchPlaceholder}>Search by name or rank</Text>
        </View>

        {/* Podium */}
        <View style={styles.podiumSection}>
          <Text style={styles.sectionTitle}>🏆 Top 3 Podium</Text>
          <View style={styles.podium}>
            {PODIUM.map(p => (
              <View key={p.rank} style={styles.podiumCol}>
                <View style={[styles.podiumAvatar, { borderColor: p.color }]}>
                  <Text style={[styles.podiumAvatarText, { color: p.color }]}>{p.name.charAt(0)}</Text>
                  {p.rank === 1 && (
                    <View style={styles.crownBadge}>
                      <CrownIcon />
                    </View>
                  )}
                </View>
                <Text style={styles.podiumName}>{p.name}</Text>
                <Text style={styles.podiumPoints}>{p.points} pts</Text>
                <View style={[styles.podiumBar, { backgroundColor: p.color + '33' }]}>
                  <Text style={[styles.podiumRank, { color: p.color }]}>#{p.rank}</Text>
                </View>
                <Text style={[styles.podiumPrize, { color: p.color }]}>{p.prize}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Full Winners List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>All Winners</Text>
            <Text style={styles.listCount}>{ALL_WINNERS.length} of 5,000</Text>
          </View>
          {ALL_WINNERS.map((w, i) => (
            <View key={i} style={styles.winnerRow}>
              <View style={[styles.winnerRankBadge, i < 3 && styles.winnerRankBadgeTop]}>
                <Text style={[styles.winnerRankText, i < 3 && { color: '#080810' }]}>#{w.rank}</Text>
              </View>
              <View style={styles.winnerAvatar}>
                <Text style={styles.winnerAvatarText}>{w.name.charAt(0)}</Text>
              </View>
              <View style={styles.winnerInfo}>
                <Text style={styles.winnerName}>{w.name}</Text>
                <Text style={styles.winnerMeta}>{w.city} · {w.points} pts</Text>
              </View>
              <View style={styles.winnerPrizeWrap}>
                <Text style={[styles.winnerPrize, i < 3 && { color: '#ECBD15' }]}>{w.prize}</Text>
                <Text style={styles.winnerPrizeLabel}>Won</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllBtnText}>View All 5,000 Winners</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  filterBtn: { padding: 8 },
  scrollContent: { paddingBottom: 20 },

  heroCard: {
    alignItems: 'center', margin: 16, marginTop: 8, padding: 24,
    borderRadius: 20, backgroundColor: '#10101c',
    borderWidth: 1, borderColor: 'rgba(236,189,21,0.25)', overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -60, width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(236,189,21,0.15)',
  },
  heroIconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(236,189,21,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  heroSubtitle: { color: '#8a8a9a', fontSize: 12, marginTop: 4 },
  heroStatsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 14, marginTop: 16, alignSelf: 'stretch',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#ECBD15', fontSize: 18, fontWeight: '900' },
  heroStatLabel: { color: '#8a8a9a', fontSize: 10, marginTop: 4 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  filterBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterPillActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  filterPillText: { color: '#8a8a9a', fontSize: 12, fontWeight: '600' },
  filterPillTextActive: { color: '#fff' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, padding: 12,
    backgroundColor: '#10101c', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  searchPlaceholder: { color: '#8a8a9a', fontSize: 13 },

  podiumSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 16 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, justifyContent: 'center' },
  podiumCol: { alignItems: 'center', flex: 1 },
  podiumAvatar: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#10101c',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, marginBottom: 8, position: 'relative',
  },
  podiumAvatarText: { fontSize: 24, fontWeight: '900' },
  crownBadge: {
    position: 'absolute', top: -10, right: -10,
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: '#080810',
    alignItems: 'center', justifyContent: 'center',
  },
  podiumName: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  podiumPoints: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },
  podiumBar: {
    width: '100%', paddingVertical: 8, alignItems: 'center', borderRadius: 8, marginTop: 8,
  },
  podiumRank: { fontSize: 14, fontWeight: '900' },
  podiumPrize: { fontSize: 12, fontWeight: '800', marginTop: 6 },

  listSection: { marginTop: 24, paddingHorizontal: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listCount: { color: '#8a8a9a', fontSize: 11 },

  winnerRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 8,
    backgroundColor: '#10101c', borderRadius: 12, gap: 12,
  },
  winnerRankBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  winnerRankBadgeTop: { backgroundColor: '#ECBD15' },
  winnerRankText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  winnerAvatar: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  winnerAvatarText: { color: colors.brandPrimary, fontSize: 16, fontWeight: '800' },
  winnerInfo: { flex: 1 },
  winnerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  winnerMeta: { color: '#8a8a9a', fontSize: 11, marginTop: 2 },
  winnerPrizeWrap: { alignItems: 'flex-end' },
  winnerPrize: { color: '#fff', fontSize: 13, fontWeight: '800' },
  winnerPrizeLabel: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },

  viewAllBtn: {
    marginHorizontal: 16, marginTop: 12, padding: 14,
    borderRadius: 12, backgroundColor: 'rgba(206,64,77,0.15)',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(206,64,77,0.3)',
  },
  viewAllBtnText: { color: colors.brandPrimary, fontSize: 13, fontWeight: '700' },
});

export default WinnersScreen;
