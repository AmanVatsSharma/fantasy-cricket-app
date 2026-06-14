/**
 * File:        mobile/src/app/screens/KYCVerificationScreen.tsx
 * Module:      Profile · KYC Verification Screen
 * Purpose:     KYC verification flow — status card, personal details form, document upload, and submit
 *
 * Exports:
 *   - KYCVerificationScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet
 *   - react-native-svg                — Svg, Path, Circle, Rect
 *   - @react-navigation/native         — useNavigation
 *   - @/store/useUserStore              — name, kycStatus
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
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/useUserStore';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const VerifiedIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.5} fill={color + '22'} />
    <Path d="M8 12l3 3 5-6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PendingIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.5} fill={color + '22'} />
    <Path d="M12 6v6l4 3" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
  </Svg>
);

const UploadIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path d="M12 3v12M5 11l7 7 7-7" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const IdCardIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Rect x={2} y={4} width={20} height={16} rx={3} stroke={color} strokeWidth={1.5} fill="none" />
    <Circle cx={8} cy={11} r={3} stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M14 10h6M14 14h3M14 18h5" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const ShieldIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Path d="M12 2L4 5v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V5l-8-3z" stroke={color} strokeWidth={1.5} fill={color + '22'} />
    <Path d="M8 12l3 3 5-6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const VERIFICATION_STEPS = [
  { id: 1, label: 'PAN Verification', icon: 'pan', status: 'completed' },
  { id: 2, label: 'Aadhaar Card', icon: 'aadhaar', status: 'pending' },
  { id: 3, label: 'Address Proof', icon: 'address', status: 'pending' },
];

const USER_STORE = useUserStore.getState();
const userName = USER_STORE.name || 'Aman Vats Sharma';

// ─── Main Component ─────────────────────────────────────────────────────────

export const KYCVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const kycStatus = useUserStore(s => s.kycStatus);
  const [activeTab, setActiveTab] = useState<'pan' | 'aadhaar' | 'address'>('pan');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      useUserStore.setState({ kycStatus: 'pending' });
      setSubmitting(false);
    }, 1500);
  };

  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus === 'pending';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>KYC Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <View style={[styles.statusCard, isVerified && styles.statusCardVerified]}>
          {isVerified ? (
            <VerifiedIcon />
          ) : (
            <View>
              <PendingIcon />
              <View style={styles.pendingDotWrap}>
                <View style={styles.pendingDot} />
              </View>
            </View>
          )}
          <Text style={[styles.statusTitle, isVerified && { color: '#27c28a' }]}>
            {isVerified ? 'KYC Verified' : isPending ? 'Verification Pending' : 'Complete Your KYC'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isVerified
              ? 'Your account is fully verified. You can withdraw up to ₹1,00,000/day.'
              : isPending
              ? 'Your documents are under review. We\'ll notify you within 24-48 hours.'
              : 'Verify your identity to unlock all features and higher withdrawal limits.'}
          </Text>
          {!isVerified && !isPending && (
            <View style={styles.benefitsRow}>
              <View style={styles.benefitItem}>
                <CheckIcon />
                <Text style={styles.benefitText}>Higher withdrawal limit</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckIcon />
                <Text style={styles.benefitText}>Instant withdrawals</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckIcon />
                <Text style={styles.benefitText}>All contest access</Text>
              </View>
            </View>
          )}
        </View>

        {!isVerified && (
          <>
            {/* Progress Steps */}
            <View style={styles.stepsSection}>
              <Text style={styles.sectionTitle}>Verification Steps</Text>
              <View style={styles.stepsList}>
                {VERIFICATION_STEPS.map((step, i) => (
                  <View key={step.id} style={styles.stepRow}>
                    <View style={[styles.stepCircle, step.status === 'completed' && styles.stepCircleDone]}>
                      {step.status === 'completed' ? <CheckIcon /> : <Text style={styles.stepNum}>{step.id}</Text>}
                    </View>
                    <View style={styles.stepLineWrap}>
                      {i < VERIFICATION_STEPS.length - 1 && (
                        <View style={[styles.stepLine, step.status === 'completed' && styles.stepLineDone]} />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingTop: 6 }}>
                      <Text style={[styles.stepLabel, step.status === 'completed' && styles.stepLabelDone]}>
                        {step.label}
                      </Text>
                      <Text style={styles.stepStatus}>
                        {step.status === 'completed' ? 'Verified' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Personal Info */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name (as per PAN)</Text>
                <TextInput style={styles.input} value={userName} editable={false} placeholderTextColor="#8a8a9a" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput style={styles.input} placeholder="DD/MM/YYYY" placeholderTextColor="#8a8a9a" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PAN Number</Text>
                <TextInput style={styles.input} placeholder="ABCDE1234F" placeholderTextColor="#8a8a9a" autoCapitalize="characters" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email ID</Text>
                <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#8a8a9a" keyboardType="email-address" />
              </View>
            </View>

            {/* Document Upload */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Upload Documents</Text>

              {/* Tab Switcher */}
              <View style={styles.docTabs}>
                {([
                  { key: 'pan', label: 'PAN Card', icon: <IdCardIcon /> },
                  { key: 'aadhaar', label: 'Aadhaar', icon: <ShieldIcon /> },
                  { key: 'address', label: 'Address', icon: <ShieldIcon /> },
                ] as const).map(tab => (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[styles.docTab, activeTab === tab.key && styles.docTabActive]}
                  >
                    <View style={[styles.docTabIconWrap, activeTab === tab.key && styles.docTabIconWrapActive]}>
                      {tab.icon}
                    </View>
                    <Text style={[styles.docTabText, activeTab === tab.key && styles.docTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Upload Area */}
              <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
                <UploadIcon />
                <Text style={styles.uploadText}>Tap to upload {activeTab === 'pan' ? 'PAN Card' : activeTab === 'aadhaar' ? 'Aadhaar Card' : 'Address Proof'}</Text>
                <Text style={styles.uploadHint}>JPG, PNG or PDF · Max 5MB</Text>
              </TouchableOpacity>

              {/* Requirements */}
              <View style={styles.requirementsCard}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {activeTab === 'pan' && (
                  <>
                    <Text style={styles.requirementItem}>• Clear, readable PAN card image</Text>
                    <Text style={styles.requirementItem}>• Name should match your profile</Text>
                    <Text style={styles.requirementItem}>• All four corners visible</Text>
                  </>
                )}
                {activeTab === 'aadhaar' && (
                  <>
                    <Text style={styles.requirementItem}>• Front side of Aadhaar card</Text>
                    <Text style={styles.requirementItem}>• Mask Aadhaar number (last 4 digits only)</Text>
                    <Text style={styles.requirementItem}>• QR code should be visible</Text>
                  </>
                )}
                {activeTab === 'address' && (
                  <>
                    <Text style={styles.requirementItem}>• Passport / Driving License / Voter ID</Text>
                    <Text style={styles.requirementItem}>• Address should be clearly visible</Text>
                    <Text style={styles.requirementItem}>• Document should be valid (not expired)</Text>
                  </>
                )}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit for Verification'}</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </>
        )}
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

  statusCard: {
    margin: 16, marginTop: 8, padding: 20, borderRadius: 18,
    backgroundColor: '#10101c',
    borderWidth: 1, borderColor: 'rgba(236,189,21,0.25)',
    alignItems: 'center',
  },
  statusCardVerified: { borderColor: 'rgba(39,194,138,0.3)' },
  statusTitle: { color: '#ECBD15', fontSize: 18, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  statusSubtitle: { color: '#8a8a9a', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  pendingDotWrap: { position: 'absolute', top: 16, right: 16 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ECBD15' },
  benefitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16, justifyContent: 'center' },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(39,194,138,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  benefitText: { color: '#27c28a', fontSize: 11, fontWeight: '600' },

  stepsSection: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  stepsList: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  stepCircleDone: { backgroundColor: '#27c28a' },
  stepNum: { color: '#8a8a9a', fontSize: 12, fontWeight: '700' },
  stepLineWrap: { width: 2, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 15, marginTop: 0 },
  stepLine: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  stepLineDone: { backgroundColor: '#27c28a' },
  stepLabel: { color: '#8a8a9a', fontSize: 13, fontWeight: '600' },
  stepLabelDone: { color: '#fff' },
  stepStatus: { color: '#6a6a7a', fontSize: 11, marginTop: 2 },

  formSection: { paddingHorizontal: 16, marginTop: 24 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { color: '#8a8a9a', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#10101c', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },

  docTabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  docTab: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center',
    backgroundColor: '#10101c', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 4,
  },
  docTabActive: { backgroundColor: 'rgba(63,143,255,0.15)', borderColor: 'rgba(63,143,255,0.4)' },
  docTabIconWrap: { padding: 4, borderRadius: 8 },
  docTabIconWrapActive: { backgroundColor: 'rgba(63,143,255,0.2)' },
  docTabText: { color: '#8a8a9a', fontSize: 11, fontWeight: '600' },
  docTabTextActive: { color: '#3F8FFF', fontWeight: '700' },

  uploadArea: {
    alignItems: 'center', justifyContent: 'center',
    padding: 32, borderRadius: 16,
    backgroundColor: '#10101c',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed', gap: 8,
  },
  uploadText: { color: '#8a8a9a', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  uploadHint: { color: '#5a5a6a', fontSize: 11 },

  requirementsCard: {
    marginTop: 14, padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(63,143,255,0.08)', borderWidth: 1, borderColor: 'rgba(63,143,255,0.2)',
  },
  requirementsTitle: { color: '#3F8FFF', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  requirementItem: { color: '#8a8a9a', fontSize: 12, lineHeight: 22 },

  submitBtn: {
    marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 14,
    backgroundColor: '#3F8FFF', alignItems: 'center',
    shadowColor: '#3F8FFF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  submitBtnDisabled: { backgroundColor: '#1d2a3d' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default KYCVerificationScreen;
