/**
 * File:        mobile/src/app/components/Dream11TabBar.tsx
 * Module:      Mobile · Navigation
 * Purpose:     Dream11-style bottom tab bar with floating raised Account button
 *
 * Exports:
 *   - TAB_ICONS — static array of 4 tab definitions
 *   - TabIcon(props) — renders HOME/WATCHLIVE/CLUBS/ACCOUNT SVG icons
 *   - Dream11TabBar(props) — bottom tab bar component with red glow and floating button
 *
 * Depends on:
 *   - react-native — View, TouchableOpacity, Text, StyleSheet
 *   - react-native-svg — Svg, Path, Circle, Rect for tab icons
 *
 * Side-effects:  none
 *
 * Key invariants:
 *   - All 4 tabs are rendered in the map so redGlow positioning via (focusedIndex + 0.5) * 25% stays accurate
 *   - Floating button overlays ACCOUNT visual representation but ACCOUNT tab row remains in layout
 *
 * Read order:
 *   1. TAB_ICONS — tab label definitions
 *   2. TabIcon — SVG icon renderer
 *   3. Dream11TabBar — main component with floating Account button
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-24
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

export const TAB_ICONS = [
  { name: 'HOME',       label: 'Home' },
  { name: 'MYCONTESTS', label: 'My Contests' },
  { name: 'MYTEAMS',    label: 'My Teams' },
  { name: 'WALLET',     label: 'Wallet' },
  { name: 'MORE',       label: 'More' },
];

// SVG icons for tab bar
export const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const c = focused ? '#CE404D' : 'rgba(255,255,255,0.3)';
  const sw = focused ? 2 : 1.8;

  if (name === 'HOME') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M3 11L12 4L21 11" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d="M5 10V21H19V10" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Rect x="10" y="16" width="4" height="5" stroke={c} strokeWidth={sw} strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'MYCONTESTS') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M7 4 H17 V10 C17 13 14.5 15 12 15 C9.5 15 7 13 7 10 V4 Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" fill="none" />
        <Path d="M7 6 H4 C4 8.5 5 10 7 10" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M17 6 H20 C20 8.5 19 10 17 10" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Rect x="9" y="15" width="6" height="3" stroke={c} strokeWidth={sw} fill={c} />
        <Rect x="8" y="18" width="8" height="2" rx="1" stroke={c} strokeWidth={sw} fill={c} />
      </Svg>
    );
  }
  if (name === 'MYTEAMS') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M12 3 C10 6 8 8 8 12 C8 14 9 15 12 17 C15 15 16 14 16 12 C16 8 14 6 12 3" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'WALLET') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Rect x="6" y="18" width="12" height="4" rx="2" stroke={c} strokeWidth={sw} fill="none" />
        <Rect x="6" y="14" width="12" height="2" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M10 14 C10 12 9 11 11 11 C12 11 13 12 13 13" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  // MORE — 3 dots
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx="6" cy="12" r="1.5" fill={c} />
      <Circle cx="12" cy="12" r="1.5" fill={c} />
      <Circle cx="18" cy="12" r="1.5" fill={c} />
    </Svg>
  );
};

export const Dream11TabBar = ({ state, descriptors, navigation }: any) => {
  const focusedIndex = state.index;

  return (
    <View style={t.bar}>
      {/* Red glow dot above active tab — rendered behind the bar */}
      <View style={[t.redGlow, { left: `${(focusedIndex + 0.5) * 20}%` }]} />

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={[t.tab, isFocused && t.tabActive]}
            onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
            activeOpacity={0.7}
          >
            <View style={t.tabContent}>
              {isFocused && <View style={t.activeDot} />}
              <TabIcon name={route.name} focused={isFocused} />
              <Text style={[t.label, isFocused ? t.labelActive : t.labelInactive]}>
                {TAB_ICONS[index]?.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const t = StyleSheet.create({
  bar: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: '#0d0d12',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#CE404D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'visible',
  },
  redGlow: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 3,
    backgroundColor: '#CE404D',
    borderRadius: 2,
    transform: [{ translateX: -4 }],
    shadowColor: '#CE404D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    marginHorizontal: 2,
    zIndex: 1,
  },
  tabActive: {},
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CE404D',
    marginBottom: 2,
  },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  labelActive: { color: '#fff' },
  labelInactive: { color: 'rgba(255,255,255,0.35)' },
});