/**
 * File:        mobile/src/app/screens/OffersScreen.tsx
 * Module:      Account · Offers & Promotions Screen
 * Purpose:     Promotional offers & coupons — featured banner, categories filter, offer cards with code reveal
 *
 * Exports:
 *   - OffersScreen
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

const TagIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M2 12l10-10h10v10L12 22 2 12z" stroke={color} strokeWidth={1.5} fill="none" />
    <Circle cx={15} cy={9} r={1.5} fill={color} />
  </Svg>
);

const CopyIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M9 9h11v11H9zM4 4h11v3" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowRight = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M5 12h14M13 5l7 7-7 7" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={12} height={12} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M12 6v6l4 3" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const OFFERS = [
  {
    id: 1,
    type: 'first-deposit',
    title: '100% First Deposit Bonus',
    desc: 'Get 100% bonus up to ₹5,000 on your first deposit',
    code: 'WELCOME100',
    expiry: '2026-07-15',
    bg: '#1d2441',
    accent: '#3F8FFF',
    badge: 'NEW USER',
  },
  {
    id: 2,
    type: 'deposit',
    title: '50% Deposit Bonus',
    desc: 'Get 50% bonus up to ₹2,000 · Min deposit ₹100',
    code: 'DEPOSIT50',
    expiry: '2026-06-30',
    bg: '#2d5016',
    accent: '#4caf50',
    badge: 'POPULAR',
  },
  {
    id: 3,
    type: 'cashback',
    title: '10% Contest Cashback',
    desc: 'Get 10% cashback on your losing contests',
    code: 'CASHBACK10',
    expiry: '2026-07-01',
    bg: '#7E0A13',
    accent: '#CE404D',
    badge: 'LIMITED',
  },
  {
    id: 4,
    type: 'free',
    title: 'Free Contest Entry',
    desc: 'Free entry to daily mega contest · Worth ₹50',
    code: 'FREEME50',
    expiry: '2026-06-20',
    bg: '#6D1B7A',
    accent: '#9C5BD8',
    badge: 'FREE',
  },
  {
    id: 5,
    type: 'referral',
    title: 'Refer & Earn ₹500',
    desc: 'Refer 5 friends and earn ₹500 instant bonus',
    code: 'REFER500',
    expiry: '2026-08-31',
    bg: '#1A237E',
    accent: '#ECBD15',
    badge: 'BONUS',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const OffersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'cashback' | 'free'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = OFFERS.filter(o => {
    if (activeTab === 'all') return true;
    return o.type === activeTab;
  });

  const handleCopy = (id: number, code: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Offers & Promos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBannerGlow} />
          <View style={styles.heroBannerIcon}>
            <Path d="M2 12l10-10h10v10L12 22 2 12z" stroke="#ECBD15" strokeWidth={1.5} fill="rgba(236,189,21,0.2)" />
          </View>
          <Text style={styles.heroBannerTitle}>5 EXCLUSIVE OFFERS</Text>
          <Text style={styles.heroBannerSubtitle}>Up to ₹10,000 in bonuses available</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {([
            { key: 'all', label: 'All Offers', count: OFFERS.length },
            { key: 'deposit', label: 'Deposit', count: 2 },
            { key: 'cashback', label: 'Cashback', count: 1 },
            { key: 'free', label: 'Free', count: 1 },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
              <Text style={[styles.filterTabCount, activeTab === tab.key && styles.filterTabCountActive]}>
                {tab.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offer Cards */}
        {filtered.map(offer => (
          <View key={offer.id} style={[styles.offerCard, { borderColor: offer.accent + '44' }]}>
            <View style={styles.offerLeft}>
              <View style={[styles.offerIconWrap, { backgroundColor: offer.bg }]}>
                <TagIcon color={offer.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.offerBadgeRow}>
                  <View style={[styles.offerBadge, { backgroundColor: offer.accent + '22' }]}>
                    <Text style={[styles.offerBadgeText, { color: offer.accent }]}>{offer.badge}</Text>
                  </View>
                </View>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDesc}>{offer.desc}</Text>
                <View style={styles.offerExpiryRow}>
                  <ClockIcon />
                  <Text style={styles.offerExpiry}>Expires {offer.expiry}</Text>
                </View>
              </View>
            </View>

            <View style={styles.offerDivider} />

            <View style={styles.offerRight}>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>CODE</Text>
                <Text style={styles.codeText}>{offer.code}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopy(offer.id, offer.code)}
                style={[styles.copyBtn, copiedId === offer.id && styles.copyBtnDone]}
              >
                {copiedId === offer.id ? (
                  <>
                    <CheckIcon color="#fff" />
                    <Text style={styles.copyBtnText}>Copied</Text>
                  </>
                ) : (
                  <>
                    <CopyIcon />
                    <Text style={styles.copyBtnText}>Copy</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>Apply</Text>
                <ArrowRight />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* T&Cs */}
        <View style={styles.tcCard}>
          <Text style={styles.tcTitle}>Terms & Conditions</Text>
          <Text style={styles.tcText}>• Bonuses are subject to wagering requirements</Text>
          <Text style={styles.tcText}>• Offer valid only once per user</Text>
          <Text style={styles.tcText}>• 11DREAMER reserves the right to modify or cancel offers</Text>
          <Text style={styles.tcText}>• Read full T&Cs at 11dreamer.app/terms</Text>
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

  heroBanner: {
    alignItems: 'center', marginHorizontal: 16, padding: 20, borderRadius: 18,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(236,189,21,0.25)',
    overflow: 'hidden',
  },
  heroBannerGlow: {
    position: 'absolute', top: -30, width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(236,189,21,0.15)',
  },
  heroBannerIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(236,189,21,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  heroBannerTitle: { color: '#ECBD15', fontSize: 16, fontWeight: '900' },
  heroBannerSubtitle: { color: '#8a8a9a', fontSize: 12, marginTop: 4 },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  filterTab: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    backgroundColor: '#10101c', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterTabActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  filterTabText: { color: '#8a8a9a', fontSize: 11, fontWeight: '700' },
  filterTabTextActive: { color: '#fff' },
  filterTabCount: { color: '#5a5a6a', fontSize: 10, marginTop: 2 },
  filterTabCountActive: { color: 'rgba(255,255,255,0.7)' },

  offerCard: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#10101c', borderRadius: 14, borderWidth: 1,
    overflow: 'hidden',
  },
  offerLeft: { flex: 1, flexDirection: 'row', gap: 12, padding: 12 },
  offerIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  offerBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  offerBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  offerBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  offerTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  offerDesc: { color: '#8a8a9a', fontSize: 11, marginTop: 2, lineHeight: 16 },
  offerExpiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  offerExpiry: { color: '#8a8a9a', fontSize: 10 },

  offerDivider: {
    width: 1, backgroundColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 1,
  },

  offerRight: {
    width: 110, padding: 10, alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  codeBox: { alignItems: 'center' },
  codeLabel: { color: '#5a5a6a', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  codeText: { color: '#ECBD15', fontSize: 14, fontWeight: '900', marginTop: 4, letterSpacing: 1 },

  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(236,189,21,0.15)',
  },
  copyBtnDone: { backgroundColor: '#27c28a' },
  copyBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.brandPrimary,
  },
  applyBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  tcCard: {
    marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  tcTitle: { color: '#8a8a9a', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  tcText: { color: '#5a5a6a', fontSize: 11, lineHeight: 20 },
});

export default OffersScreen;
