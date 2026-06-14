/**
 * File:        mobile/src/app/screens/TermsPrivacyScreen.tsx
 * Module:      Legal · Terms of Service & Privacy Policy Screen
 * Purpose:     Display Terms and Privacy Policy with tabbed navigation and scrollable content
 *
 * Exports:
 *   - TermsPrivacyScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet
 *   - react-native-svg                — Svg, Path
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
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const DocIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const LockIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M5 11h14v10H5zM8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Content ────────────────────────────────────────────────────────────────

const TERMS_SECTIONS = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using 11DREAMER ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you must not use the Platform. The Platform is operated by 11DREAMER Technologies Pvt Ltd, registered in Mumbai, India.' },
  { title: '2. Eligibility', body: 'You must be at least 18 years old to use this Platform. Users from Assam, Odisha, Telangana, Andhra Pradesh, Tamil Nadu, and Kerala (or any state where fantasy sports are restricted) are not eligible to participate in paid contests. By using this Platform, you confirm that you are eligible under your local laws.' },
  { title: '3. Account Registration', body: 'You must provide accurate and complete information during registration. You are responsible for maintaining the security of your account and password. 11DREAMER will not be liable for any unauthorized access to your account.' },
  { title: '4. Game Rules & Fair Play', body: 'Each contest requires you to select 11 players within a 100-credit limit. Captain earns 2x points, Vice-Captain earns 1.5x points. Use of multiple accounts, automated scripts, or any form of cheating is strictly prohibited and will result in immediate account suspension.' },
  { title: '5. Deposits & Withdrawals', body: 'All deposits are processed through secure payment gateways. Minimum deposit amount is ₹10, minimum withdrawal is ₹100. KYC verification is required for all withdrawals. Withdrawal requests are processed within 24-48 hours.' },
  { title: '6. Contest Cancellation & Refunds', body: 'If a match is abandoned, cancelled, or curtailed, contest entry fees will be fully refunded to your wallet. If 11DREAMER cancels a contest for any reason, the entry fee will be refunded within 7 business days.' },
  { title: '7. Bonus Terms', body: 'All bonuses are subject to wagering requirements as specified at the time of issuance. Bonuses cannot be withdrawn until wagering requirements are met. 11DREAMER reserves the right to modify or cancel bonus offers at any time.' },
  { title: '8. Limitation of Liability', body: '11DREAMER is not liable for any losses arising from match results, technical issues, network failures, or any events beyond our reasonable control. Maximum liability is limited to the amount held in your wallet at the time of the incident.' },
  { title: '9. Modifications', body: '11DREAMER reserves the right to modify these Terms at any time. Continued use of the Platform after such modifications constitutes acceptance of the new Terms. Users will be notified of material changes via email or in-app notification.' },
  { title: '10. Governing Law', body: 'These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.' },
];

const PRIVACY_SECTIONS = [
  { title: '1. Information We Collect', body: 'We collect: (a) account information (name, email, phone, DOB); (b) KYC documents (PAN, Aadhaar) for verification; (c) transaction history; (d) device and usage information; (e) location data with your consent.' },
  { title: '2. How We Use Your Information', body: 'Your information is used to: (a) verify your identity and prevent fraud; (b) process deposits and withdrawals; (c) improve our services; (d) send important notifications; (e) comply with legal obligations.' },
  { title: '3. Data Sharing', body: 'We do not sell your personal data. We may share data with: (a) payment processors; (b) KYC verification partners; (c) regulatory authorities when required by law; (d) analytics and customer support vendors under strict confidentiality.' },
  { title: '4. Data Security', body: 'We use 256-bit SSL encryption, secure servers, and industry best practices to protect your data. All financial transactions are PCI-DSS compliant. Access to your data is restricted to authorized personnel only.' },
  { title: '5. Data Retention', body: 'We retain your data for as long as your account is active or as needed to provide services. KYC documents are retained for 5 years after account closure as required by law. You can request data deletion by contacting our support team.' },
  { title: '6. Your Rights', body: 'You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion; (d) opt-out of marketing communications; (e) withdraw consent at any time.' },
  { title: '7. Cookies & Tracking', body: 'We use cookies and similar technologies to remember your preferences, keep you logged in, and analyze usage patterns. You can manage cookie preferences in your browser settings.' },
  { title: '8. Children\'s Privacy', body: '11DREAMER is not intended for users under 18. We do not knowingly collect data from minors. If we discover that we have collected data from a minor, we will delete it immediately.' },
  { title: '9. Updates to Privacy Policy', body: 'We may update this Privacy Policy periodically. Material changes will be communicated via email and in-app notification. Continued use after changes indicates acceptance.' },
  { title: '10. Contact Us', body: 'For privacy-related queries, contact our Data Protection Officer at privacy@11dreamer.app. We respond to all valid requests within 30 days.' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const TermsPrivacyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  const sections = activeTab === 'terms' ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Legal</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('terms')}
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
        >
          <DocIcon color={activeTab === 'terms' ? '#ECBD15' : '#8a8a9a'} />
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('privacy')}
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
        >
          <LockIcon color={activeTab === 'privacy' ? '#3F8FFF' : '#8a8a9a'} />
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Last updated: 01 June 2026 · Version 4.2
          </Text>
          <View style={styles.headerStatsRow}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>10</Text>
              <Text style={styles.headerStatLabel}>Sections</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>~5 min</Text>
              <Text style={styles.headerStatLabel}>Read time</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>Plain</Text>
              <Text style={styles.headerStatLabel}>English</Text>
            </View>
          </View>
        </View>

        {/* Key Points */}
        <View style={styles.keyPointsCard}>
          <Text style={styles.keyPointsTitle}>
            {activeTab === 'terms' ? 'Key Points' : 'Privacy Highlights'}
          </Text>
          {(activeTab === 'terms' ? [
            'Play responsibly and only with money you can afford',
            'KYC verification is required for withdrawals',
            'Multi-accounting will lead to permanent ban',
            'Match cancellations will result in full refund',
            '18+ only, restricted states not eligible',
          ] : [
            'We never sell your personal data',
            '256-bit SSL encryption on all data',
            'KYC data retained for 5 years (legal requirement)',
            'You can request data deletion anytime',
            'PCI-DSS compliant payment processing',
          ]).map((p, i) => (
            <View key={i} style={styles.keyPointRow}>
              <CheckIcon />
              <Text style={styles.keyPointText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        {sections.map((s, i) => (
          <View key={i} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Need clarification?</Text>
          <Text style={styles.footerText}>
            Contact our legal team at legal@11dreamer.app or visit our Help Center.
          </Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Text style={styles.helpBtnText}>Visit Help Center</Text>
          </TouchableOpacity>
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

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: { backgroundColor: 'rgba(236,189,21,0.12)', borderColor: 'rgba(236,189,21,0.4)' },
  tabText: { color: '#8a8a9a', fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: '#ECBD15' },

  headerCard: {
    marginHorizontal: 16, padding: 18, borderRadius: 16,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerSubtitle: { color: '#8a8a9a', fontSize: 11, marginTop: 4 },
  headerStatsRow: { flexDirection: 'row', marginTop: 14, alignSelf: 'stretch' },
  headerStat: { flex: 1, alignItems: 'center' },
  headerStatValue: { color: '#ECBD15', fontSize: 14, fontWeight: '900' },
  headerStatLabel: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },
  headerStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  keyPointsCard: {
    marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(39,194,138,0.06)', borderWidth: 1, borderColor: 'rgba(39,194,138,0.15)',
  },
  keyPointsTitle: { color: '#27c28a', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  keyPointRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  keyPointText: { color: '#c2c2d0', fontSize: 12, flex: 1 },

  sectionCard: {
    marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 12,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  sectionTitle: { color: '#ECBD15', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  sectionBody: { color: '#c2c2d0', fontSize: 12, lineHeight: 20 },

  footer: {
    marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(63,143,255,0.06)', borderWidth: 1, borderColor: 'rgba(63,143,255,0.15)',
  },
  footerTitle: { color: '#3F8FFF', fontSize: 13, fontWeight: '800' },
  footerText: { color: '#8a8a9a', fontSize: 11, marginTop: 4, textAlign: 'center' },
  helpBtn: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#3F8FFF',
  },
  helpBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});

export default TermsPrivacyScreen;
