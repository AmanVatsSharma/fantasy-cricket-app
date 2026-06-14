/**
 * File:        mobile/src/app/screens/AITeamSuggestionsScreen.tsx
 * Module:      Teams · AI Team Suggestions Screen
 * Purpose:     AI-powered team suggestions — risk slider, recommended XI, reasoning, and apply CTA
 *
 * Exports:
 *   - AITeamSuggestionsScreen
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

const SparkleIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill={color} />
    <Path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill={color} />
  </Svg>
);

const RefreshIcon = ({ color = '#3F8FFF' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M3 12a9 9 0 0115-6l3-3v7h-7M21 12a9 9 0 01-15 6l-3 3v-7h7" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WarningIcon = ({ color = '#ECBD15' }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M12 2L2 21h20L12 2zM12 9v5M12 17h.01" stroke={color} strokeWidth={1.5} fill={color + '22'} />
  </Svg>
);

const BrainIcon = ({ color = '#9C5BD8' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M9 3a3 3 0 00-3 3v1a3 3 0 00-3 3 3 3 0 002 2.8 3 3 0 000 2.4 3 3 0 00-2 2.8 3 3 0 003 3v0a3 3 0 003 3h0V3z" stroke={color} strokeWidth={1.5} fill="none" />
    <Path d="M15 3a3 3 0 013 3v1a3 3 0 013 3 3 3 0 01-2 2.8 3 3 0 010 2.4 3 3 0 012 2.8 3 3 0 01-3 3v0a3 3 0 01-3 3h0V3z" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PLAYER_TYPES = ['WK', 'BAT', 'AR', 'BOWL'];

const SUGGESTED_XI = [
  { id: 1, name: 'Rohit S.', team: 'MI', type: 'BAT', credits: 11, points: 245, confidence: 92, form: '🔥 Hot' },
  { id: 2, name: 'Virat K.', team: 'RCB', type: 'BAT', credits: 11, points: 230, confidence: 90, form: '🔥 Hot' },
  { id: 3, name: 'Jasprit B.', team: 'MI', type: 'BOWL', credits: 10.5, points: 220, confidence: 88, form: '🔥 Hot' },
  { id: 4, name: 'Hardik P.', team: 'MI', type: 'AR', credits: 10, points: 215, confidence: 85, form: 'Good' },
  { id: 5, name: 'MS Dhoni', team: 'CSK', type: 'WK', credits: 9.5, points: 210, confidence: 84, form: 'Good' },
  { id: 6, name: 'KL Rahul', team: 'LSG', type: 'WK', credits: 10, points: 200, confidence: 80, form: 'Good' },
  { id: 7, name: 'Shubman G.', team: 'GT', type: 'BAT', credits: 9.5, points: 195, confidence: 78, form: 'Good' },
  { id: 8, name: 'Ravindra J.', team: 'RR', type: 'AR', credits: 9, points: 185, confidence: 75, form: 'Avg' },
  { id: 9, name: 'Yashasvi J.', team: 'RR', type: 'BAT', credits: 9, points: 180, confidence: 72, form: 'Avg' },
  { id: 10, name: 'Kuldeep Y.', team: 'DC', type: 'BOWL', credits: 9, points: 175, confidence: 70, form: 'Avg' },
  { id: 11, name: 'Mohammed S.', team: 'GT', type: 'BOWL', credits: 8.5, points: 170, confidence: 68, form: 'Cold' },
];

const AI_INSIGHTS = [
  { type: 'positive', text: 'MI has 78% win probability at home' },
  { type: 'positive', text: 'Top 4 MI batsmen averaging 50+ runs this season' },
  { type: 'warning', text: 'CSK bowlers are in form - avoid top-order' },
  { type: 'positive', text: 'Pitch favors spinners - 3 of 4 selected' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const AITeamSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [riskLevel, setRiskLevel] = useState<'safe' | 'balanced' | 'risky'>('balanced');
  const [generating, setGenerating] = useState(false);

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  const totalCredits = SUGGESTED_XI.reduce((sum, p) => sum + p.credits, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <SparkleIcon />
          <Text style={styles.topBarTitle}>AI Team Suggestions</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* AI Header Card */}
        <View style={styles.aiHeader}>
          <View style={styles.aiHeaderGlow} />
          <View style={styles.aiHeaderRow}>
            <View style={styles.aiHeaderIcon}>
              <SparkleIcon color="#9C5BD8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiHeaderTitle}>Powered by 11DREAMER AI</Text>
              <Text style={styles.aiHeaderSubtitle}>Analysis of 10,000+ data points</Text>
            </View>
          </View>

          {/* Match */}
          <View style={styles.matchRow}>
            <View style={styles.matchTeam}>
              <View style={[styles.matchTeamBadge, { backgroundColor: '#004BA0' }]}>
                <Text style={styles.matchTeamText}>MI</Text>
              </View>
              <Text style={styles.matchTeamName}>Mumbai</Text>
              <Text style={styles.matchWinPct}>78%</Text>
            </View>
            <View style={styles.matchVSCenter}>
              <Text style={styles.matchVS}>VS</Text>
              <Text style={styles.matchFormat}>T20 · 8:00 PM</Text>
            </View>
            <View style={styles.matchTeam}>
              <View style={[styles.matchTeamBadge, { backgroundColor: '#F7C42E' }]}>
                <Text style={styles.matchTeamText}>CSK</Text>
              </View>
              <Text style={styles.matchTeamName}>Chennai</Text>
              <Text style={styles.matchWinPct}>22%</Text>
            </View>
          </View>

          {/* Risk Selector */}
          <View style={styles.riskRow}>
            <Text style={styles.riskLabel}>Risk Appetite:</Text>
            <View style={styles.riskOptions}>
              {(['safe', 'balanced', 'risky'] as const).map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRiskLevel(r)}
                  style={[styles.riskOption, riskLevel === r && styles.riskOptionActive]}
                >
                  <Text style={[styles.riskOptionText, riskLevel === r && styles.riskOptionTextActive]}>
                    {r === 'safe' ? '🛡️ Safe' : r === 'balanced' ? '⚖️ Balanced' : '🚀 Risky'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <BrainIcon />
            <Text style={styles.insightsTitle}>AI Insights</Text>
          </View>
          {AI_INSIGHTS.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              {insight.type === 'positive' ? <CheckIcon /> : <WarningIcon />}
              <Text style={styles.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>

        {/* Suggested XI */}
        <View style={styles.xiHeader}>
          <View>
            <Text style={styles.xiTitle}>Suggested XI</Text>
            <Text style={styles.xiSubtitle}>{SUGGESTED_XI.length} players · {totalCredits.toFixed(1)} credits</Text>
          </View>
          <TouchableOpacity onPress={handleRegenerate} style={styles.regenerateBtn} disabled={generating}>
            <RefreshIcon />
            <Text style={styles.regenerateBtnText}>{generating ? 'Generating...' : 'Regenerate'}</Text>
          </TouchableOpacity>
        </View>

        {/* Captain & Vice Captain */}
        <View style={styles.cvRow}>
          <View style={[styles.cvCard, { backgroundColor: 'rgba(236,189,21,0.12)', borderColor: 'rgba(236,189,21,0.3)' }]}>
            <Text style={styles.cvLabel}>CAPTAIN</Text>
            <Text style={[styles.cvName, { color: '#ECBD15' }]}>Rohit S.</Text>
            <Text style={styles.cvPoints}>2x points · 245 pts</Text>
          </View>
          <View style={[styles.cvCard, { backgroundColor: 'rgba(63,143,255,0.12)', borderColor: 'rgba(63,143,255,0.3)' }]}>
            <Text style={styles.cvLabel}>VICE-CAPTAIN</Text>
            <Text style={[styles.cvName, { color: '#3F8FFF' }]}>Virat K.</Text>
            <Text style={styles.cvPoints}>1.5x points · 230 pts</Text>
          </View>
        </View>

        {/* Player List */}
        <View style={styles.playersList}>
          {SUGGESTED_XI.map(p => (
            <View key={p.id} style={styles.playerRow}>
              <View style={[styles.playerType, { backgroundColor: typeColor(p.type) }]}>
                <Text style={styles.playerTypeText}>{p.type}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{p.name}</Text>
                <Text style={styles.playerMeta}>{p.team} · {p.form}</Text>
              </View>
              <View style={styles.playerStats}>
                <Text style={styles.playerCredits}>{p.credits} cr</Text>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${p.confidence}%`, backgroundColor: confidenceColor(p.confidence) }]} />
                </View>
                <Text style={styles.confidenceText}>{p.confidence}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Apply CTA */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit Team</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
            <SparkleIcon color="#fff" />
            <Text style={styles.applyBtnText}>Use This Team</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AI suggestions are based on historical stats and current form. Past performance does not guarantee future results.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function typeColor(type: string): string {
  switch (type) {
    case 'WK': return 'rgba(206,64,77,0.25)';
    case 'BAT': return 'rgba(63,143,255,0.25)';
    case 'AR': return 'rgba(156,91,216,0.25)';
    case 'BOWL': return 'rgba(39,194,138,0.25)';
    default: return 'rgba(255,255,255,0.1)';
  }
}

function confidenceColor(c: number): string {
  if (c >= 85) return '#27c28a';
  if (c >= 70) return '#ECBD15';
  return '#FF6B7A';
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  scrollContent: { paddingBottom: 20 },

  aiHeader: {
    margin: 16, marginTop: 8, padding: 16, borderRadius: 18,
    backgroundColor: '#10101c',
    borderWidth: 1, borderColor: 'rgba(156,91,216,0.25)',
    overflow: 'hidden',
  },
  aiHeaderGlow: {
    position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(156,91,216,0.15)',
  },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiHeaderIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(156,91,216,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  aiHeaderTitle: { color: '#9C5BD8', fontSize: 14, fontWeight: '800' },
  aiHeaderSubtitle: { color: '#8a8a9a', fontSize: 11, marginTop: 2 },

  matchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, marginTop: 14, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  matchTeam: { alignItems: 'center', flex: 1 },
  matchTeamBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  matchTeamText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  matchTeamName: { color: '#fff', fontSize: 12, fontWeight: '700', marginTop: 4 },
  matchWinPct: { color: '#27c28a', fontSize: 11, marginTop: 2 },
  matchVSCenter: { alignItems: 'center' },
  matchVS: { color: '#fff', fontSize: 14, fontWeight: '900' },
  matchFormat: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },

  riskRow: { marginTop: 14, gap: 8 },
  riskLabel: { color: '#8a8a9a', fontSize: 12, fontWeight: '600' },
  riskOptions: { flexDirection: 'row', gap: 6 },
  riskOption: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  riskOptionActive: { backgroundColor: 'rgba(156,91,216,0.2)', borderColor: '#9C5BD8' },
  riskOptionText: { color: '#8a8a9a', fontSize: 11, fontWeight: '700' },
  riskOptionTextActive: { color: '#9C5BD8' },

  insightsCard: {
    marginHorizontal: 16, marginTop: 4, padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(156,91,216,0.06)',
    borderWidth: 1, borderColor: 'rgba(156,91,216,0.15)',
  },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  insightsTitle: { color: '#9C5BD8', fontSize: 13, fontWeight: '800' },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  insightText: { color: '#c2c2d0', fontSize: 12, flex: 1 },

  xiHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 20, marginBottom: 12,
  },
  xiTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  xiSubtitle: { color: '#8a8a9a', fontSize: 11, marginTop: 2 },
  regenerateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(63,143,255,0.15)',
  },
  regenerateBtnText: { color: '#3F8FFF', fontSize: 11, fontWeight: '700' },

  cvRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  cvCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
  cvLabel: { color: '#8a8a9a', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  cvName: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  cvPoints: { color: '#8a8a9a', fontSize: 10, marginTop: 4 },

  playersList: { paddingHorizontal: 16 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, marginBottom: 6, backgroundColor: '#10101c', borderRadius: 10,
  },
  playerType: { width: 38, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  playerTypeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  playerName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  playerMeta: { color: '#8a8a9a', fontSize: 10, marginTop: 2 },
  playerStats: { alignItems: 'flex-end', gap: 3 },
  playerCredits: { color: '#ECBD15', fontSize: 12, fontWeight: '700' },
  confidenceBar: { width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceText: { color: '#8a8a9a', fontSize: 9 },

  ctaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  editBtn: {
    flex: 1, padding: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#10101c', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  applyBtn: {
    flex: 2, padding: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    backgroundColor: '#9C5BD8',
    shadowColor: '#9C5BD8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  applyBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  disclaimer: { marginHorizontal: 16, marginTop: 16, padding: 10 },
  disclaimerText: { color: '#5a5a6a', fontSize: 10, textAlign: 'center', lineHeight: 16 },
});

export default AITeamSuggestionsScreen;
