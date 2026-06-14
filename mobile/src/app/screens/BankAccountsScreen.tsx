/**
 * File:        mobile/src/app/screens/BankAccountsScreen.tsx
 * Module:      Wallet · Bank Accounts Screen
 * Purpose:     Manage linked bank accounts — list saved accounts, set default, and add new via form
 *
 * Exports:
 *   - BankAccountsScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput
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
  TextInput,
  Modal,
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

const BankIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M3 9l9-6 9 6v2H3zM5 11v8M9 11v8M15 11v8M19 11v8M3 21h18" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const PlusIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 4v16M4 12h16" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StarIcon = ({ color = '#ECBD15', filled = false }: { color?: string; filled?: boolean }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.5} />
  </Svg>
);

const TrashIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CloseIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M6 6l12 12M6 18L18 6" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
  </Svg>
);

const CardIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path d="M3 6h18v13H3zM3 10h18M7 15h3" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const BANK_ACCOUNTS = [
  {
    id: 1,
    bank: 'HDFC Bank',
    ifsc: 'HDFC0001234',
    accountHolder: 'Aman Vats Sharma',
    accountNumber: 'XXXXXX1234',
    primary: true,
    verified: true,
    addedOn: '12 May 2026',
  },
  {
    id: 2,
    bank: 'SBI Bank',
    ifsc: 'SBIN0005678',
    accountHolder: 'Aman Vats Sharma',
    accountNumber: 'XXXXXX5678',
    primary: false,
    verified: true,
    addedOn: '08 Apr 2026',
  },
  {
    id: 3,
    bank: 'ICICI Bank',
    ifsc: 'ICIC0009012',
    accountHolder: 'Aman Vats Sharma',
    accountNumber: 'XXXXXX9012',
    primary: false,
    verified: false,
    addedOn: '02 Jun 2026',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const BankAccountsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [accounts, setAccounts] = useState(BANK_ACCOUNTS);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add form
  const [newBank, setNewBank] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newHolder, setNewHolder] = useState('');

  const setPrimary = (id: number) => {
    setAccounts(prev => prev.map(a => ({ ...a, primary: a.id === id })));
  };

  const removeAccount = (id: number) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleAdd = () => {
    setAddModalOpen(false);
    setNewBank('');
    setNewIfsc('');
    setNewAccount('');
    setNewHolder('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Bank Accounts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <BankIcon color="#3F8FFF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Verified for Fast Withdrawals</Text>
            <Text style={styles.infoDesc}>Add up to 3 bank accounts for instant withdrawals</Text>
          </View>
        </View>

        {/* Accounts List */}
        <Text style={styles.sectionTitle}>LINKED ACCOUNTS · {accounts.length}/3</Text>
        {accounts.map(acc => (
          <View key={acc.id} style={[styles.accountCard, acc.primary && styles.accountCardPrimary]}>
            <View style={styles.accountHeader}>
              <View style={styles.bankIconWrap}>
                <BankIcon color={acc.primary ? '#ECBD15' : '#3F8FFF'} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.bankNameRow}>
                  <Text style={styles.bankName}>{acc.bank}</Text>
                  {acc.verified ? (
                    <View style={styles.verifiedPill}>
                      <CheckIcon color="#27c28a" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : (
                    <View style={[styles.verifiedPill, { backgroundColor: 'rgba(236,189,21,0.15)' }]}>
                      <Text style={[styles.verifiedText, { color: '#ECBD15' }]}>Pending</Text>
                    </View>
                  )}
                  {acc.primary && (
                    <View style={styles.primaryPill}>
                      <StarIcon color="#ECBD15" filled />
                      <Text style={styles.primaryText}>Primary</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.holderName}>{acc.accountHolder}</Text>
                <Text style={styles.accountNum}>A/c: {acc.accountNumber}</Text>
                <Text style={styles.ifsc}>IFSC: {acc.ifsc}</Text>
                <Text style={styles.addedOn}>Added on {acc.addedOn}</Text>
              </View>
            </View>

            <View style={styles.accountActions}>
              {!acc.primary && acc.verified && (
                <TouchableOpacity onPress={() => setPrimary(acc.id)} style={styles.actionBtn}>
                  <StarIcon color="#ECBD15" />
                  <Text style={styles.actionBtnText}>Set Primary</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => removeAccount(acc.id)} style={[styles.actionBtn, styles.deleteBtn]}>
                <TrashIcon />
                <Text style={[styles.actionBtnText, { color: '#CE404D' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add New Button */}
        {accounts.length < 3 && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalOpen(true)}>
            <PlusIcon />
            <Text style={styles.addBtnText}>Add New Bank Account</Text>
          </TouchableOpacity>
        )}

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityTitle}>🔒 Bank-level Security</Text>
          <Text style={styles.securityText}>Your account details are encrypted with 256-bit SSL. We never store your full account number or password.</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={addModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Bank Account</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Field label="Account Holder Name" value={newHolder} onChange={setNewHolder} placeholder="As per bank records" />
              <Field label="Bank Name" value={newBank} onChange={setNewBank} placeholder="e.g. HDFC Bank" />
              <Field label="Account Number" value={newAccount} onChange={setNewAccount} placeholder="9-18 digits" keyboardType="number-pad" />
              <Field label="IFSC Code" value={newIfsc} onChange={setNewIfsc} placeholder="ABCD0001234" autoCapitalize="characters" />

              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>
                  • A ₹1 verification charge will be deducted{'\n'}
                  • Refunded within 24 hours{'\n'}
                  • Account will be verified via penny-drop
                </Text>
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleAdd}>
                <Text style={styles.modalSubmitBtnText}>Add Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const Field = ({ label, value, onChange, placeholder, keyboardType, autoCapitalize }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#5a5a6a"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
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

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(63,143,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(63,143,255,0.2)',
  },
  infoTitle: { color: '#3F8FFF', fontSize: 13, fontWeight: '800' },
  infoDesc: { color: '#8a8a9a', fontSize: 11, marginTop: 2 },

  sectionTitle: { color: '#8a8a9a', fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },

  accountCard: {
    marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  accountCardPrimary: { borderColor: 'rgba(236,189,21,0.25)', backgroundColor: 'rgba(236,189,21,0.04)' },
  accountHeader: { flexDirection: 'row', gap: 12 },
  bankIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(63,143,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  bankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  bankName: { color: '#fff', fontSize: 14, fontWeight: '800' },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    backgroundColor: 'rgba(39,194,138,0.15)',
  },
  verifiedText: { color: '#27c28a', fontSize: 9, fontWeight: '800' },
  primaryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    backgroundColor: 'rgba(236,189,21,0.15)',
  },
  primaryText: { color: '#ECBD15', fontSize: 9, fontWeight: '800' },
  holderName: { color: '#c2c2d0', fontSize: 12, marginTop: 6 },
  accountNum: { color: '#8a8a9a', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  ifsc: { color: '#8a8a9a', fontSize: 12, fontFamily: 'monospace' },
  addedOn: { color: '#5a5a6a', fontSize: 10, marginTop: 4 },

  accountActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  deleteBtn: { backgroundColor: 'rgba(206,64,77,0.1)' },
  actionBtnText: { color: '#ECBD15', fontSize: 11, fontWeight: '700' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  securityNote: {
    marginHorizontal: 16, marginTop: 20, padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  securityTitle: { color: '#8a8a9a', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  securityText: { color: '#5a5a6a', fontSize: 11, lineHeight: 18 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#080810', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingTop: 20,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 20 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { color: '#8a8a9a', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    backgroundColor: '#10101c', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  input: { color: '#fff', fontSize: 14 },
  modalInfo: {
    marginTop: 8, padding: 12, borderRadius: 10,
    backgroundColor: 'rgba(63,143,255,0.06)', borderWidth: 1, borderColor: 'rgba(63,143,255,0.15)',
  },
  modalInfoText: { color: '#8a8a9a', fontSize: 11, lineHeight: 18 },
  modalSubmitBtn: {
    backgroundColor: '#3F8FFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20,
  },
  modalSubmitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default BankAccountsScreen;
