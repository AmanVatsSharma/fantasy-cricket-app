/**
 * File:        mobile/src/app/screens/WalletScreen.tsx
 * Module:      Mobile · Wallet
 * Purpose:     Dedicated wallet screen matching design image 07
 *
 * Sections (top to bottom):
 *   - Top bar: hamburger, "Wallet" title, wallet pill, bell
 *   - Total Balance card (red gradient) with ADD CASH
 *   - Bonus Balance (Unutilised) row + Withdrawal row
 *   - Quick Actions row: Add Cash / Withdraw / Transaction History / Offers & Rewards
 *   - Cash Bonus banner (green)
 *   - Invite Friends & Earn banner
 *   - Recent Transactions list
 *   - Help & Support card
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Svg, Path, Circle, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useWalletStore } from '../store/useWalletStore';
import { colors } from '../theme/colors';

/* ---------- Sample data (replace with real API hooks) ---------- */
const RECENT_TXN = [
  {
    id: '1',
    type: 'Added Cash',
    method: 'via UPI',
    amount: '+₹500.00',
    time: '25 May 2026, 04:45 PM',
    positive: true,
    icon: 'plus',
  },
  {
    id: '2',
    type: 'Contest Joining',
    method: 'Mega Contest (CSE vs GT)',
    amount: '-₹40.00',
    time: '25 May 2026, 06:15 PM',
    positive: false,
    icon: 'trophy',
  },
  {
    id: '3',
    type: 'Winnings Received',
    method: 'Mega Contest (CSE vs GT)',
    amount: '+₹75.00',
    time: '25 May 2026, 06:25 PM',
    positive: true,
    icon: 'gift',
  },
  {
    id: '4',
    type: 'Bonus Added',
    method: 'Welcome Bonus',
    amount: '+₹50.00',
    time: '21 May 2026, 02:20 PM',
    positive: true,
    icon: 'star',
  },
];

/* ---------- SVG Icons ---------- */
const HamburgerIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 6h18M3 12h18M3 18h18" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const BellIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.18)" />
    <Path
      d="M12 8v8M8 12h8"
      stroke="#fff"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const TrophyIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M7 4h10v5a5 5 0 11-10 0V4z"
      stroke="#ECBD15"
      strokeWidth={2}
      fill="none"
      strokeLinejoin="round"
    />
    <Path d="M7 6H4a3 3 0 003 3M17 6h3a3 3 0 01-3 3" stroke="#ECBD15" strokeWidth={2} strokeLinecap="round" fill="none" />
    <Path d="M9 18h6v2H9zM12 14v4" stroke="#ECBD15" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const GiftIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x="3" y="8" width="18" height="4" rx="1" stroke="#ECBD15" strokeWidth={2} fill="none" />
    <Path d="M5 12v8h14v-8M12 8v12" stroke="#ECBD15" strokeWidth={2} strokeLinecap="round" />
    <Path d="M8 8a2 2 0 010-4 2 2 0 012 2 2 2 0 012-2 2 2 0 010 4" stroke="#ECBD15" strokeWidth={2} fill="none" />
  </Svg>
);

const StarIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M12 2l2.39 6.96H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.55L2 8.96h7.61L12 2z"
      stroke="#ECBD15"
      strokeWidth={2}
      fill="none"
      strokeLinejoin="round"
    />
  </Svg>
);

const SendIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const AddCashIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x="3" y="6" width="18" height="13" rx="2" stroke={color} strokeWidth={2} fill="none" />
    <Path d="M3 10h18" stroke={color} strokeWidth={2} />
    <Path d="M7 15h3" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const WithdrawIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M12 3v12M7 10l5 5 5-5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M5 21h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const HistoryIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke={color} strokeWidth={2} fill="none" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const OffersIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRight = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const HelpIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} fill="none" />
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
    <Circle cx="12" cy="17" r="0.6" fill={color} />
  </Svg>
);

const ContactIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth={2} fill="none" />
    <Path d="M3 10h18" stroke={color} strokeWidth={2} />
    <Path d="M8 7h.01M12 7h.01" stroke={color} strokeWidth={3} strokeLinecap="round" />
    <Rect x="7" y="12" width="10" height="4" rx="1" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

/* ---------- Wallet Background Decoration ---------- */
const WalletBgDecor = () => (
  <View style={decor.wrap} pointerEvents="none">
    <Svg
      width={220}
      height={220}
      viewBox="0 0 220 220"
      style={{ position: 'absolute', right: -30, top: 20 }}
    >
      <Defs>
        <LinearGradient id="wmBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* Faint wallet outline */}
      <Rect x="40" y="60" width="140" height="100" rx="14" fill="none" stroke="url(#wmBg)" strokeWidth="1.2" />
      <Path d="M60 95h100M60 110h70M60 125h50" stroke="url(#wmBg)" strokeWidth="1" strokeLinecap="round" />
      <Circle cx="155" cy="125" r="10" fill="url(#wmBg)" />
    </Svg>
  </View>
);

/* ---------- Transaction Icon ---------- */
const TxnIcon = ({ kind }: { kind: string }) => {
  if (kind === 'plus') return <PlusIcon />;
  if (kind === 'trophy') return <TrophyIcon />;
  if (kind === 'gift') return <GiftIcon />;
  return <StarIcon />;
};

/* ---------- Quick Action Card ---------- */
type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

const QuickAction = ({ label, icon, onPress }: QuickAction) => (
  <TouchableOpacity style={qa.card} activeOpacity={0.7} onPress={onPress}>
    <View style={qa.iconCircle}>{icon}</View>
    <Text style={qa.label} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ---------- WalletScreen ---------- */
export const WalletScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const wallet = useWalletStore();
  const userId = useAuthStore((s) => s.userId);

  useEffect(() => {
    if (userId && wallet.isEmpty()) {
      useWalletStore.getState().hydrate(userId);
    }
  }, []);

  const quickActions: QuickAction[] = [
    { label: 'Add Cash', icon: <AddCashIcon />, onPress: () => nav.navigate('AddCash' as any) },
    { label: 'Withdraw', icon: <WithdrawIcon />, onPress: () => nav.navigate('WithdrawalRequest' as any) },
    { label: 'Transaction\nHistory', icon: <HistoryIcon />, onPress: () => nav.navigate('TransactionDetails' as any) },
    { label: 'Offers &\nRewards', icon: <OffersIcon />, onPress: () => nav.navigate('Offers' as any) },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ──────── Top Bar ──────── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <HamburgerIcon />
          </TouchableOpacity>

          <Text style={styles.title}>Wallet</Text>

          <View style={styles.topRight}>
            <View style={styles.walletPill}>
              <Text style={styles.walletIcon}>💰</Text>
              <Text style={styles.walletAmt}>
                ₹{(wallet.balance ?? 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <BellIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* ──────── Total Balance Card ──────── */}
        <View style={styles.totalCard}>
          <WalletBgDecor />
          <Text style={styles.totalLabel}>Total Balance</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Text style={styles.totalValue}>
                ₹{(wallet.balance ?? 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <TouchableOpacity style={styles.addCashBtn} activeOpacity={0.85}>
              <View style={styles.addCashCircle}>
                <Text style={styles.addCashPlus}>+</Text>
              </View>
              <Text style={styles.addCashText}>ADD CASH</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ──────── Bonus + Withdraw row ──────── */}
        <View style={styles.bonusRow}>
          <View style={styles.bonusCol}>
            <Text style={styles.bonusLabel}>Unutilised Bonus</Text>
            <Text style={styles.bonusValue}>
              ₹{(wallet.cashback ?? 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.bonusDivider} />
          <View style={styles.bonusCol}>
            <Text style={styles.bonusLabel}>Winnings</Text>
            <Text style={styles.bonusValue}>
              ₹{(wallet.winnings ?? 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* ──────── Quick Actions ──────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.qaRow}>
            {quickActions.map((a) => (
              <QuickAction
                key={a.label}
                label={a.label.replace('\n', ' ')}
                icon={a.icon}
                onPress={a.onPress}
              />
            ))}
          </View>
        </View>

        {/* ──────── Cash Bonus Banner ──────── */}
        <TouchableOpacity style={styles.cashBonusBanner} activeOpacity={0.85}>
          <View style={styles.cashBonusLeft}>
            <View style={styles.cashBonusIconCircle}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path
                  d="M12 2v6M12 16v6M2 12h6M16 12h6"
                  stroke="#3DD870"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
                <Circle cx="12" cy="12" r="3" stroke="#3DD870" strokeWidth={2} fill="none" />
              </Svg>
            </View>
            <View>
              <Text style={styles.cashBonusTitle}>Cash Bonus</Text>
              <Text style={styles.cashBonusSub}>Use your bonus to join contests</Text>
            </View>
          </View>
          <View style={styles.cashBonusRight}>
            <Text style={styles.cashBonusAmt}>₹50.00</Text>
            <ChevronRight color="rgba(255,255,255,0.6)" />
          </View>
        </TouchableOpacity>

        {/* ──────── Invite Friends Banner ──────── */}
        <TouchableOpacity style={styles.inviteBanner} activeOpacity={0.85}>
          <View style={styles.inviteGlow} />
          <View style={styles.inviteContent}>
            <View style={styles.inviteLogoBox}>
              <Text style={styles.inviteLogoEleven}>11</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inviteTitle}>Invite Friends & Earn</Text>
              <Text style={styles.inviteSub}>
                Earn ₹100 on your friend joins & plays
              </Text>
            </View>
          </View>
          <View style={styles.inviteBtn}>
            <SendIcon />
            <Text style={styles.inviteBtnText}>INVITE NOW</Text>
          </View>
          <ChevronRight color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {/* ──────── Recent Transactions ──────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.txnList}>
            {RECENT_TXN.map((t, i) => (
              <View
                key={t.id}
                style={[
                  styles.txnRow,
                  i === RECENT_TXN.length - 1 && styles.txnRowLast,
                ]}
              >
                <View style={styles.txnLeft}>
                  <View style={styles.txnIconCircle}>
                    <TxnIcon kind={t.icon} />
                  </View>
                  <View>
                    <Text style={styles.txnType}>{t.type}</Text>
                    <Text style={styles.txnMethod}>{t.method}</Text>
                    <Text style={styles.txnTime}>{t.time}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.txnAmount,
                    t.positive ? styles.txnAmountPos : styles.txnAmountNeg,
                  ]}
                >
                  {t.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ──────── Help & Support ──────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <View style={styles.helpCard}>
            <TouchableOpacity
              style={[styles.helpRow, styles.helpRowDivider]}
              activeOpacity={0.7}
            >
              <View style={styles.helpIconBox}>
                <HelpIcon color={colors.text.muted} />
              </View>
              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>View Help Center</Text>
                <Text style={styles.helpSub}>Get help with wallet-related queries</Text>
              </View>
              <ChevronRight color={colors.text.subtle} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpRow} activeOpacity={0.7}>
              <View style={styles.helpIconBox}>
                <ContactIcon color={colors.text.muted} />
              </View>
              <View style={styles.helpText}>
                <Text style={styles.helpTitle}>Contact Support</Text>
                <Text style={styles.helpSub}>We are here to help you 24×7</Text>
              </View>
              <ChevronRight color={colors.text.subtle} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const decor = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});

/* ---------- Quick Actions styles ---------- */
const qa = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  label: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
});

/* ---------- Main styles ---------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface.bg,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 12,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  walletIcon: { fontSize: 12, marginRight: 4 },
  walletAmt: { color: colors.brand.gold, fontSize: 12, fontWeight: '800' },

  /* Total Balance card */
  totalCard: {
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 16,
    padding: 18,
    paddingTop: 16,
    backgroundColor: colors.brand.red,
    overflow: 'hidden',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  totalRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLeft: { flex: 1 },
  totalValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  addCashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  addCashCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addCashPlus: {
    color: colors.brand.red,
    fontSize: 16,
    fontWeight: '900',
    marginTop: -2,
  },
  addCashText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  /* Bonus row */
  bonusRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  bonusCol: { flex: 1, alignItems: 'center' },
  bonusDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12,
  },
  bonusLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  bonusValue: {
    color: colors.brand.gold,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },

  /* Section */
  section: { marginTop: 18 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 14,
    marginBottom: 8,
  },
  viewAll: {
    color: colors.brand.red,
    fontSize: 12,
    fontWeight: '800',
  },

  /* Quick actions row */
  qaRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingVertical: 4,
  },

  /* Cash Bonus banner */
  cashBonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginTop: 18,
    backgroundColor: 'rgba(61, 216, 112, 0.12)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(61, 216, 112, 0.3)',
  },
  cashBonusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cashBonusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(61, 216, 112, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cashBonusTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  cashBonusSub: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  cashBonusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashBonusAmt: {
    color: colors.brand.green,
    fontSize: 14,
    fontWeight: '900',
  },

  /* Invite Friends banner */
  inviteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: colors.brand.red,
    borderRadius: 14,
    padding: 14,
    overflow: 'hidden',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  inviteGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inviteLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inviteLogoEleven: {
    color: colors.brand.red,
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  inviteTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  inviteSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  inviteBtnText: {
    color: colors.brand.red,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* Transaction list */
  txnList: {
    marginHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  txnRowLast: { borderBottomWidth: 0 },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txnIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  txnType: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  txnMethod: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  txnTime: {
    color: colors.text.subtle,
    fontSize: 10,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  txnAmountPos: { color: colors.brand.green },
  txnAmountNeg: { color: colors.feedback.error },

  /* Help & Support */
  helpCard: {
    marginHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  helpRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  helpIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpText: { flex: 1 },
  helpTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  helpSub: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
});

export default WalletScreen;
