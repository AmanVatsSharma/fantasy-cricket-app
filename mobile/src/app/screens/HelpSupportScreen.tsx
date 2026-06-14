/**
 * File:        mobile/src/app/screens/HelpSupportScreen.tsx
 * Module:      Support · Help / FAQ / Contact Screen
 * Purpose:     Self-service help — FAQ accordion, quick-help cards, and contact options
 *
 * Exports:
 *   - HelpSupportScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput
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
  TextInput,
  Linking,
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

const SearchIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l5 5" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const ChevronDown = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronUp = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M6 15l6-6 6 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M5 4h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A18 18 0 013 6a2 2 0 012-2z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const ChatIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 4h18v12H7l-4 4z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const EmailIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 6h18v12H3zM3 6l9 7 9-7" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const TicketIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 7h18v4a2 2 0 100 4v4H3v-4a2 2 0 100-4zM9 7v14" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CricketIcon = ({ color = '#FF6B7A' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M4 20l8-8M8 16l-4 4 4-4zM14 4l6 6-2 2-6-6z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const TrophyIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M7 4h10v4a5 5 0 01-5 5 5 5 0 01-5-5V4zM5 5H3v2a3 3 0 003 3M19 5h2v2a3 3 0 01-3 3M10 14h4v6h-4z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const WalletIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const UserIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 12a4 4 0 100-8 4 4 0 000 8zM3 22a9 9 0 0118 0" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const QUICK_HELP = [
  { id: 1, icon: <CricketIcon />, color: '#FF6B7A', label: 'How to play', subtitle: '5-min guide' },
  { id: 2, icon: <TrophyIcon />, color: '#3F8FFF', label: 'Contest Rules', subtitle: 'Mega & H2H' },
  { id: 3, icon: <WalletIcon />, color: '#9C5BD8', label: 'Payments', subtitle: 'Deposit & Withdraw' },
  { id: 4, icon: <UserIcon />, color: '#27c28a', label: 'My Account', subtitle: 'KYC & Profile' },
];

const FAQS = [
  {
    q: 'How do I create my fantasy team?',
    a: 'Tap on any upcoming match, select 11 players from both teams within the credits limit (100), choose your Captain (2x) and Vice-Captain (1.5x), then enter any contest.',
  },
  {
    q: 'When are winnings credited?',
    a: 'Winnings are credited instantly after the match is complete and results are verified. You can then withdraw to your bank account.',
  },
  {
    q: 'What is the minimum withdrawal amount?',
    a: 'The minimum withdrawal amount is ₹100. KYC verified users can withdraw up to ₹1,00,000 per day.',
  },
  {
    q: 'Can I edit my team after contest join?',
    a: 'No, teams are locked once the match starts. Make sure to finalize your team before the deadline.',
  },
  {
    q: 'What happens if a match is abandoned?',
    a: 'In case of abandoned matches, contest entry fees are fully refunded to your wallet within 24 hours.',
  },
  {
    q: 'How is the leaderboard score calculated?',
    a: 'Player points are calculated based on real match performance — runs, wickets, catches, strike rate, economy, etc.',
  },
  {
    q: 'Is my money safe with 11DREAMER?',
    a: 'Absolutely! All player funds are kept in a separate escrow account. 11DREAMER is a fully licensed and regulated fantasy sports platform.',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [category, setCategory] = useState<string>('all');

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>Find answers or get in touch with our support team</Text>

          <View style={styles.searchBox}>
            <SearchIcon color="#5a5a6a" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor="#5a5a6a"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Quick Help */}
        <View style={styles.quickRow}>
          {QUICK_HELP.map(item => (
            <TouchableOpacity key={item.id} style={styles.quickCard} activeOpacity={0.7}>
              <View style={[styles.quickIcon, { backgroundColor: item.color + '22' }]}>
                {item.icon}
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {filteredFaqs.length === 0 ? (
            <Text style={styles.emptyText}>No results found. Try a different search.</Text>
          ) : (
            filteredFaqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.faqRow}
                  onPress={() => setOpenIndex(isOpen ? null : i)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQ, isOpen && { color: '#ECBD15' }]}>{faq.q}</Text>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </View>
                  {isOpen && <Text style={styles.faqA}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Contact Us */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: 'rgba(63,143,255,0.08)' }]}
            onPress={() => Linking.openURL('tel:+911800123456')}
          >
            <PhoneIcon color="#3F8FFF" />
            <Text style={styles.contactLabel}>Call Us</Text>
            <Text style={styles.contactDetail}>1800-123-456</Text>
            <Text style={styles.contactTime}>9 AM - 9 PM IST</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: 'rgba(39,194,138,0.08)' }]}
            onPress={() => Linking.openURL('https://wa.me/911800123456')}
          >
            <ChatIcon color="#27c28a" />
            <Text style={styles.contactLabel}>Live Chat</Text>
            <Text style={styles.contactDetail}>Instant Help</Text>
            <Text style={styles.contactTime}>Avg. 30s response</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: 'rgba(156,91,216,0.08)' }]}
            onPress={() => Linking.openURL('mailto:support@11dreamer.app')}
          >
            <EmailIcon color="#9C5BD8" />
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactDetail}>support@11dreamer</Text>
            <Text style={styles.contactTime}>Reply in 4-6 hours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: 'rgba(236,189,21,0.08)' }]}
            onPress={() => Linking.openURL('mailto:support@11dreamer.app?subject=Raising%20a%20Support%20Ticket')}
          >
            <TicketIcon color="#ECBD15" />
            <Text style={styles.contactLabel}>Raise Ticket</Text>
            <Text style={styles.contactDetail}>Track Issue</Text>
            <Text style={styles.contactTime}>Resolution in 24h</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>Still need help? Our support team is available 24/7</Text>
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
    margin: 16, marginTop: 8, padding: 20, borderRadius: 18,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(63,143,255,0.15)',
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  heroSubtitle: { color: '#8a8a9a', fontSize: 12, textAlign: 'center', marginTop: 4 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  quickCard: {
    width: '48.5%', padding: 14, borderRadius: 12,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', gap: 6,
  },
  quickIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  quickLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  quickSubtitle: { color: '#8a8a9a', fontSize: 10 },

  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '800', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  faqList: { paddingHorizontal: 16, gap: 8 },
  emptyText: { color: '#8a8a9a', fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  faqRow: {
    padding: 14, backgroundColor: '#10101c', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1, paddingRight: 12 },
  faqA: { color: '#8a8a9a', fontSize: 12, marginTop: 10, lineHeight: 20 },

  contactRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  contactCard: {
    flex: 1, padding: 14, borderRadius: 12, gap: 4,
  },
  contactLabel: { color: '#fff', fontSize: 13, fontWeight: '800', marginTop: 6 },
  contactDetail: { color: '#fff', fontSize: 12, fontWeight: '600' },
  contactTime: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },

  footerNote: { alignItems: 'center', marginTop: 24, paddingHorizontal: 16 },
  footerText: { color: '#5a5a6a', fontSize: 12 },
});

export default HelpSupportScreen;
