/**
 * File:        mobile/src/app/screens/SettingsScreen.tsx
 * Module:      Profile · Settings Screen
 * Purpose:     App settings — account, notifications, privacy, security, and app preferences
 *
 * Exports:
 *   - SettingsScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch
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
  Switch,
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

const ChevronRight = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 12a4 4 0 100-8 4 4 0 000 8zM3 22a9 9 0 0118 0" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const BellIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M6 9a6 6 0 0112 0c0 5 2 7 2 7H4s2-2 2-7zM10 21h4" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const LockIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M5 11h14v10H5zM8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const EyeIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const GlobeIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c2 3 2 17 0 20M12 2c-2 3-2 17 0 20" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const MoonIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const HelpIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 22a10 10 0 100-20 10 10 0 000 20zM9 9a3 3 0 116 0c0 2-3 2-3 4M12 17h.01" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const DocIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M14 2v6h6M8 13h8M8 17h6" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const LogoutIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Settings Sections ──────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: 'ACCOUNT',
    items: [
      { icon: <UserIcon />, label: 'Edit Profile', value: 'Aman Vats', action: 'navigate', screen: 'EditProfile' },
      { icon: <LockIcon />, label: 'Change Password', action: 'navigate', screen: 'ForgotPassword' },
      { icon: <LockIcon />, label: 'Two-Factor Authentication', value: 'Off', action: 'navigate', screen: 'HelpSupport' },
    ],
  },
  {
    title: 'NOTIFICATIONS',
    items: [
      { icon: <BellIcon />, label: 'Match Updates', toggle: true, toggleDefault: true },
      { icon: <BellIcon />, label: 'Contest Alerts', toggle: true, toggleDefault: true },
      { icon: <BellIcon />, label: 'Promotional Offers', toggle: true, toggleDefault: false },
      { icon: <BellIcon />, label: 'Push Notifications', toggle: true, toggleDefault: true },
    ],
  },
  {
    title: 'PRIVACY & SECURITY',
    items: [
      { icon: <EyeIcon />, label: 'Profile Visibility', value: 'Public', action: 'navigate', screen: 'EditProfile' },
      { icon: <LockIcon />, label: 'Login Activity', action: 'navigate', screen: 'KYCVerification' },
      { icon: <DocIcon />, label: 'Block List', action: 'navigate', screen: 'HelpSupport' },
    ],
  },
  {
    title: 'PREFERENCES',
    items: [
      { icon: <MoonIcon />, label: 'Dark Mode', toggle: true, toggleDefault: true },
      { icon: <GlobeIcon />, label: 'Language', value: 'English', action: 'navigate', screen: 'HelpSupport' },
      { icon: <GlobeIcon />, label: 'Currency', value: 'INR (₹)', action: 'navigate', screen: 'HelpSupport' },
    ],
  },
  {
    title: 'SUPPORT & LEGAL',
    items: [
      { icon: <HelpIcon />, label: 'Help Center', action: 'navigate', screen: 'HelpSupport' },
      { icon: <HelpIcon />, label: 'Contact Support', action: 'navigate', screen: 'HelpSupport' },
      { icon: <DocIcon />, label: 'Terms of Service', action: 'navigate', screen: 'TermsPrivacy' },
      { icon: <DocIcon />, label: 'Privacy Policy', action: 'navigate', screen: 'TermsPrivacy' },
      { icon: <DocIcon />, label: 'About App', value: 'v2.4.1', action: 'navigate', screen: 'HelpSupport' },
    ],
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Match Updates': true,
    'Contest Alerts': true,
    'Promotional Offers': false,
    'Push Notifications': true,
    'Dark Mode': true,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={String(i) + item.label}
                  style={[styles.item, i === section.items.length - 1 && styles.itemLast]}
                  activeOpacity={item.toggle ? 1 : 0.7}
                  onPress={() => {
                    if (item.action === 'navigate' && (item as any).screen) {
                      navigation.navigate((item as any).screen as never);
                    }
                  }}
                >
                  <View style={styles.itemLeft}>
                    <View style={styles.itemIconWrap}>{item.icon}</View>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    {item.toggle && (
                      <Switch
                        value={toggles[item.label] ?? false}
                        onValueChange={v => setToggles(prev => ({ ...prev, [item.label]: v }))}
                        trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#27c28a' }}
                        thumbColor="#fff"
                      />
                    )}
                    {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                    {item.action === 'navigate' && <ChevronRight />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7}>
          <View style={styles.itemIconWrap}><LogoutIcon /></View>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.appVersionWrap}>
          <Text style={styles.appVersionText}>11DREAMER · v2.4.1</Text>
          <Text style={styles.appBuildText}>Build #2024.06.14</Text>
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

  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: '#8a8a9a', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  sectionCard: {
    backgroundColor: '#10101c', borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  itemLast: { borderBottomWidth: 0 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
  itemLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { color: '#8a8a9a', fontSize: 12 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginTop: 20, padding: 14,
    backgroundColor: 'rgba(206,64,77,0.1)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(206,64,77,0.2)',
  },
  logoutText: { color: colors.brandPrimary, fontSize: 14, fontWeight: '700' },

  appVersionWrap: { alignItems: 'center', marginTop: 24, gap: 4 },
  appVersionText: { color: '#5a5a6a', fontSize: 11, fontWeight: '600' },
  appBuildText: { color: '#3a3a4a', fontSize: 10 },
});

export default SettingsScreen;
