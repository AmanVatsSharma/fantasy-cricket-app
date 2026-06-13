/**
 * File:        mobile/src/app/screens/HomeScreen.tsx
 * Module:      Mobile · Home Screen
 * Purpose:     Main post-login home page with header, sports nav, hero
 *              carousel, upcoming matches, recommended contests, and a
 *              4-up "Why 11Dreamer" promo grid. Bottom 5-tab bar.
 *
 * Exports:
 *   - HomeScreen — primary screen in the post-login flow
 *
 * Depends on:
 *   - react-native, react-native-svg
 *   - ../components/Toast
 *   - ../components/HomeTabBar
 *   - ../theme/colors
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path, Circle, Rect, G, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import { useToast } from '../components/Toast';
import { HomeTabBar, HomeTabName } from '../components/HomeTabBar';
import { useDrawer } from '../../..';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ------------------------------------------------------------------ *
 *  Mock data
 * ------------------------------------------------------------------ */

const MOCK_MATCHES = [
  {
    id: '1',
    teamA: { abbr: 'CHE', name: 'Chennai', color: '#F7C42E', textColor: '#1A1A22' },
    teamB: { abbr: 'KOL', name: 'Kolkata', color: '#3F2E84', textColor: '#FFFFFF' },
    startsIn: '2h 15m',
    time: 'Today, 8:00 PM',
    contestName: 'Mega Contest',
    prizePool: '₹50 Crores',
    entryFee: '₹49',
  },
  {
    id: '2',
    teamA: { abbr: 'HYD', name: 'Hyderabad', color: '#F86A1B', textColor: '#FFFFFF' },
    teamB: { abbr: 'MUM', name: 'Mumbai', color: '#004BA0', textColor: '#FFFFFF' },
    startsIn: '4h 45m',
    time: 'Today, 10:30 PM',
    contestName: 'Mega Contest',
    prizePool: '₹25 Crores',
    entryFee: '₹29',
  },
];

const MOCK_CONTESTS = [
  {
    id: 'c1',
    icon: 'trophy' as const,
    iconColor: colors.brand.gold,
    name: 'Mega Contest',
    prize: '₹50 Crores',
    entry: '₹49',
    filledPct: 50,
  },
  {
    id: 'c2',
    icon: 'shield2' as const,
    iconColor: '#9C5BD8',
    name: 'Head to Head',
    prize: '₹5 Lakhs',
    entry: '₹25',
    filledPct: 32,
  },
  {
    id: 'c3',
    icon: 'shieldM' as const,
    iconColor: '#3F8FFF',
    name: 'Mini Grand',
    prize: '₹2 Lakhs',
    entry: '₹15',
    filledPct: 65,
  },
  {
    id: 'c4',
    icon: 'star' as const,
    iconColor: colors.brand.red,
    name: 'Hot Contest',
    prize: '₹1 Lakh',
    entry: '₹10',
    filledPct: 20,
  },
];

const HERO_SLIDES = [
  {
    badge: 'NEW SEASON',
    title: 'PLAY BOLD. WIN MORE.',
    subtitle: 'Make your team. Be a champion.',
  },
  {
    badge: 'CRORE CONTESTS',
    title: 'JOIN CRORE CONTESTS INSTANTLY.',
    subtitle: 'Top contests, fastest payouts.',
  },
  {
    badge: 'LIVE',
    title: 'FOLLOW LIVE. CHEER. EARN.',
    subtitle: 'Watch every ball, every run.',
  },
  {
    badge: 'INDIA',
    title: "INDIA'S BIGGEST CRICKET FANTASY",
    subtitle: '10 Crore+ players. Are you in?',
  },
];

const SPORTS = [
  { name: 'Cricket', key: 'cricket', active: true, comingSoon: false },
  { name: 'Football', key: 'football', active: false, comingSoon: true },
  { name: 'Kabaddi', key: 'kabaddi', active: false, comingSoon: true },
  { name: 'Basketball', key: 'basketball', active: false, comingSoon: true },
];

const WHY_DREAMER = [
  { icon: 'shield', color: colors.brand.red, title: '100% Safe & Secure', sub: 'Bank-level security' },
  { icon: 'trophy', color: colors.brand.red, title: 'Big Winnings Every Day', sub: 'Daily cash prizes' },
  { icon: 'users', color: colors.brand.red, title: '10 Crore+ Users', sub: 'A large fan base' },
  { icon: 'headset', color: colors.brand.red, title: '24x7 Support', sub: 'We are always here' },
];

const POPULAR_TOURNAMENTS = [
  {
    id: 't1',
    name: 'Indian T20 League',
    prize: '₹150 Crores',
    matches: 245,
  },
  {
    id: 't2',
    name: 'ICC World Cup',
    prize: '₹200 Crores',
    matches: 48,
  },
  {
    id: 't3',
    name: 'T20 World Cup',
    prize: '₹75 Crores',
    matches: 55,
  },
  {
    id: 't4',
    name: 'The Hundred',
    prize: '₹10 Crores',
    matches: 8,
  },
];

const HOW_TO_PLAY = [
  { step: 1, title: 'Join a Contest', icon: 'plus' },
  { step: 2, title: 'Create Your Team', icon: 'users' },
  { step: 3, title: 'Score Points', icon: 'trophy' },
  { step: 4, title: 'Win Big', icon: 'money' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Rohit Sharma', points: '5,230', earnings: '₹1,00,000' },
  { rank: 2, name: 'Virat Kohli', points: '5,120', earnings: '₹75,000' },
  { rank: 3, name: 'Fantasy Master', points: '4,985', earnings: '₹50,000' },
];

/* ------------------------------------------------------------------ *
 *  Sub-components
 * ------------------------------------------------------------------ */

const Wordmark: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const fontSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  return (
    <View style={styles.wordmark}>
      <View style={styles.wordmarkEleven}>
        <Text style={[styles.wordmarkElevenText, { fontSize: fontSize + 2 }]}>11</Text>
      </View>
      <Text style={[styles.wordmarkDreamer, { fontSize, fontStyle: 'italic' }]}>DREAMER</Text>
    </View>
  );
};

const CricketBallIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = colors.brand.red,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill={color} />
    <Path
      d="M5 8 C8 10 16 10 19 8 M5 16 C8 14 16 14 19 16"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </Svg>
);

const FootballIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = colors.text.muted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.6} />
    <Path
      d="M12 3 L15 9 L12 12 L9 9 Z M12 21 L15 15 L12 12 L9 15 Z M3 12 L9 9 L12 12 L9 15 Z M21 12 L15 9 L12 12 L15 15 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </Svg>
);

const BasketballIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = colors.text.muted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.6} />
    <Path d="M3 12 H21" stroke={color} strokeWidth={1.4} />
    <Path d="M12 3 C8 8 8 16 12 21" fill="none" stroke={color} strokeWidth={1.4} />
    <Path d="M12 3 C16 8 16 16 12 21" fill="none" stroke={color} strokeWidth={1.4} />
  </Svg>
);

const KabaddiIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = colors.text.muted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={6} r={2.4} fill="none" stroke={color} strokeWidth={1.6} />
    <Path d="M5 22 C5 17 7 13 12 13 C17 13 19 17 19 22" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Path d="M9 13 L11 18 L13 13" fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
  </Svg>
);

const PlusIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={11} fill={color} />
    <Path d="M12 7 V17 M7 12 H17" stroke={colors.brand.red} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const MoneyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = colors.brand.red }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill={colors.brand.red} opacity={0.15} />
    <Circle cx={12} cy={12} r={10} fill="none" stroke={color} strokeWidth={1.6} />
    <SvgText x="12" y="16" textAnchor="middle" fontSize="14" fontWeight="900" fill={color} fontFamily="System">₹</SvgText>
  </Svg>
);

const GiftIcon: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <Svg width={size} height={size} viewBox="0 0 56 56">
    <Rect x={6} y={22} width={44} height={28} rx={2} fill={colors.brand.gold} />
    <Rect x={6} y={18} width={44} height={6} fill="#B89015" />
    <Rect x={25} y={18} width={6} height={32} fill={colors.brand.red} />
    <Path d="M15 18 C11 18 9 14 11 11 C13 8 17 10 17 14 L17 18" fill={colors.brand.gold} stroke="#B89015" strokeWidth={1.4} />
    <Path d="M41 18 C45 18 47 14 45 11 C43 8 39 10 39 14 L39 18" fill={colors.brand.gold} stroke="#B89015" strokeWidth={1.4} />
    <Path d="M10 26 H46" stroke="#B89015" strokeWidth={1} opacity={0.5} />
  </Svg>
);

const ShareIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M16 7 L21 12 L16 17" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 12 H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const TournamentTrophy: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path d="M14 8 H34 V20 C34 27 28 30 24 30 C20 30 14 27 14 20 V8 Z" fill={colors.brand.gold} stroke="#B89015" strokeWidth={1.5} strokeLinejoin="round" />
    <Path d="M14 12 H8 C8 17 11 20 14 20" fill="none" stroke={colors.brand.gold} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M34 12 H40 C40 17 37 20 34 20" fill="none" stroke={colors.brand.gold} strokeWidth={1.5} strokeLinecap="round" />
    <Rect x={18} y={30} width={12} height={5} fill={colors.brand.gold} />
    <Rect x={16} y={35} width={16} height={4} rx={1.5} fill={colors.brand.gold} />
    <Rect x={14} y={39} width={20} height={3} rx={1.5} fill={colors.brand.gold} />
  </Svg>
);

const LeaderIcon: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Path d="M5 5 L12 3 L19 5 L19 12 C19 16 16 18 12 19 C8 18 5 16 5 12 Z" fill={colors.brand.gold} stroke="#B89015" strokeWidth={1.2} />
        <SvgText x="12" y="14" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" fontFamily="System">1</SvgText>
      </Svg>
    );
  }
  if (rank === 2) {
    return (
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Path d="M5 5 L12 3 L19 5 L19 12 C19 16 16 18 12 19 C8 18 5 16 5 12 Z" fill="#C0C0C0" stroke="#888888" strokeWidth={1.2} />
        <SvgText x="12" y="14" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" fontFamily="System">2</SvgText>
      </Svg>
    );
  }
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path d="M5 5 L12 3 L19 5 L19 12 C19 16 16 18 12 19 C8 18 5 16 5 12 Z" fill="#CD7F32" stroke="#8B5A2B" strokeWidth={1.2} />
      <SvgText x="12" y="14" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" fontFamily="System">3</SvgText>
    </Svg>
  );
};

const BellIcon: React.FC<{ color?: string }> = ({ color = colors.text.primary }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M6 17 L6 11 C6 7.5 8.5 5 12 5 C15.5 5 18 7.5 18 11 V17 L20 19 H4 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path d="M10 21 C10.5 22 11 22 12 22 C13 22 13.5 22 14 21" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx={17.5} cy={6} r={2.5} fill={colors.brand.red} />
  </Svg>
);

const MenuIcon: React.FC<{ color?: string }> = ({ color = colors.text.primary }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path d="M4 7 H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M4 12 H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M4 17 H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ProfileIcon: React.FC<{ color?: string }> = ({ color = colors.text.primary }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={4} fill="none" stroke={color} strokeWidth={1.8} />
    <Path
      d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const TrophyIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7 4 H17 V9 C17 12 14.5 14 12 14 C9.5 14 7 12 7 9 V4 Z"
      fill={color}
      opacity={0.2}
    />
    <Path
      d="M7 4 H17 V9 C17 12 14.5 14 12 14 C9.5 14 7 12 7 9 V4 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Rect x={9} y={14} width={6} height={3} fill={color} />
    <Rect x={8} y={17} width={8} height={2.5} rx={1} fill={color} />
  </Svg>
);

const ContestCardIcon: React.FC<{ kind: 'trophy' | 'shield2' | 'shieldM' | 'star'; color: string; size?: number }> = ({
  kind,
  color,
  size = 36,
}) => {
  if (kind === 'trophy') return <TrophyIcon color={color} size={size} />;
  if (kind === 'star') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 3 L14.5 9 L21 9.5 L16 14 L17.5 21 L12 17.5 L6.5 21 L8 14 L3 9.5 L9.5 9 Z"
          fill={color}
          opacity={0.25}
        />
        <Path
          d="M12 3 L14.5 9 L21 9.5 L16 14 L17.5 21 L12 17.5 L6.5 21 L8 14 L3 9.5 L9.5 9 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (kind === 'shield2') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z"
          fill={color}
          opacity={0.25}
        />
        <Path
          d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <SvgLetter text="2" color={color} x={12} y={15} size={11} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z"
        fill={color}
        opacity={0.25}
      />
      <Path
        d="M12 3 L20 6 V13 C20 17 16 20 12 21 C8 20 4 17 4 13 V6 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <SvgLetter text="M" color={color} x={12} y={15} size={10} />
    </Svg>
  );
};

const SvgLetter: React.FC<{ text: string; color: string; x: number; y: number; size: number }> = ({
  text,
  color,
  x,
  y,
  size,
}) => (
  <SvgText
    x={x}
    y={y}
    textAnchor="middle"
    fontSize={size}
    fontWeight="900"
    fill={color}
    fontFamily="System"
  >
    {text}
  </SvgText>
);

const WhyIcon: React.FC<{ kind: string; color: string; size?: number }> = ({ kind, color, size = 28 }) => {
  switch (kind) {
    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2 L21 6 V12 C21 17 17 21 12 22 C7 21 3 17 3 12 V6 Z" fill={color} opacity={0.2} />
          <Path
            d="M12 2 L21 6 V12 C21 17 17 21 12 22 C7 21 3 17 3 12 V6 Z"
            fill="none"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <Path
            d="M9 12 L11 14 L15 10"
            fill="none"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'trophy':
      return <TrophyIcon color={color} size={size} />;
    case 'users':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={9} cy={8} r={3.2} fill="none" stroke={color} strokeWidth={1.6} />
          <Circle cx={15.5} cy={8} r={2.5} fill="none" stroke={color} strokeWidth={1.6} />
          <Path d="M3 19 C3 15.5 5.5 13 9 13 C12.5 13 15 15.5 15 19" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
          <Path d="M15 19 C15 16 17 14 19.5 14 C21 14 22 14.5 22 15.5" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case 'headset':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M4 14 V12 C4 7.5 7.5 4 12 4 C16.5 4 20 7.5 20 12 V14"
            fill="none"
            stroke={color}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <Rect x={3} y={14} width={4} height={6} rx={1.5} fill="none" stroke={color} strokeWidth={1.6} />
          <Rect x={17} y={14} width={4} height={6} rx={1.5} fill="none" stroke={color} strokeWidth={1.6} />
          <Path d="M19 20 V21 C19 22 18 22 17 22 H14" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
  }
  return null;
};

/* ------------------------------------------------------------------ *
 *  Hero batter silhouette — back-of-player with red jersey "DREAMER 11"
 * ------------------------------------------------------------------ */

const BatterSilhouette: React.FC<{ height?: number }> = ({ height = 220 }) => {
  // The viewBox is wider than tall (180×200) so the player is on the
  // right side of the hero banner. Coordinates are intentionally
  // exaggerated to read as athletic and dynamic at small sizes.
  return (
    <Svg width={180} height={height} viewBox="0 0 180 200">
      <Defs>
        <LinearGradient id="jerseyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E04A5C" />
          <Stop offset="1" stopColor="#A31924" />
        </LinearGradient>
        <LinearGradient id="helmetGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2A2A2A" />
          <Stop offset="1" stopColor="#0A0A0A" />
        </LinearGradient>
      </Defs>

      {/* Bat (held in right hand, behind the body) */}
      <G>
        <Rect x={120} y={70} width={6} height={120} rx={2} fill="#D4A574" transform="rotate(-12 123 130)" />
        <Rect x={119} y={65} width={8} height={12} rx={1.5} fill="#3D2817" transform="rotate(-12 123 71)" />
      </G>

      {/* Right arm (holding bat) */}
      <Path
        d="M105 90 L122 80 L130 95 L115 110 Z"
        fill="#C9854D"
        stroke="#8B5A2B"
        strokeWidth={0.8}
      />

      {/* Left arm */}
      <Path
        d="M65 88 L52 92 L48 108 L62 110 Z"
        fill="#C9854D"
        stroke="#8B5A2B"
        strokeWidth={0.8}
      />

      {/* Torso / Jersey (red, "DREAMER 11" printed) */}
      <Path
        d="M58 80 L112 80 L120 175 L50 175 Z"
        fill="url(#jerseyGrad)"
        stroke="#5A0F18"
        strokeWidth={1}
        strokeLinejoin="round"
      />

      {/* Jersey shoulder seams */}
      <Path d="M58 80 L70 88" stroke="#5A0F18" strokeWidth={0.8} />
      <Path d="M112 80 L100 88" stroke="#5A0F18" strokeWidth={0.8} />

      {/* "DREAMER 11" text on the back */}
      <SvgText
        x="85"
        y="125"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fill="#FFFFFF"
        fontFamily="System"
        letterSpacing="0.5"
      >
        DREAMER 11
      </SvgText>

      {/* Number "11" small badge below text */}
      <SvgText
        x="85"
        y="155"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fill="#FFFFFF"
        fontFamily="System"
      >
        11
      </SvgText>

      {/* Neck */}
      <Rect x={78} y={66} width={14} height={16} fill="#C9854D" />

      {/* Helmet (back view — round, with grille hint) */}
      <Path
        d="M62 50 C62 35 75 28 85 28 C95 28 108 35 108 50 L108 70 L62 70 Z"
        fill="url(#helmetGrad)"
        stroke="#000000"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {/* Helmet grille hint (subtle vertical line) */}
      <Path d="M85 28 L85 70" stroke="#444" strokeWidth={1} opacity={0.4} />

      {/* Helmet top accent (red stripe) */}
      <Path
        d="M62 44 C75 38 95 38 108 44"
        fill="none"
        stroke="#CE404D"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Helmet peak/visor (visible from back) */}
      <Path
        d="M62 50 L108 50 L108 56 L62 56 Z"
        fill="#1A1A1A"
        opacity={0.6}
      />
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 *  Main screen
 * ------------------------------------------------------------------ */

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { toast, show } = useToast();
  const nav = useNavigation();
  const { openDrawer } = useDrawer();
  const [activeTab, setActiveTab] = useState<HomeTabName>('home');

  const [sport, setSport] = useState<'cricket' | 'football' | 'basketball'>('cricket');
  const [activeSlide, setActiveSlide] = useState(0);
  const slideScrollRef = useRef<ScrollView>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const userInteracting = useRef(false);

  // Autoplay the hero carousel
  useEffect(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (userInteracting.current) return;
      setActiveSlide((prev) => {
        const next = (prev + 1) % HERO_SLIDES.length;
        slideScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, []);

  const handleSlideScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_WIDTH);
    if (idx !== activeSlide) setActiveSlide(idx);
  };

  const handleSlideBeginDrag = () => {
    userInteracting.current = true;
  };
  const handleSlideEndDrag = () => {
    // resume autoplay after 2s of idle
    setTimeout(() => {
      userInteracting.current = false;
    }, 2000);
  };

  const handleTabChange = (tab: HomeTabName) => {
    setActiveTab(tab);

    if (tab === 'home') {
      // Tapping the Home tab from anywhere in the stack (MyContests,
      // ContestLobby, ContestJoin, etc.) collapses the navigator back
      // to the root so the user always lands on Home. If we're
      // already on Home this is a no-op, which is the standard
      // behavior of bottom-tab "home" affordances.
      if ((nav as any).canGoBack?.() || (nav as any).getCurrentRoute?.()?.name !== 'Home') {
        (nav as any).popToTop?.();
      }
      return;
    }

    if (tab === 'contests') {
      (nav as any).navigate('MyContests');
      return;
    }

    // Teams / Wallet / More aren't wired up yet — surface a toast so
    // the user knows the tap registered.
    const labels: Record<HomeTabName, string> = {
      home: 'Home',
      contests: 'My Contests',
      teams: 'My Teams',
      wallet: 'Wallet',
      more: 'More',
    };
    show(`${labels[tab]} coming soon`);
  };

  const handleSportChange = (s: 'cricket' | 'football' | 'basketball') => {
    setSport(s);
    if (s !== 'cricket') {
      show(`${s === 'football' ? 'Football' : 'Basketball'} coming soon`);
    }
  };

  const handleMatchJoin = (matchName: string) => {
    show(`Joining ${matchName}…`);
  };

  const handlePlayNow = () => {
    show('Opening contests…');
  };

  const topPadding = Platform.OS === 'ios' ? insets.top : 20;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding, paddingBottom: 96 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer} activeOpacity={0.7}>
            <MenuIcon />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Wordmark size="md" />
            <View style={styles.walletPill}>
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Rect x={3} y={6} width={18} height={13} rx={2} fill="none" stroke={colors.brand.gold} strokeWidth={1.8} />
                <Circle cx={17} cy={12.5} r={1} fill={colors.brand.gold} />
              </Svg>
              <Text style={styles.walletAmount}>₹125.50</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => show('No new notifications')}>
              <BellIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => show('Profile coming soon')}>
              <ProfileIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sports nav */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportsRow}
          contentContainerStyle={styles.sportsRowContent}
        >
          {SPORTS.map((s) => {
            const Icon =
              s.key === 'cricket' ? CricketBallIcon : s.key === 'football' ? FootballIcon : s.key === 'kabaddi' ? KabaddiIcon : BasketballIcon;
            const active = sport === s.key;
            return (
              <TouchableOpacity
                key={s.name}
                style={[styles.sportPill, active && styles.sportPillActive]}
                onPress={() => handleSportChange(s.key as any)}
                activeOpacity={0.7}
              >
                <Icon size={14} color={active ? colors.brand.red : colors.text.muted} />
                <Text style={[styles.sportLabel, active && styles.sportLabelActive]}>{s.name}</Text>
                {s.comingSoon && (
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero carousel */}
        <View style={styles.heroWrap}>
          <ScrollView
            ref={slideScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleSlideScroll}
            onScrollBeginDrag={handleSlideBeginDrag}
            onScrollEndDrag={handleSlideEndDrag}
            scrollEventThrottle={16}
            style={styles.heroScroller}
          >
            {HERO_SLIDES.map((slide, i) => (
              <View key={i} style={[styles.heroSlide, { width: SCREEN_WIDTH - 32 }]}>
                <View style={styles.heroBg}>
                  <View style={[styles.heroGlow, styles.heroGlow1]} />
                  <View style={[styles.heroGlow, styles.heroGlow2]} />
                </View>
                <View style={styles.heroSilhouette}>
                  <BatterSilhouette height={210} />
                </View>
                <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{slide.badge}</Text>
                  </View>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  <TouchableOpacity style={styles.heroPlayBtn} activeOpacity={0.85} onPress={handlePlayNow}>
                    <Text style={styles.heroPlayBtnText}>PLAY NOW</Text>
                    <Svg width={14} height={14} viewBox="0 0 24 24">
                      <Path d="M9 6 L15 12 L9 18" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.dotsRow}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeSlide ? colors.brand.red : 'rgba(255,255,255,0.3)',
                    width: i === activeSlide ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Matches</Text>
            <TouchableOpacity onPress={() => show('View all matches')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {MOCK_MATCHES.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.matchCard}
              activeOpacity={0.85}
              onPress={() => handleMatchJoin(`${m.teamA.abbr} vs ${m.teamB.abbr}`)}
            >
<View style={styles.matchCardTop}>
                {/* Team A */}
                <View style={styles.matchTeam}>
                  <View style={[styles.teamBadge, { backgroundColor: m.teamA.color }]}> 
                    <Text style={[styles.teamBadgeText, { color: m.teamA.textColor }]}>{m.teamA.abbr}</Text>
                  </View>
                  <Text style={styles.teamName}>{m.teamA.name}</Text>
                </View>

                {/* Center: time + vs */}
                <View style={styles.matchCenter}>
                  <Text style={styles.matchStarts}>{m.startsIn}</Text>
                  <Text style={styles.matchTime}>{m.time}</Text>
                  <Text style={styles.matchVs}>VS</Text>
                </View>

                {/* Team B */}
                <View style={styles.matchTeam}>
                  <Text style={styles.teamName}>{m.teamB.name}</Text>
                  <View style={[styles.teamBadge, { backgroundColor: m.teamB.color }]}> 
                    <Text style={[styles.teamBadgeText, { color: m.teamB.textColor }]}>{m.teamB.abbr}</Text>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.matchDivider} />

              {/* Bottom: contest + prize + CTA */}
              <View style={styles.matchFooter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contestName}>{m.contestName}</Text>
                  <Text style={styles.prizePool}>Winnings {m.prizePool}</Text>
                </View>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => handleMatchJoin(`${m.teamA.abbr} vs ${m.teamB.abbr}`)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.joinBtnText}>JOIN {m.entryFee}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Contests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Contests</Text>
            <TouchableOpacity onPress={() => show('View all contests')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contestsRow}
          >
            {MOCK_CONTESTS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.contestCard}
                activeOpacity={0.85}
                onPress={() => handleMatchJoin(c.name)}
              >
                <ContestCardIcon kind={c.icon} color={c.iconColor} size={42} />
                <Text style={styles.contestCardName}>{c.name}</Text>
                <Text style={styles.contestCardPrize}>{c.prize}</Text>
                <Text style={styles.contestCardPrizeLabel}>Winnings</Text>
                {/* Fill progress bar */}
                <View style={styles.contestProgressTrack}>
                  <View
                    style={[
                      styles.contestProgressFill,
                      { width: `${c.filledPct}%`, backgroundColor: c.filledPct >= 60 ? colors.brand.red : colors.brand.gold },
                    ]}
                  />
                </View>
                <Text style={styles.contestProgressLabel}>{c.filledPct}% Filled</Text>
                <View style={styles.contestJoinBtn}>
                  <Text style={styles.contestJoinText}>JOIN ₹{c.entry.replace('₹', '')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Tournaments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Tournaments</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => show('Tournaments: coming soon')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tournamentsRow}
          >
            {POPULAR_TOURNAMENTS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.tournamentCard}
                activeOpacity={0.85}
                onPress={() => show(`${t.name} — ${t.prize}`)}
              >
                <TournamentTrophy size={40} />
                <Text style={styles.tournamentName}>{t.name}</Text>
                <View style={styles.tournamentMetaRow}>
                  <Text style={styles.tournamentPrize}>{t.prize}</Text>
                  <Text style={styles.tournamentDot}>·</Text>
                  <Text style={styles.tournamentMatches}>{t.matches} Matches</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* How to Play */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>How to Play 11Dreamer?</Text>
          <View style={styles.howToPlayRow}>
            {HOW_TO_PLAY.map((h, idx) => (
              <View key={h.step} style={styles.howCell}>
                <View style={styles.howIconWrap}>
                  {h.icon === 'plus' && <PlusIcon size={28} />}
                  {h.icon === 'users' && <WhyIcon kind="users" color={colors.brand.red} size={28} />}
                  {h.icon === 'trophy' && <WhyIcon kind="trophy" color={colors.brand.red} size={28} />}
                  {h.icon === 'money' && <MoneyIcon size={28} color={colors.brand.red} />}
                </View>
                <Text style={styles.howStep}>Step {h.step}</Text>
                <Text style={styles.howTitle}>{h.title}</Text>
                {idx < HOW_TO_PLAY.length - 1 && (
                  <View style={styles.howArrow}>
                    <Svg width={14} height={14} viewBox="0 0 24 24">
                      <Path d="M9 6 L15 12 L9 18" fill="none" stroke={colors.brand.red} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Why 11Dreamer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Why 11Dreamer</Text>
          <View style={styles.whyGrid}>
            {WHY_DREAMER.map((w) => (
              <View key={w.title} style={styles.whyCell}>
                <View style={styles.whyIconWrap}>
                  <WhyIcon kind={w.icon} color={w.color} size={24} />
                </View>
                <Text style={styles.whyTitle}>{w.title}</Text>
                <Text style={styles.whySub}>{w.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Live Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Leaderboard</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => show('Leaderboard: full list coming soon')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {LEADERBOARD.map((l) => (
            <View key={l.rank} style={styles.leaderRow}>
              <LeaderIcon rank={l.rank} />
              <View style={styles.leaderAvatar}>
                <Svg width={36} height={36} viewBox="0 0 36 36">
                  <Circle cx={18} cy={14} r={6} fill={colors.brand.red} opacity={0.85} />
                  <Path d="M5 33 C5 25 11 21 18 21 C25 21 31 25 31 33" fill={colors.brand.red} opacity={0.85} />
                </Svg>
              </View>
              <View style={styles.leaderText}>
                <Text style={styles.leaderName}>{l.name}</Text>
                <Text style={styles.leaderPoints}>{l.points} Points</Text>
              </View>
              <Text style={styles.leaderEarnings}>{l.earnings}</Text>
            </View>
          ))}
        </View>

        {/* Referral Banner */}
        <TouchableOpacity
          style={styles.referralBanner}
          activeOpacity={0.9}
          onPress={() => show('Referral link copied!')}
        >
          <View style={styles.referralLeft}>
            <GiftIcon size={56} />
          </View>
          <View style={styles.referralText}>
            <Text style={styles.referralTitle}>Invite Your Friends & Earn</Text>
            <Text style={styles.referralSub}>
              Earn <Text style={styles.referralAmount}>₹100</Text> as your friend joins & plays!
            </Text>
          </View>
          <View style={styles.referralActions}>
            <View style={styles.referralInviteBtn}>
              <Text style={styles.referralInviteText}>INVITE NOW</Text>
            </View>
            <View style={styles.referralShareIcon}>
              <ShareIcon size={14} color={colors.text.primary} />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom tab bar */}
      <HomeTabBar activeTab={activeTab} onChange={handleTabChange} />

      {/* Toast */}
      {toast && (
        <Animated.View
          key={toast.key}
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity: 1,
            },
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
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
    paddingHorizontal: 16,
  },

  /* Wordmark */
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmarkEleven: {
    backgroundColor: colors.brand.red,
    paddingHorizontal: 4,
    borderRadius: 3,
    marginRight: 4,
  },
  wordmarkElevenText: {
    color: colors.text.onRed,
    fontWeight: '900',
  },
  wordmarkDreamer: {
    color: colors.text.primary,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginRight: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 189, 21, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 189, 21, 0.55)',
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Sports nav */
  sportsRow: {
    marginTop: 14,
  },
  sportsRowContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.surface.panel,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  sportPillActive: {
    borderColor: colors.brand.red,
    backgroundColor: 'rgba(206, 64, 77, 0.12)',
  },
  sportLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  sportLabelActive: {
    color: colors.brand.red,
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Hero */
  heroWrap: {
    marginTop: 14,
  },
  heroScroller: {
    borderRadius: 16,
  },
  heroSlide: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.brand.red,
    marginRight: 0,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGlow: {
    position: 'absolute',
    borderRadius: 999,
  },
  heroGlow1: {
    width: 240,
    height: 240,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -80,
    right: -60,
  },
  heroGlow2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 30,
    right: 20,
  },
  heroSilhouette: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: 210,
    width: 180,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  heroContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 10,
  },
  heroBadgeText: {
    color: colors.text.onRed,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: colors.text.onRed,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: colors.text.onRed,
    opacity: 0.9,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  heroPlayBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
    backgroundColor: colors.brand.red,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B7A',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  heroPlayBtnText: {
    color: colors.text.onRed,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },

  /* Section */
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  sectionLink: {
    color: colors.brand.red,
    fontSize: 11,
    fontWeight: '800',
  },

  /* Match card */
  matchCard: {
    backgroundColor: colors.surface.panel,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 14,
  },
  matchCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    gap: 16,
    alignSelf: 'stretch',
  },
  matchTeam: {
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
  },
  teamBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  teamName: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  matchCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    minWidth: 100,
  },
  matchStarts: {
    color: colors.brand.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  matchTime: {
    color: colors.text.secondary,
    fontSize: 9.5,
    marginTop: 2,
  },
  matchVs: {
    color: colors.brand.red,
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  matchDivider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.border.subtle,
    marginVertical: 14,
  },
  matchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  contestName: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  prizePool: {
    color: colors.brand.gold,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  joinBtn: {
    backgroundColor: colors.brand.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: colors.brand.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  joinBtnText: {
    color: colors.text.onRed,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  /* Contests */
  contestsRow: {
    paddingRight: 16,
    gap: 10,
  },
  contestCard: {
    width: 160,
    backgroundColor: colors.surface.panel,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  contestCardName: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  contestCardPrize: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  contestCardPrizeLabel: {
    color: colors.text.muted,
    fontSize: 9.5,
    marginTop: 1,
    marginBottom: 10,
  },
  contestProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  contestProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  contestProgressLabel: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 10,
  },
  contestJoinBtn: {
    backgroundColor: 'rgba(31, 168, 85, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.green,
  },
  contestJoinText: {
    color: colors.brand.green,
    fontSize: 11,
    fontWeight: '800',
  },

  /* Why 11Dreamer */
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  whyCell: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  whyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(206, 64, 77, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(206, 64, 77, 0.4)',
  },
  whyTitle: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
    width: '92%',
  },
  whySub: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
    width: '92%',
  },

  /* Popular Tournaments */
  tournamentsRow: {
    gap: 10,
    paddingRight: 16,
  },
  tournamentCard: {
    width: 170,
    backgroundColor: colors.surface.panel,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  tournamentName: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  tournamentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  tournamentPrize: {
    color: colors.brand.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  tournamentDot: {
    color: colors.text.muted,
    fontSize: 11,
  },
  tournamentMatches: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  /* How to Play */
  howToPlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  howCell: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  howIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(206, 64, 77, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(206, 64, 77, 0.4)',
  },
  howStep: {
    color: colors.text.muted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  howTitle: {
    color: colors.text.primary,
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 1,
    textAlign: 'center',
  },
  howArrow: {
    position: 'absolute',
    right: -8,
    top: 17,
  },

  /* Live Leaderboard */
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.panel,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  leaderAvatar: {
    marginLeft: 8,
    marginRight: 10,
  },
  leaderText: {
    flex: 1,
  },
  leaderName: {
    color: colors.text.primary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  leaderPoints: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  leaderEarnings: {
    color: colors.brand.green,
    fontSize: 12,
    fontWeight: '900',
  },

  /* Referral Banner */
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(206, 64, 77, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(206, 64, 77, 0.4)',
    padding: 14,
    marginBottom: 24,
  },
  referralLeft: {
    marginRight: 12,
  },
  referralText: {
    flex: 1,
  },
  referralTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  referralSub: {
    color: colors.text.muted,
    fontSize: 10.5,
    marginTop: 2,
  },
  referralAmount: {
    color: colors.brand.gold,
    fontWeight: '900',
  },
  referralActions: {
    alignItems: 'center',
    gap: 6,
  },
  referralInviteBtn: {
    backgroundColor: colors.brand.red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  referralInviteText: {
    color: colors.text.onRed,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  referralShareIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Toast (custom rendering to keep on top of tabs) */
  toast: {
    position: 'absolute',
    bottom: 110,
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

export default HomeScreen;
