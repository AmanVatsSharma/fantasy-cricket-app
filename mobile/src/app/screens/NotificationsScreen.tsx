/**
 * File:        mobile/src/app/screens/NotificationsScreen.tsx
 * Module:      Account · Notifications Screen
 * Purpose:     Notification center — categorized tabs, grouped-by-day notifications, action CTAs
 *
 * Exports:
 *   - NotificationsScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet
 *   - react-native-svg                — Svg, Path, Circle
 *   - @react-navigation/native         — useNavigation
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const TrophyIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M7 4h10v4a5 5 0 01-5 5 5 5 0 01-5-5V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const WalletIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CricketIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M4 20l8-8M8 16l-4 4 4-4zM14 4l6 6-2 2-6-6z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const GiftIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 9h18v4H3zM5 13v8h14v-8M12 9V5M9 5h6" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const SettingsIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 2L4 5v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V5l-8-3z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { type: 'win', icon: <TrophyIcon />, color: '#ECBD15', title: 'You Won ₹2,500!', desc: 'You finished 2nd in IND vs AUS Mega Contest', time: '2h ago', read: false, cta: 'View' },
  { type: 'match', icon: <CricketIcon />, color: '#3F8FFF', title: 'IND vs AUS Starts in 30 min', desc: 'Your team is ready. Join 12 contests now!', time: '5h ago', read: false, cta: 'Open' },
  { type: 'wallet', icon: <WalletIcon />, color: '#27c28a', title: '₹1,000 Deposited', desc: 'Your deposit was successful. New balance: ₹3,500', time: '8h ago', read: false, cta: 'Wallet' },
  { type: 'reward', icon: <GiftIcon />, color: '#9C5BD8', title: 'Referral Bonus +₹50', desc: 'Vikram S. joined using your code', time: '1d ago', read: true, cta: 'Invite More' },
  { type: 'match', icon: <CricketIcon />, color: '#3F8FFF', title: 'CSK vs MI Result Available', desc: 'Check your contest performance now', time: '1d ago', read: true, cta: 'View' },
  { type: 'win', icon: <TrophyIcon />, color: '#ECBD15', title: 'You Won ₹500!', desc: 'Congratulations! ₹500 added to your wallet', time: '2d ago', read: true, cta: 'View' },
  { type: 'reward', icon: <GiftIcon />, color: '#9C5BD8', title: 'Daily Login Streak: 7 days', desc: 'Keep logging in to earn more rewards', time: '3d ago', read: true, cta: 'Claim' },
  { type: 'wallet', icon: <WalletIcon />, color: '#27c28a', title: 'Withdrawal Successful', desc: '₹5,000 sent to your bank account', time: '4d ago', read: true, cta: 'View' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'match' | 'wallet' | 'reward'>('all');
  const [readState, setReadState] = useState<Record<number, boolean>>(() => {
    const map: Record<number, boolean> = {};
    NOTIFICATIONS.forEach((n, i) => { map[i] = n.read; });
    return map;
  });

  const filtered = NOTIFICATIONS.filter(n => {
    const isRead = readState[NOTIFICATIONS.indexOf(n)];
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !isRead;
    return n.type === activeTab;
  });

  const unreadCount = NOTIFICATIONS.filter((_, i) => !readState[i]).length;

  const handleNotifPress = (n: typeof NOTIFICATIONS[number], idx: number) => {
    // mark as read
    setReadState((prev) => ({ ...prev, [idx]: true }));
    // route based on notification type
    switch (n.type) {
      case 'match':
        navigation.navigate('ContestLobby' as never);
        break;
      case 'wallet':
        navigation.navigate('Wallet' as never);
        break;
      case 'reward':
        navigation.navigate('RewardsReferral' as never);
        break;
      default:
        // No-op
        break;
    }
  };

  const handleMarkAllRead = () => {
    setReadState((prev) => {
      const next: Record<number, boolean> = { ...prev };
      NOTIFICATIONS.forEach((_, i) => { next[i] = true; });
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Notifications</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {([
            { key: 'all', label: 'All', count: NOTIFICATIONS.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'match', label: 'Matches', count: 2 },
            { key: 'wallet', label: 'Wallet', count: 2 },
            { key: 'reward', label: 'Rewards', count: 2 },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.filterTabCount, activeTab === tab.key && styles.filterTabCountActive]}>
                <Text style={[styles.filterTabCountText, activeTab === tab.key && styles.filterTabCountTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Path d="M3 9h18v4H3zM5 13v8h14v-8M12 9V5" stroke="#5a5a6a" strokeWidth={1.5} fill="none" />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyDesc}>We'll notify you when something important happens</Text>
          </View>
        ) : (
          <>
            {unreadCount > 0 && activeTab === 'all' && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>NEW · {unreadCount} UNREAD</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Text style={styles.markAllRead}>Mark all read</Text>
                </TouchableOpacity>
              </View>
            )}

            {filtered.map((n) => {
              const idx = NOTIFICATIONS.indexOf(n);
              const isRead = readState[idx];
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.notificationRow, !isRead && styles.notificationUnread]}
                  activeOpacity={0.7}
                  onPress={() => handleNotifPress(n, idx)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: n.color + '22' }]}>
                    {n.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, !isRead && { fontWeight: '800' }]} numberOfLines={1}>
                        {n.title}
                      </Text>
                      {!isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.desc} numberOfLines={2}>{n.desc}</Text>
                    <View style={styles.bottomRow}>
                      <Text style={styles.time}>{n.time}</Text>
                      <View style={[styles.cta, { borderColor: n.color + '66' }]}>
                        <Text style={[styles.ctaText, { color: n.color }]}>{n.cta}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  settingsBtn: { padding: 8 },
  scrollContent: { paddingBottom: 20 },

  filterRow: { paddingVertical: 8 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterTabActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  filterTabText: { color: '#8a8a9a', fontSize: 12, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  filterTabCount: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, minWidth: 22, alignItems: 'center',
  },
  filterTabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterTabCountText: { color: '#8a8a9a', fontSize: 10, fontWeight: '700' },
  filterTabCountTextActive: { color: '#fff' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },
  sectionHeaderText: { color: '#8a8a9a', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  markAllRead: { color: colors.brandPrimary, fontSize: 12, fontWeight: '700' },

  notificationRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, marginHorizontal: 16, marginBottom: 8,
    backgroundColor: '#10101c', borderRadius: 12,
  },
  notificationUnread: { backgroundColor: 'rgba(206,64,77,0.05)', borderWidth: 1, borderColor: 'rgba(206,64,77,0.15)' },
  iconCircle: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary, marginLeft: 8 },
  desc: { color: '#8a8a9a', fontSize: 12, marginTop: 4, lineHeight: 18 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  time: { color: '#5a5a6a', fontSize: 10 },
  cta: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    borderWidth: 1,
  },
  ctaText: { fontSize: 10, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#10101c', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 16 },
  emptyDesc: { color: '#8a8a9a', fontSize: 12, marginTop: 6, textAlign: 'center' },
});

export default NotificationsScreen;
