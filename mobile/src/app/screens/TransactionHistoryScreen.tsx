/**
 * File:        mobile/src/app/screens/TransactionHistoryScreen.tsx
 * Module:      Wallet · Transaction History Screen
 * Purpose:     Transaction list — filter tabs, search, grouped-by-month rows with status pills
 *
 * Exports:
 *   - TransactionHistoryScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput
 *   - react-native-svg                — Svg, Path, Circle
 *   - @react-navigation/native         — useNavigation
 *   - @/store/useWalletStore            — transactions, balance
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */

import React, { useState, useMemo } from 'react';
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
import { useWalletStore } from '../store/useWalletStore';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const SearchIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M16 16l5 5" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const ArrowDownIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 4v16M5 13l7 7 7-7" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowUpIcon = ({ color = '#CE404D' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 20V4M5 11l7-7 7 7" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrophyIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M7 4h10v4a5 5 0 01-5 5 5 5 0 01-5-5V4z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const PlusIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 4v16M4 12h16" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
  </Svg>
);

const DownloadIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const TRANSACTIONS = [
  { id: 1, type: 'deposit', amount: 1000, method: 'UPI', ref: 'UPI/2024/1234', date: '2026-06-12', time: '14:32', status: 'success', label: 'Deposit via UPI' },
  { id: 2, type: 'contest', amount: -49, method: 'Mega Contest', ref: 'CON/MC/5678', date: '2026-06-12', time: '20:05', status: 'success', label: 'IND vs AUS Mega Contest' },
  { id: 3, type: 'winning', amount: 2500, method: 'Mega Contest', ref: 'WIN/MC/5678', date: '2026-06-12', time: '23:45', status: 'success', label: 'Won Mega Contest - 2nd Prize' },
  { id: 4, type: 'withdraw', amount: -3000, method: 'Bank Transfer', ref: 'TXN/WD/9012', date: '2026-06-10', time: '10:15', status: 'pending', label: 'Withdrawal to HDFC Bank' },
  { id: 5, type: 'contest', amount: -25, method: 'H2H Contest', ref: 'CON/H2H/4321', date: '2026-06-09', time: '19:55', status: 'success', label: 'CSK vs MI Head to Head' },
  { id: 6, type: 'bonus', amount: 50, method: 'Referral', ref: 'REF/2024/ABCD', date: '2026-06-08', time: '12:00', status: 'success', label: 'Referral Bonus - Vikram S.' },
  { id: 7, type: 'deposit', amount: 500, method: 'Paytm Wallet', ref: 'PTM/2024/5678', date: '2026-06-05', time: '09:20', status: 'failed', label: 'Deposit via Paytm' },
  { id: 8, type: 'winning', amount: 100, method: 'Mini Contest', ref: 'WIN/MIN/1234', date: '2026-06-04', time: '23:30', status: 'success', label: 'Won Mini Grand' },
  { id: 9, type: 'contest', amount: -15, method: 'Mini Contest', ref: 'CON/MIN/1234', date: '2026-06-04', time: '20:10', status: 'success', label: 'CSK vs MI Mini Grand' },
  { id: 10, type: 'withdraw', amount: -5000, method: 'Bank Transfer', ref: 'TXN/WD/7890', date: '2026-06-01', time: '11:00', status: 'success', label: 'Withdrawal to SBI' },
  { id: 11, type: 'deposit', amount: 2000, method: 'UPI', ref: 'UPI/2024/9999', date: '2026-05-28', time: '18:45', status: 'success', label: 'Deposit via UPI' },
  { id: 12, type: 'bonus', amount: 100, method: 'Promotion', ref: 'PROMO/2024/100', date: '2026-05-25', time: '10:00', status: 'success', label: '100% First Deposit Bonus' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTxIcon(type: string) {
  switch (type) {
    case 'deposit': return { Icon: ArrowDownIcon, color: '#27c28a' };
    case 'withdraw': return { Icon: ArrowUpIcon, color: '#CE404D' };
    case 'contest': return { Icon: TrophyIcon, color: '#3F8FFF' };
    case 'winning': return { Icon: TrophyIcon, color: '#ECBD15' };
    case 'bonus': return { Icon: PlusIcon, color: '#9C5BD8' };
    default: return { Icon: ArrowDownIcon, color: '#8a8a9a' };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'success': return { bg: 'rgba(39,194,138,0.15)', color: '#27c28a', label: 'Success' };
    case 'pending': return { bg: 'rgba(236,189,21,0.15)', color: '#ECBD15', label: 'Pending' };
    case 'failed': return { bg: 'rgba(206,64,77,0.15)', color: '#CE404D', label: 'Failed' };
    default: return { bg: 'rgba(255,255,255,0.06)', color: '#8a8a9a', label: 'Unknown' };
  }
}

function groupByMonth(items: any[]) {
  const groups: Record<string, any[]> = {};
  for (const item of items) {
    const month = item.date.substring(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(item);
  }
  return groups;
}

function monthLabel(m: string) {
  const [y, mo] = m.split('-');
  const date = new Date(parseInt(y), parseInt(mo) - 1, 1);
  return date.toLocaleString('en', { month: 'long', year: 'numeric' });
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const wallet = useWalletStore();
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdraw' | 'winning' | 'contest' | 'bonus'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter(t => {
      if (activeTab !== 'all' && t.type !== activeTab) return false;
      if (search && !t.label.toLowerCase().includes(search.toLowerCase()) && !t.ref.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeTab, search]);

  const groups = groupByMonth(filtered);
  const totalCredit = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalDebit = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Transactions</Text>
        <TouchableOpacity style={styles.downloadBtn}>
          <DownloadIcon />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Credit</Text>
          <Text style={[styles.summaryValue, { color: '#27c28a' }]}>+₹{totalCredit.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Debit</Text>
          <Text style={[styles.summaryValue, { color: '#CE404D' }]}>-₹{totalDebit.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, { color: totalCredit - totalDebit >= 0 ? '#27c28a' : '#CE404D' }]}>
            ₹{Math.abs(totalCredit - totalDebit).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#5a5a6a"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {([
            { key: 'all', label: 'All' },
            { key: 'deposit', label: 'Deposits' },
            { key: 'withdraw', label: 'Withdrawals' },
            { key: 'contest', label: 'Contests' },
            { key: 'winning', label: 'Winnings' },
            { key: 'bonus', label: 'Bonuses' },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptyDesc}>Try a different filter or search term</Text>
          </View>
        ) : (
          Object.keys(groups).map(month => (
            <View key={month} style={styles.monthGroup}>
              <Text style={styles.monthLabel}>{monthLabel(month)}</Text>
              {groups[month].map((tx: any) => {
                const { Icon, color: iconColor } = getTxIcon(tx.type);
                const status = getStatusColor(tx.status);
                return (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={[styles.txIconWrap, { backgroundColor: iconColor + '22' }]}>
                      <Icon color={iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txLabel} numberOfLines={1}>{tx.label}</Text>
                      <View style={styles.txMetaRow}>
                        <Text style={styles.txMethod}>{tx.method}</Text>
                        <Text style={styles.txDate}>{tx.date} · {tx.time}</Text>
                      </View>
                      <Text style={styles.txRef}>Ref: {tx.ref}</Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={[styles.txAmount, { color: tx.amount > 0 ? '#27c28a' : '#CE404D' }]}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                      </Text>
                      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
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
  downloadBtn: { padding: 8 },
  scrollContent: { paddingBottom: 20 },

  summaryCard: {
    flexDirection: 'row', marginHorizontal: 16, padding: 16, borderRadius: 14,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#8a8a9a', fontSize: 10, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '900', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#10101c', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },

  filterRow: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterTabActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  filterTabText: { color: '#8a8a9a', fontSize: 12, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyDesc: { color: '#8a8a9a', fontSize: 12, marginTop: 4 },

  monthGroup: { marginBottom: 16 },
  monthLabel: { color: '#8a8a9a', fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, marginHorizontal: 16, marginBottom: 6,
    backgroundColor: '#10101c', borderRadius: 12,
  },
  txIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  txLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  txMethod: { color: '#8a8a9a', fontSize: 10, fontWeight: '600' },
  txDate: { color: '#5a5a6a', fontSize: 10 },
  txRef: { color: '#5a5a6a', fontSize: 9, marginTop: 2, fontFamily: 'monospace' },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '900' },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusText: { fontSize: 9, fontWeight: '800' },
});

export default TransactionHistoryScreen;
