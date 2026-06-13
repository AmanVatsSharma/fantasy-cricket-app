/**
 * File:        mobile/src/app/components/HomeTabBar.tsx
 * Module:      Mobile · Tab Navigation (Home variant)
 * Purpose:     5-icon flat bottom tab bar for the home page. Home /
 *              My Contests / My Teams / Wallet / More. Active tab in
 *              red, inactive in muted white. Tapping is controlled by
 *              parent (we don't navigate — parent decides what happens).
 *
 * Exports:
 *   - HomeTabBar
 *   - HOME_TABS — list of 5 tab descriptors (name, label, icon renderer)
 *
 * Differs from Dream11TabBar:
 *   - No floating Account button
 *   - No < > nav arrows
 *   - No animated glow above the active tab
 *   - Active state = red icon + red label, no underlay
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../theme/colors';

export type HomeTabName = 'home' | 'contests' | 'teams' | 'wallet' | 'more';

type TabDescriptor = {
  name: HomeTabName;
  label: string;
  icon: (color: string) => React.ReactNode;
};

const HomeIcon = (color: string) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M3 11 L12 4 L21 11" fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    <Path d="M5 10 V21 H19 V10" fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    <Rect x={10} y={16} width={4} height={5} fill="none" stroke={color} strokeWidth={1.9} />
  </Svg>
);

const ContestIcon = (color: string) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      d="M7 4 H17 V10 C17 13 14.5 15 12 15 C9.5 15 7 13 7 10 V4 Z"
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinejoin="round"
    />
    <Path d="M7 6 H4 C4 8.5 5 10 7 10" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    <Path d="M17 6 H20 C20 8.5 19 10 17 10" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    <Rect x={9} y={15} width={6} height={3} fill={color} />
    <Rect x={8} y={18} width={8} height={2} rx={1} fill={color} />
  </Svg>
);

const TeamsIcon = (color: string) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.7} />
    <Path d="M12 3 V21" stroke={color} strokeWidth={1.4} />
    <Path d="M3 12 H21" stroke={color} strokeWidth={1.4} />
    <Rect x={10} y={3} width={4} height={1.2} fill={color} />
    <Rect x={10} y={19.8} width={4} height={1.2} fill={color} />
  </Svg>
);

const WalletIcon = (color: string) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Rect x={3} y={6} width={18} height={13} rx={2} fill="none" stroke={color} strokeWidth={1.9} />
    <Path d="M3 10 H21" stroke={color} strokeWidth={1.9} />
    <Circle cx={17} cy={14.5} r={1.2} fill={color} />
  </Svg>
);

const MoreIcon = (color: string) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx={5} cy={12} r={1.7} fill={color} />
    <Circle cx={12} cy={12} r={1.7} fill={color} />
    <Circle cx={19} cy={12} r={1.7} fill={color} />
  </Svg>
);

export const HOME_TABS: TabDescriptor[] = [
  { name: 'home', label: 'Home', icon: HomeIcon },
  { name: 'contests', label: 'Contests', icon: ContestIcon },
  { name: 'teams', label: 'My Teams', icon: TeamsIcon },
  { name: 'wallet', label: 'Wallet', icon: WalletIcon },
  { name: 'more', label: 'More', icon: MoreIcon },
];

export const HomeTabBar: React.FC<{
  activeTab: HomeTabName;
  onChange: (tab: HomeTabName) => void;
}> = ({ activeTab, onChange }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'ios' ? insets.bottom : 0;

  return (
    <View style={[styles.bar, { paddingBottom: 8 + bottomPad }]}>
      <View style={styles.topGlow} />
      <View style={styles.row}>
        {HOME_TABS.map((tab) => {
          const focused = activeTab === tab.name;
          const color = focused ? colors.brand.red : colors.text.muted;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => onChange(tab.name)}
            >
              <View style={styles.iconWrap}>{tab.icon(color)}</View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.inputDeep,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingTop: 6,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(206, 64, 77, 0.4)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.2,
  },
});

export default HomeTabBar;
