/**
 * File:        mobile/src/app/screens/AccountScreen.tsx
 * Module:      Account · Account Screen
 * Purpose:     Premium dark-mode account page with profile header, wallet stats, cashback card, quick actions, and settings menu
 *
 * Exports:
 *   - AccountScreen   — Full account screen with all sections (nav bar, profile header, stats row, cashback card, quick actions, menu list)
 *
 * Depends on:
 *   - react-native / react-native-web         — View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl
 *   - react-native-svg                        — Svg, Path, Circle, Rect, G
 *   - @react-navigation/native                 — useNavigation
 *   - @/store/useAuthStore                     — userId, email
 *   - @/store/useUserStore                    — name, location, joinDate, totalMatches, contestsWon, verified, kycStatus
 *   - @/store/useWalletStore                  — balance, cashback, winnings
 *
 * Side-effects:
 *   - Hydrates useUserStore and useWalletStore on mount if stores are empty
 *   - Pull-to-refresh re-triggers hydration
 *
 * Key invariants:
 *   - Pull-to-refresh calls hydrateStores(userId) which parallel-fetches user + wallet data
 *
 * Read order:
 *   1. AccountScreen — root component and data binding
 *   2. Inline SVG icons — hamburger, wallet, bell, invite, activity, teams, contest, help
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-05-24
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useWalletStore } from '../store/useWalletStore';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const HamburgerIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 6h18M3 12h18M3 18h18" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const BellIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InviteIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" fill="none" />
    <Circle cx={9} cy={7} r={4} stroke="#CE404D" strokeWidth={2} />
    <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ActivityIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const TeamsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x={2} y={3} width={20} height={14} rx={2} stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M8 21h8M12 17v4" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ContestIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={5} stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" fill="none" />
    <Path d="M12 3v2M12 11v2" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const HelpIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
    <Circle cx={12} cy={17} r={0.5} fill="#CE404D" />
  </Svg>
);

const KycIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Rect x={3} y={5} width={18} height={14} rx={2} stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M3 10h18" stroke="#CE404D" strokeWidth={2} />
    <Circle cx={7} cy={7.5} r={1} fill="#CE404D" />
  </Svg>
);

const PersonIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={7} r={4} stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M5 21v-2a7 7 0 0114 0v2" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const HistoryIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M12 6v6l4 2" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PerformanceIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M18 20V10M12 20V4M6 20v-6" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const SettingsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={3} stroke="#CE404D" strokeWidth={2} fill="none" />
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#CE404D" strokeWidth={2} fill="none" />
  </Svg>
);

const PrivacyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#CE404D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// ─── Hydration Helper ────────────────────────────────────────────────────────

const hydrateStores = async (userId: number | null) => {
  if (!userId) return;
  await Promise.all([
    useUserStore.getState().hydrate(userId),
    useWalletStore.getState().hydrate(userId),
  ]);
};

// ─── AccountScreen ───────────────────────────────────────────────────────────

export const AccountScreen = ({ navigation, drawerOpen }: any) => {
  const userId = useAuthStore(s => s.userId);
  const email = useAuthStore(s => s.email);
  const user = useUserStore();
  const wallet = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId && user.isEmpty() && wallet.isEmpty()) {
      hydrateStores(userId);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await hydrateStores(userId);
    setRefreshing(false);
  }, [userId]);

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email?.slice(0, 2).toUpperCase() ?? '11';

  const kycBadge =
    user.kycStatus === 'verified' ? 'Verified' :
    user.kycStatus === 'pending' ? 'Pending' : null;

  // Quick action config
  const quickActions = [
    { icon: <InviteIcon />, label: 'Invite & Earn', screen: 'Referrals' },
    { icon: <ActivityIcon />, label: 'My Activity', screen: 'Leaderboard' },
    { icon: <TeamsIcon />, label: 'My Teams', screen: 'MyTeamsList' },
    { icon: <ContestIcon />, label: 'Join Private Contest', screen: 'Clubs' },
    { icon: <HelpIcon />, label: 'Help & Support', screen: 'HelpSupport' },
  ];

  // Menu list config
  const menuRows = [
    { icon: <KycIcon />, label: 'KYC Verification', sub: 'Verify your identity', badge: kycBadge, screen: 'KYCVerification' },
    { icon: <PersonIcon />, label: 'Personal Information', sub: 'Manage your personal details', screen: 'Info' },
    { icon: <HistoryIcon />, label: 'Transaction History', sub: 'View your transactions', screen: 'TransactionDetails' },
    { icon: <PerformanceIcon />, label: 'My Performance', sub: 'Check your stats and analytics', screen: 'Leaderboard' },
    { icon: <SettingsIcon />, label: 'Settings', sub: 'Manage app settings', screen: 'Settings' },
    { icon: <PrivacyIcon />, label: 'Privacy & Security', sub: 'Manage privacy and security', screen: 'Settings' },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#CE404D"
            colors={['#CE404D']}
          />
        }
      >
        {/* ── Section 1: Top Navigation Bar ── */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.menuBtn} onPress={drawerOpen} activeOpacity={0.7}>
            <HamburgerIcon />
          </TouchableOpacity>

          <View style={styles.navCenter}>
            <Text style={styles.navLogo}>11</Text>
            <Text style={styles.navLogoGold}>DREAMER</Text>
          </View>

          <View style={styles.navRight}>
            <View style={styles.walletPill}>
              <Text style={styles.walletEmoji}>💰</Text>
              <Text style={styles.walletAmt}>
                ₹{(wallet.balance ?? 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation?.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <BellIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section 2: Profile Header ── */}
        <View style={styles.profileHeader}>
          {/* Red gradient overlay */}
          <View style={styles.profileGradient} />

          <View style={styles.profileContent}>
            {/* Avatar */}
            <View style={styles.avatarCircle}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name || email || 'Guest User'}</Text>
                {user.verified && (
                  <View style={styles.verifiedShield}>
                    <Svg width={14} height={14} viewBox="0 0 24 24">
                      <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth={1.5} strokeLinejoin="round" />
                    </Svg>
                  </View>
                )}
              </View>
              <Text style={styles.userSub}>
                {user.location || 'India'}
                {user.joinDate ? `  •  Joined ${user.joinDate}` : ''}
              </Text>
            </View>

            {/* Total Matches Badge */}
            <View style={styles.matchesBadge}>
              <Text style={styles.matchesBadgeNum}>{user.totalMatches ?? 0}</Text>
              <Text style={styles.matchesBadgeLabel}>Total Matches</Text>
            </View>
          </View>
        </View>

        {/* ── Section 3: Stats Row ── */}
        <View style={styles.statsRow}>
          {/* Total Wallet */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValueGold}>
              ₹{(wallet.balance ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Total Wallet</Text>
          </View>

          {/* Contests Won */}
          <View style={styles.statDivider} />

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValueWhite}>{user.contestsWon ?? 0}</Text>
            <Text style={styles.statLabel}>Contests Won</Text>
          </View>

          {/* Total Winnings */}
          <View style={styles.statDivider} />

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎉</Text>
            <Text style={styles.statValueGreen}>
              ₹{(wallet.winnings ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Total Winnings</Text>
          </View>
        </View>

        {/* ── Section 4: Cashback Card ── */}
        <View style={styles.cashbackCard}>
          <View style={styles.cashbackHeader}>
            <Text style={styles.cashbackLabel}>Unutilised Cashback</Text>
          </View>
          <Text style={styles.cashbackValue}>
            ₹{(wallet.cashback ?? 0).toLocaleString('en-IN')}
          </Text>
          <View style={styles.cashbackActions}>
            <TouchableOpacity
              style={styles.addCashBtn}
              onPress={() => navigation?.navigate('Wallet')}
              activeOpacity={0.8}
            >
              <Text style={styles.addCashBtnTxt}>ADD CASH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => navigation?.navigate('WithdrawalRequest')}
              activeOpacity={0.8}
            >
              <Text style={styles.withdrawBtnTxt}>WITHDRAW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section 5: Quick Actions ── */}
        <View style={styles.quickActionsWrap}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickActionItem}
                onPress={() => navigation?.navigate(action.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionIconCircle}>
                  {action.icon}
                </View>
                <Text style={styles.quickActionLabel} numberOfLines={1}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Section 6: Menu List ── */}
        <View style={styles.menuListWrap}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>
            {menuRows.map((row, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.menuRow, i === menuRows.length - 1 && styles.menuRowLast]}
                onPress={() => navigation?.navigate(row.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBox}>
                  {row.icon}
                </View>
                <View style={styles.menuTextContent}>
                  <Text style={styles.menuLabel}>{row.label}</Text>
                  <Text style={styles.menuSub}>{row.sub}</Text>
                </View>
                {row.badge ? (
                  <View
                    style={[
                      styles.menuBadge,
                      row.badge === 'Verified' ? styles.menuBadgeVerified : styles.menuBadgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.menuBadgeTxt,
                        row.badge === 'Pending' && styles.menuBadgeTxtPending,
                      ]}
                    >
                      {row.badge}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.menuChevron}>›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scroll: { flex: 1 },

  // Section 1: Nav Bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  navLogo: { color: '#fff', fontSize: 18, fontWeight: 900 },
  navLogoGold: { color: '#ECBD15', fontSize: 18, fontWeight: 900 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  walletEmoji: { fontSize: 12 },
  walletAmt: { color: '#ECBD15', fontSize: 12, fontWeight: 800 },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Section 2: Profile Header
  profileHeader: {
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(127,29,29,0.3)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 16,
    position: 'relative',
    zIndex: 1,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220,38,38,0.8)',
    borderWidth: 4,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInner: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 900 },
  userInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { color: '#fff', fontSize: 18, fontWeight: 800 },
  verifiedShield: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  userSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  matchesBadge: {
    backgroundColor: '#CE404D',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  matchesBadgeNum: { color: '#fff', fontSize: 22, fontWeight: 900 },
  matchesBadgeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 },

  // Section 3: Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#14141f',
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statValueGold: { color: '#ECBD15', fontSize: 16, fontWeight: 900 },
  statValueWhite: { color: '#fff', fontSize: 16, fontWeight: 900 },
  statValueGreen: { color: '#22C55E', fontSize: 16, fontWeight: 900 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, textAlign: 'center' },

  // Section 4: Cashback Card
  cashbackCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginHorizontal: 14,
    marginTop: 12,
    padding: 16,
  },
  cashbackHeader: { marginBottom: 4 },
  cashbackLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 },
  cashbackValue: { color: '#22C55E', fontSize: 28, fontWeight: 900, marginBottom: 12 },
  cashbackActions: { flexDirection: 'row', gap: 10 },
  addCashBtn: {
    flex: 1,
    backgroundColor: '#CE404D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addCashBtnTxt: { color: '#fff', fontSize: 13, fontWeight: 800 },
  withdrawBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  withdrawBtnTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700 },

  // Section 5: Quick Actions
  quickActionsWrap: { marginHorizontal: 14, marginTop: 20 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: { alignItems: 'center', gap: 6, flex: 1 },
  quickActionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },

  // Section 6: Menu List
  menuListWrap: { marginHorizontal: 14, marginTop: 20 },
  menuList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 12,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuTextContent: { flex: 1 },
  menuLabel: { color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 2 },
  menuSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  menuBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  menuBadgeVerified: { backgroundColor: '#2e7d32' },
  menuBadgePending: { backgroundColor: 'rgba(255,152,0,0.2)' },
  menuBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: 700 },
  menuBadgeTxtPending: { color: '#FF9800' },
  menuChevron: { color: 'rgba(255,255,255,0.2)', fontSize: 20, fontWeight: 300 },
});
