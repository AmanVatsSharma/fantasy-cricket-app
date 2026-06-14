/**
 * File:        mobile/src/app/screens/RewardsReferralScreen.tsx
 * Module:      Profile · Rewards & Referral Screen
 * Purpose:     Rewards & referral program — earnings card, invite code, referral tiers, and history
 *
 * Exports:
 *   - RewardsReferralScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet
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
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Share,
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

const GiftIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path d="M3 9h18v4H3zM5 13v8h14v-8M12 9V5M9 5h6" stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M7 5a2 2 0 100 4 2 2 0 000-4zM17 5a2 2 0 100 4 2 2 0 000-4z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const ShareIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v14" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CopyIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M9 9h11v11H9zM4 4h11v3" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const WhatsAppIcon = ({ color = '#25D366' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8 9c0 5 2 7 7 7l1-2-3-1-1 1c-1 0-2-1-2-2l1-1-1-3-2 1z" fill={color} />
  </Svg>
);

const TwitterIcon = ({ color = '#1DA1F2' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M22 4l-7 9 7 11h-4l-5-8-6 8H3l8-10L3 4h4l5 7 5-7h5z" fill={color} />
  </Svg>
);

const TelegramIcon = ({ color = '#0088cc' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M22 3L2 11l6 2 2 6 4-4 6 4 2-16z" fill={color} />
  </Svg>
);

const UserPlusIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 12a4 4 0 100-8 4 4 0 000 8zM3 22a9 9 0 0118 0M19 8v6M16 11h6" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const RupeeIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M7 5h10M7 9h10M7 13s3 0 5 2c2 2 5 2 5 2M7 5l10 14" stroke={color} strokeWidth={1.8} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const REFERRAL_TIERS = [
  { count: 1, bonus: 50, label: 'First Friend', color: '#3F8FFF' },
  { count: 5, bonus: 500, label: '5 Friends', color: '#9C5BD8' },
  { count: 10, bonus: 1500, label: '10 Friends', color: '#ECBD15' },
  { count: 25, bonus: 5000, label: '25 Friends', color: '#27c28a' },
  { count: 50, bonus: 15000, label: '50 Friends', color: '#FF6B7A' },
  { count: 100, bonus: 50000, label: '100 Friends', color: '#CE404D' },
];

const REFERRAL_HISTORY = [
  { name: 'Vikram S.', date: '12 Jun 2026', status: 'joined', bonus: 50 },
  { name: 'Arjun K.', date: '10 Jun 2026', status: 'joined', bonus: 50 },
  { name: 'Rohit M.', date: '08 Jun 2026', status: 'played', bonus: 100 },
  { name: 'Suresh R.', date: '05 Jun 2026', status: 'played', bonus: 100 },
  { name: 'Karan P.', date: '02 Jun 2026', status: 'played', bonus: 100 },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const RewardsReferralScreen: React.FC = () => {
  const navigation = useNavigation();
  const [copied, setCopied] = useState(false);
  const referralCode = 'AMAN50';
  const referralLink = `https://11dreamer.app/r/${referralCode}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (platform?: string) => {
    try {
      await Share.share({
        message: `Join me on 11DREAMER Fantasy Cricket! Use my code ${referralCode} and get ₹50 bonus on signup. ${referralLink}`,
        title: 'Join 11DREAMER',
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIconWrap}>
            <GiftIcon />
          </View>
          <Text style={styles.heroTitle}>INVITE & EARN UP TO ₹50,000</Text>
          <Text style={styles.heroSubtitle}>Share with friends, earn rewards for every signup</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>5</Text>
              <Text style={styles.heroStatLabel}>Friends Invited</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>₹350</Text>
              <Text style={styles.heroStatLabel}>Total Earned</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>3</Text>
              <Text style={styles.heroStatLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
              <CopyIcon color={copied ? '#27c28a' : '#ECBD15'} />
              <Text style={[styles.copyBtnText, copied && { color: '#27c28a' }]}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.codeLink}>{referralLink}</Text>
        </View>

        {/* Share Buttons */}
        <View style={styles.shareRow}>
          <TouchableOpacity onPress={() => handleShare('whatsapp')} style={[styles.shareBtn, { backgroundColor: 'rgba(37,211,102,0.15)' }]}>
            <WhatsAppIcon />
            <Text style={styles.shareBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare('telegram')} style={[styles.shareBtn, { backgroundColor: 'rgba(0,136,204,0.15)' }]}>
            <TelegramIcon />
            <Text style={styles.shareBtnText}>Telegram</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare('twitter')} style={[styles.shareBtn, { backgroundColor: 'rgba(29,161,242,0.15)' }]}>
            <TwitterIcon />
            <Text style={styles.shareBtnText}>Twitter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare()} style={[styles.shareBtn, { backgroundColor: 'rgba(63,143,255,0.15)' }]}>
            <ShareIcon />
            <Text style={styles.shareBtnText}>More</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.howCard}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.howStep}>
            <View style={styles.howStepNum}><Text style={styles.howStepNumText}>1</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.howStepTitle}>Share Your Code</Text>
              <Text style={styles.howStepDesc}>Send your unique referral code to friends</Text>
            </View>
            <Text style={styles.howStepBonus}>+₹50</Text>
          </View>
          <View style={styles.howStep}>
            <View style={styles.howStepNum}><Text style={styles.howStepNumText}>2</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.howStepTitle}>Friend Signs Up</Text>
              <Text style={styles.howStepDesc}>They get ₹50 bonus on signup</Text>
            </View>
            <Text style={styles.howStepBonus}>₹50</Text>
          </View>
          <View style={styles.howStep}>
            <View style={styles.howStepNum}><Text style={styles.howStepNumText}>3</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.howStepTitle}>Friend Plays Contest</Text>
              <Text style={styles.howStepDesc}>You earn ₹100 when they play their first contest</Text>
            </View>
            <Text style={styles.howStepBonus}>+₹100</Text>
          </View>
        </View>

        {/* Milestone Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestone Rewards</Text>
          <View style={styles.tiersGrid}>
            {REFERRAL_TIERS.map((tier, i) => {
              const reached = 5 >= tier.count;
              const current = 5 < (REFERRAL_TIERS[i + 1]?.count || 999);
              return (
                <View key={i} style={[styles.tierCard, reached && styles.tierCardReached, current && styles.tierCardCurrent]}>
                  <View style={[styles.tierBadge, { backgroundColor: tier.color + '22' }]}>
                    <UserPlusIcon color={tier.color} />
                  </View>
                  <Text style={styles.tierCount}>{tier.count}</Text>
                  <Text style={styles.tierLabel}>Friends</Text>
                  <View style={styles.tierBonusRow}>
                    <RupeeIcon color={tier.color} />
                    <Text style={[styles.tierBonus, { color: tier.color }]}>{tier.bonus}</Text>
                  </View>
                  {reached && (
                    <View style={styles.tierCheckWrap}>
                      <CheckIcon />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Referral History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral History</Text>
          {REFERRAL_HISTORY.map((r, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyAvatar}>
                <Text style={styles.historyAvatarText}>{r.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyName}>{r.name}</Text>
                <Text style={styles.historyDate}>{r.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyStatus, { color: r.status === 'played' ? '#27c28a' : '#ECBD15' }]}>
                  {r.status === 'played' ? '✓ Played' : 'Pending'}
                </Text>
                <Text style={styles.historyBonus}>+₹{r.bonus}</Text>
              </View>
            </View>
          ))}
        </View>

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
  scrollContent: { paddingBottom: 20 },

  heroCard: {
    alignItems: 'center', margin: 16, marginTop: 8, padding: 24,
    borderRadius: 20, backgroundColor: '#10101c',
    borderWidth: 1, borderColor: 'rgba(236,189,21,0.25)', overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -50, width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(236,189,21,0.18)',
  },
  heroIconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(236,189,21,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  heroTitle: { color: '#ECBD15', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  heroSubtitle: { color: '#8a8a9a', fontSize: 12, marginTop: 6, textAlign: 'center' },
  heroStatsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 14, marginTop: 16, alignSelf: 'stretch',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  heroStatLabel: { color: '#8a8a9a', fontSize: 10, marginTop: 4 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  codeCard: {
    marginHorizontal: 16, padding: 18, borderRadius: 14,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  codeLabel: { color: '#8a8a9a', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeText: { color: '#ECBD15', fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: 'rgba(236,189,21,0.15)',
  },
  copyBtnText: { color: '#ECBD15', fontSize: 12, fontWeight: '700' },
  codeLink: { color: '#5a5a6a', fontSize: 11, marginTop: 10, fontFamily: 'monospace' },

  shareRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 14 },
  shareBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center', gap: 6, borderRadius: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  howCard: {
    marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 14,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  howStep: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  howStepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brandPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  howStepNumText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  howStepTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  howStepDesc: { color: '#8a8a9a', fontSize: 11, marginTop: 2 },
  howStepBonus: { color: '#ECBD15', fontSize: 14, fontWeight: '900' },

  section: { marginTop: 24, paddingHorizontal: 16 },
  tiersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierCard: {
    width: '31.5%', padding: 12, borderRadius: 12,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', position: 'relative',
  },
  tierCardReached: { backgroundColor: 'rgba(39,194,138,0.08)', borderColor: 'rgba(39,194,138,0.2)' },
  tierCardCurrent: { borderColor: 'rgba(236,189,21,0.4)', borderWidth: 2 },
  tierBadge: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  tierCount: { color: '#fff', fontSize: 18, fontWeight: '900' },
  tierLabel: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },
  tierBonusRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  tierBonus: { fontSize: 12, fontWeight: '900' },
  tierCheckWrap: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#27c28a',
    alignItems: 'center', justifyContent: 'center',
  },

  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, marginBottom: 8, backgroundColor: '#10101c', borderRadius: 12,
  },
  historyAvatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(206,64,77,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyAvatarText: { color: colors.brandPrimary, fontSize: 14, fontWeight: '800' },
  historyName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  historyDate: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyStatus: { fontSize: 11, fontWeight: '700' },
  historyBonus: { color: '#ECBD15', fontSize: 13, fontWeight: '900', marginTop: 2 },
});

export default RewardsReferralScreen;
