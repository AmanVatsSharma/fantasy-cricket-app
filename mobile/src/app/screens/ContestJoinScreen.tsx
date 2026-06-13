/**
 * File:        mobile/src/app/screens/ContestJoinScreen.tsx
 * Module:      Mobile · Contest Join (Team Picker) Screen
 * Purpose:     Dream11-style team selection screen. User picks 11 players
 *              (1 WK, 1-4 BAT, 1-4 AR, 1-4 BOWL) by role tab, with captain
 *              (2x points) and vice-captain (1.5x) selection.
 *
 * Exports:
 *   - ContestJoinScreen — main screen component
 *
 * Navigation:
 *   - route.params: { matchId, matchName, contestType, entryFee, prizePool, team1, team2, team1Color, team2Color }
 *   - user picks 11 players, then taps JOIN CONTEST
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Svg, Path, Circle, Rect } from 'react-native-svg';
import { useToast } from '../components/Toast';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Role = 'WK' | 'BAT' | 'AR' | 'BOWL';

interface Player {
  id: string;
  name: string;
  role: Role;
  team: 'team1' | 'team2';
  credits: number;
  points: number;
  form: number;
  selectedPct: number;
}

// Mock player pool (22 players: 11 per team)
const MOCK_PLAYERS: Player[] = [
  // Team 1 (Chennai)
  { id: 'p1', name: 'MS Dhoni', role: 'WK', team: 'team1', credits: 10.5, points: 285, form: 95, selectedPct: 89 },
  { id: 'p2', name: 'Ruturaj Gaikwad', role: 'BAT', team: 'team1', credits: 9.5, points: 245, form: 88, selectedPct: 76 },
  { id: 'p3', name: 'Shivam Dube', role: 'AR', team: 'team1', credits: 9.0, points: 235, form: 85, selectedPct: 68 },
  { id: 'p4', name: 'Devon Conway', role: 'BAT', team: 'team1', credits: 8.5, points: 198, form: 75, selectedPct: 45 },
  { id: 'p5', name: 'Ravindra Jadeja', role: 'AR', team: 'team1', credits: 9.5, points: 265, form: 92, selectedPct: 82 },
  { id: 'p6', name: 'Deepak Chahar', role: 'BOWL', team: 'team1', credits: 9.0, points: 220, form: 80, selectedPct: 60 },
  { id: 'p7', name: 'Tushar Deshpande', role: 'BOWL', team: 'team1', credits: 8.0, points: 175, form: 70, selectedPct: 35 },
  { id: 'p8', name: 'Maheesh Theekshana', role: 'BOWL', team: 'team1', credits: 8.5, points: 195, form: 78, selectedPct: 48 },
  { id: 'p9', name: 'Ajinkya Rahane', role: 'BAT', team: 'team1', credits: 8.0, points: 188, form: 72, selectedPct: 40 },
  { id: 'p10', name: 'Moeen Ali', role: 'AR', team: 'team1', credits: 8.5, points: 210, form: 76, selectedPct: 52 },
  { id: 'p11', name: 'Ambati Rayudu', role: 'WK', team: 'team1', credits: 7.5, points: 145, form: 65, selectedPct: 28 },
  // Team 2 (Kolkata)
  { id: 'p12', name: 'Andre Russell', role: 'AR', team: 'team2', credits: 11.0, points: 310, form: 98, selectedPct: 92 },
  { id: 'p13', name: 'Sunil Narine', role: 'AR', team: 'team2', credits: 9.5, points: 275, form: 90, selectedPct: 78 },
  { id: 'p14', name: 'Shreyas Iyer', role: 'BAT', team: 'team2', credits: 10.0, points: 255, form: 86, selectedPct: 70 },
  { id: 'p15', name: 'Nitish Rana', role: 'BAT', team: 'team2', credits: 9.0, points: 215, form: 80, selectedPct: 55 },
  { id: 'p16', name: 'Venkatesh Iyer', role: 'AR', team: 'team2', credits: 9.0, points: 205, form: 75, selectedPct: 50 },
  { id: 'p17', name: 'Rinku Singh', role: 'BAT', team: 'team2', credits: 8.5, points: 195, form: 85, selectedPct: 65 },
  { id: 'p18', name: 'Phil Salt', role: 'WK', team: 'team2', credits: 9.0, points: 230, form: 82, selectedPct: 60 },
  { id: 'p19', name: 'Mitchell Starc', role: 'BOWL', team: 'team2', credits: 10.0, points: 250, form: 88, selectedPct: 72 },
  { id: 'p20', name: 'Varun Chakaravarthy', role: 'BOWL', team: 'team2', credits: 9.0, points: 215, form: 78, selectedPct: 48 },
  { id: 'p21', name: 'Harshit Rana', role: 'BOWL', team: 'team2', credits: 8.0, points: 170, form: 68, selectedPct: 32 },
  { id: 'p22', name: 'Rahmanullah Gurbaz', role: 'WK', team: 'team2', credits: 7.5, points: 155, form: 60, selectedPct: 22 },
];

const ROLE_CONFIG: Record<Role, { label: string; color: string; min: number; max: number; icon: string }> = {
  WK: { label: 'Wicket Keeper', color: '#FF6B6B', min: 1, max: 4, icon: '🧤' },
  BAT: { label: 'Batsman', color: '#4ECDC4', min: 1, max: 4, icon: '🏏' },
  AR: { label: 'All Rounder', color: '#FFD93D', min: 1, max: 4, icon: '⚡' },
  BOWL: { label: 'Bowler', color: '#95E1D3', min: 1, max: 4, icon: '🎯' },
};

const BackIcon = ({ color = '#FFFFFF', size = 24 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M15 6 L9 12 L15 18"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = ({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.5} />
    <Path d="M12 7 V7.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M11 11 H12 V16 H13" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const CaptainIcon = ({ color = '#FFD700', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2 L13 9 L20 10 L14 14 L16 21 L12 17 L8 21 L10 14 L4 10 L11 9 Z"
      fill={color}
      stroke={color}
      strokeWidth={0.5}
    />
  </Svg>
);

export const ContestJoinScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }) => {
  const { toast, show } = useToast();

  // Route params with defaults
  const matchName = route?.params?.matchName || 'CHE vs KOL';
  const team1 = route?.params?.team1 || 'CHE';
  const team2 = route?.params?.team2 || 'KOL';
  const team1Color = route?.params?.team1Color || '#F7C42E';
  const team2Color = route?.params?.team2Color || '#3F2E84';
  const contestType = route?.params?.contestType || 'Mega Contest';
  const entryFee = route?.params?.entryFee || 49;

  const [activeRole, setActiveRole] = useState<Role | 'ALL'>('ALL');
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);

  // Filter players by role
  const filteredPlayers = useMemo(() => {
    if (activeRole === 'ALL') return MOCK_PLAYERS;
    return MOCK_PLAYERS.filter((p) => p.role === activeRole);
  }, [activeRole]);

  // Count selected by role
  const selectedCountByRole = useMemo(() => {
    const counts: Record<Role, number> = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
    selectedPlayers.forEach((id) => {
      const player = MOCK_PLAYERS.find((p) => p.id === id);
      if (player) counts[player.role]++;
    });
    return counts;
  }, [selectedPlayers]);

  // Calculate total credits used
  const totalCredits = useMemo(() => {
    let total = 0;
    selectedPlayers.forEach((id) => {
      const player = MOCK_PLAYERS.find((p) => p.id === id);
      if (player) total += player.credits;
    });
    return total;
  }, [selectedPlayers]);

  const remainingCredits = 100 - totalCredits;
  const totalSelected = selectedPlayers.size;
  const maxPlayers = 11;

  const handlePlayerToggle = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);

    if (newSelected.has(playerId)) {
      // Deselect
      newSelected.delete(playerId);
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
    } else {
      // Select
      if (newSelected.size >= maxPlayers) {
        show(`Maximum ${maxPlayers} players allowed`);
        return;
      }
      newSelected.add(playerId);
    }

    setSelectedPlayers(newSelected);
  };

  const handleCaptainToggle = (playerId: string) => {
    if (!selectedPlayers.has(playerId)) {
      show('Select player first');
      return;
    }
    if (captain === playerId) {
      setCaptain(null);
    } else {
      if (viceCaptain === playerId) setViceCaptain(null);
      setCaptain(playerId);
    }
  };

  const handleViceCaptainToggle = (playerId: string) => {
    if (!selectedPlayers.has(playerId)) {
      show('Select player first');
      return;
    }
    if (viceCaptain === playerId) {
      setViceCaptain(null);
    } else {
      if (captain === playerId) setCaptain(null);
      setViceCaptain(playerId);
    }
  };

  const handleContinue = () => {
    if (totalSelected !== maxPlayers) {
      show(`Select ${maxPlayers - totalSelected} more player(s)`);
      return;
    }
    if (!captain) {
      show('Choose a captain (C)');
      return;
    }
    if (!viceCaptain) {
      show('Choose a vice-captain (VC)');
      return;
    }
    show(`Joining ${contestType} for ₹${entryFee}...`);
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      show('Cannot go back');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Team</Text>
            <Text style={styles.headerSubtitle}>{matchName}</Text>
          </View>
          <TouchableOpacity style={styles.infoBtn} onPress={() => show('Team selection rules')} activeOpacity={0.7}>
            <InfoIcon />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSelected}</Text>
            <Text style={styles.statLabel}>of {maxPlayers}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.brand.red }]}>
              {Object.entries(selectedCountByRole).map(([role, count]) =>
                `${ROLE_CONFIG[role as Role].label.charAt(0)}: ${count}`
              ).join('  ')}
            </Text>
            <Text style={styles.statLabel}>by role</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: remainingCredits < 5 ? colors.brand.red : colors.text.primary }]}>
              {remainingCredits.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>credits left</Text>
          </View>
        </View>

        {/* Role Tabs */}
        <View style={styles.roleTabsRow}>
          <TouchableOpacity
            style={[styles.roleTab, activeRole === 'ALL' && styles.roleTabActive]}
            onPress={() => setActiveRole('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.roleTabText, activeRole === 'ALL' && styles.roleTabTextActive]}>ALL</Text>
            <Text style={styles.roleTabCount}>{MOCK_PLAYERS.length}</Text>
          </TouchableOpacity>
          {(['WK', 'BAT', 'AR', 'BOWL'] as Role[]).map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleTab, activeRole === role && styles.roleTabActive]}
              onPress={() => setActiveRole(role)}
              activeOpacity={0.7}
            >
              <Text style={[styles.roleTabText, activeRole === role && styles.roleTabTextActive]}>
                {role}
              </Text>
              <Text style={styles.roleTabCount}>
                {selectedCountByRole[role]}/{ROLE_CONFIG[role].max}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Player List */}
        <View style={styles.playerList}>
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayers.has(player.id);
            const isCaptain = captain === player.id;
            const isViceCaptain = viceCaptain === player.id;
            const roleConfig = ROLE_CONFIG[player.role];

            return (
              <View key={player.id} style={[styles.playerCard, isSelected && styles.playerCardSelected]}>
                {/* Left: Player info */}
                <View style={styles.playerInfo}>
                  <View style={[styles.playerAvatar, { backgroundColor: player.team === 'team1' ? team1Color : team2Color }]}>
                    <Text style={styles.playerAvatarText}>
                      {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleConfig.color }]}>
                      <Text style={styles.roleBadgeText}>{player.role}</Text>
                    </View>
                  </View>
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {player.name}
                      {isCaptain && '  '}
                      {isViceCaptain && '  '}
                    </Text>
                    {isCaptain && <Text style={styles.captainLabel}>C • 2x points</Text>}
                    {isViceCaptain && <Text style={styles.viceCaptainLabel}>VC • 1.5x points</Text>}
                    {!isCaptain && !isViceCaptain && (
                      <Text style={styles.playerMeta}>
                        {roleConfig.label} • {player.team === 'team1' ? team1 : team2}
                      </Text>
                    )}
                    <View style={styles.playerStats}>
                      <View style={styles.playerStatItem}>
                        <Text style={styles.statTextSmall}>Sel</Text>
                        <Text style={styles.statValueSmall}>{player.selectedPct}%</Text>
                      </View>
                      <View style={styles.playerStatItem}>
                        <Text style={styles.statTextSmall}>Form</Text>
                        <Text style={styles.statValueSmall}>{player.form}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right: Credits & actions */}
                <View style={styles.playerActions}>
                  <Text style={styles.credits}>{player.credits}</Text>
                  <Text style={styles.creditsLabel}>CR</Text>
                  <View style={styles.actionButtons}>
                    {isSelected && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionBtn, isCaptain ? styles.actionBtnActive : styles.actionBtnInactive]}
                          onPress={() => handleCaptainToggle(player.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnText, isCaptain && styles.actionBtnTextActive]}>C</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, isViceCaptain ? styles.actionBtnActive : styles.actionBtnInactive]}
                          onPress={() => handleViceCaptainToggle(player.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnText, isViceCaptain && styles.actionBtnTextActive]}>VC</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      style={[styles.selectBtn, isSelected ? styles.selectBtnActive : styles.selectBtnInactive]}
                      onPress={() => handlePlayerToggle(player.id)}
                      activeOpacity={0.7}
                    >
                      {isSelected ? (
                        <Path
                          d="M5 12 L10 17 L20 7"
                          stroke="#FFFFFF"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      ) : (
                        <Text style={styles.selectBtnText}>+</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoLabel}>Entry Fee</Text>
          <Text style={styles.bottomInfoValue}>₹{entryFee}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            totalSelected === maxPlayers && captain && viceCaptain ? styles.continueBtnActive : styles.continueBtnInactive,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>JOIN CONTEST</Text>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path
              d="M9 6 L15 12 L9 18"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.panel,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.subtle,
  },

  // Role tabs
  roleTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 6,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.surface.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  roleTabActive: {
    backgroundColor: colors.brand.red,
    borderColor: colors.brand.red,
  },
  roleTabText: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  roleTabTextActive: {
    color: colors.text.onRed,
  },
  roleTabCount: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },

  // Player list
  playerList: {
    paddingHorizontal: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.panel,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  playerCardSelected: {
    borderColor: colors.brand.red,
    backgroundColor: 'rgba(206, 64, 77, 0.08)',
  },

  // Player info
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playerAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surface.bg,
  },
  roleBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: colors.text.primary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  playerMeta: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  captainLabel: {
    color: colors.brand.gold,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 1,
  },
  viceCaptainLabel: {
    color: '#3F8FFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 1,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  playerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statTextSmall: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  statValueSmall: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: '800',
  },

  // Player actions
  playerActions: {
    alignItems: 'center',
    gap: 4,
  },
  credits: {
    color: colors.brand.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  creditsLabel: {
    color: colors.text.muted,
    fontSize: 8,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionBtnInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border.subtle,
  },
  actionBtnActive: {
    backgroundColor: colors.brand.gold,
    borderColor: colors.brand.gold,
  },
  actionBtnText: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  actionBtnTextActive: {
    color: '#000000',
  },
  selectBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  selectBtnInactive: {
    backgroundColor: 'rgba(206, 64, 77, 0.15)',
    borderColor: colors.brand.red,
  },
  selectBtnActive: {
    backgroundColor: colors.brand.red,
    borderColor: colors.brand.red,
  },
  selectBtnText: {
    color: colors.brand.red,
    fontSize: 18,
    fontWeight: '900',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.inputDeep,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  bottomInfo: {
    flex: 1,
  },
  bottomInfoLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomInfoValue: {
    color: colors.brand.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  continueBtnActive: {
    backgroundColor: colors.brand.red,
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  continueBtnInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 24,
    right: 24,
    backgroundColor: colors.surface.panelElevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
  },
  toastText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});