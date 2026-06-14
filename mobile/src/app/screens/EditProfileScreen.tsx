/**
 * File:        mobile/src/app/screens/EditProfileScreen.tsx
 * Module:      Profile · Edit Profile Screen
 * Purpose:     Edit user profile — avatar, name, email, phone, DOB, location, and cricket preferences
 *
 * Exports:
 *   - EditProfileScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput
 *   - react-native-svg                — Svg, Path, Circle
 *   - @react-navigation/native         — useNavigation
 *   - @/store/useUserStore              — name, email, phone, dob
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
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const CameraIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const UserIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 12a4 4 0 100-8 4 4 0 000 8zM3 22a9 9 0 0118 0" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const EmailIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M3 6h18v12H3zM3 6l9 7 9-7" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const PhoneIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M5 4h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A18 18 0 013 6a2 2 0 012-2z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CalendarIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M3 6h18v16H3zM3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const LocationIcon = ({ color = '#FF6B7A' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 2a8 8 0 00-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 00-8-8zM12 12a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CricketIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M4 20l8-8M8 16l-4 4 4-4zM14 4l6 6-2 2-6-6z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useUserStore();

  const [name, setName] = useState(user.name || 'Aman Vats Sharma');
  const [email, setEmail] = useState(user.email || 'aman.vats@email.com');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [dob, setDob] = useState('15/08/1995');
  const [city, setCity] = useState('Mumbai, MH');
  const [bio, setBio] = useState('Cricket fanatic. RCB till I die.');
  const [favoriteTeam, setFavoriteTeam] = useState('MI');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      useUserStore.setState({ name, email, phone });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.split(' ').map(n => n[0]).slice(0, 2).join('')}</Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn}>
            <CameraIcon />
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </View>

        {/* Personal Info */}
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Field icon={<UserIcon />} label="Full Name" value={name} onChange={setName} />
        <Field icon={<EmailIcon />} label="Email" value={email} onChange={setEmail} keyboardType="email-address" />
        <Field icon={<PhoneIcon />} label="Phone Number" value={phone} onChange={setPhone} keyboardType="phone-pad" />
        <Field icon={<CalendarIcon />} label="Date of Birth" value={dob} onChange={setDob} placeholder="DD/MM/YYYY" />
        <Field icon={<LocationIcon />} label="City" value={city} onChange={setCity} />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            placeholderTextColor="#5a5a6a"
          />
        </View>

        {/* Cricket Preferences */}
        <Text style={styles.sectionTitle}>Cricket Preferences</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Favorite IPL Team</Text>
          <View style={styles.teamsRow}>
            {['MI', 'CSK', 'RCB', 'KKR', 'DC', 'GT', 'LSG', 'RR', 'SRH', 'PBKS'].map(team => (
              <TouchableOpacity
                key={team}
                onPress={() => setFavoriteTeam(team)}
                style={[styles.teamChip, favoriteTeam === team && styles.teamChipActive]}
              >
                <Text style={[styles.teamChipText, favoriteTeam === team && styles.teamChipTextActive]}>
                  {team}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Favorite Format</Text>
          <View style={styles.teamsRow}>
            {['T20', 'ODI', 'Test', 'T10'].map(fmt => (
              <TouchableOpacity
                key={fmt}
                onPress={() => {}}
                style={[styles.teamChip, fmt === 'T20' && styles.teamChipActive]}
              >
                <Text style={[styles.teamChipText, fmt === 'T20' && styles.teamChipTextActive]}>{fmt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saved ? (
            <>
              <CheckIcon color="#fff" />
              <Text style={styles.saveBtnText}>Saved Successfully</Text>
            </>
          ) : (
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const Field = ({ icon, label, value, onChange, placeholder, keyboardType }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrap}>
      {icon}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#5a5a6a"
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

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

  avatarSection: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(206,64,77,0.2)',
    borderWidth: 3, borderColor: colors.brandPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.brandPrimary, fontSize: 32, fontWeight: '900' },
  cameraBtn: {
    position: 'absolute', top: 64, right: '32%',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#3F8FFF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#080810',
  },
  changePhotoText: { color: '#3F8FFF', fontSize: 12, fontWeight: '700', marginTop: 8 },

  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '800', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },

  inputGroup: { paddingHorizontal: 16, marginBottom: 14 },
  inputLabel: { color: '#8a8a9a', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#10101c', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  textarea: {
    minHeight: 80, textAlignVertical: 'top', padding: 14, paddingTop: 12,
    backgroundColor: '#10101c', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },

  teamsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  teamChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  teamChipActive: { backgroundColor: 'rgba(206,64,77,0.15)', borderColor: colors.brandPrimary },
  teamChipText: { color: '#8a8a9a', fontSize: 12, fontWeight: '700' },
  teamChipTextActive: { color: colors.brandPrimary },

  saveBtn: {
    marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 14,
    backgroundColor: colors.brandPrimary, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    shadowColor: colors.brandPrimary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  saveBtnDisabled: { backgroundColor: '#3a1015' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default EditProfileScreen;
