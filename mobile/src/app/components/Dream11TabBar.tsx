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
  { name: 'HOME',      label: 'Home' },
  { name: 'WATCHLIVE', label: 'Watch Live' },
  { name: 'CLUBS',     label: 'Clubs' },
  { name: 'ACCOUNT',   label: 'Account' },
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
  if (name === 'WATCHLIVE') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path d="M12 4V2" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M4.93 4.93L3.51 3.51" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M2 12H4" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M12 15C14.2091 15 16 13.2091 16 11" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M12 18C16.4183 18 20 14.4183 20 10" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M12 21C18.6274 21 24 15.6274 24 9" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M8 6L10 8" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Path d="M6 8L8 10" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  if (name === 'CLUBS') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Circle cx="9" cy="7" r="3" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M3 19C3 15.6863 5.68629 13 9 13" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <Circle cx="16" cy="7" r="3" stroke={c} strokeWidth={sw} fill="none" />
        <Path d="M21 19C21 15.6863 18.3137 13 15 13" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </Svg>
    );
  }
  // ACCOUNT — person silhouette (also used inside floating button at 24x24)
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx="12" cy="7" r="4" stroke={c} strokeWidth={sw} fill="none" />
      <Path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </Svg>
  );
};

// Floating Account button — raised above the tab bar
const FloatingAccountButton = ({ isActive, onPress }: { isActive: boolean; onPress: () => void }) => (
  <View style={fb.wrapper}>
    <TouchableOpacity
      style={[fb.button, isActive && fb.buttonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth={2} fill="none" />
        <Path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
      </Svg>
    </TouchableOpacity>
  </View>
);

const fb = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: [{ translateX: -24 }],
    marginTop: -20,
    zIndex: 10,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CE404D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CE404D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonActive: {
    backgroundColor: '#A02030',
    shadowOpacity: 0.8,
  },
});

export const Dream11TabBar = ({ state, descriptors, navigation }: any) => {
  const focusedIndex = state.index;

  return (
    <View style={t.bar}>
      {/* Red glow dot above active tab — rendered behind the bar */}
      <View style={[t.redGlow, { left: `${(focusedIndex + 0.5) * 25}%` }]} />

      {/* Navigation arrows — bottom left */}
      <View style={t.navArrows}>
        <Text style={t.navArrow}>{'<'}</Text>
        <Text style={t.navArrow}>{'>'}</Text>
      </View>

      {/* Floating raised Account button — positioned over ACCOUNT tab */}
      <FloatingAccountButton
        isActive={focusedIndex === 3}
        onPress={() => navigation.navigate('ACCOUNT')}
      />

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
    paddingBottom: 24,
    paddingTop: 12,
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
  navArrows: {
    position: 'absolute',
    left: 12,
    bottom: 28,
    flexDirection: 'row',
    gap: 12,
  },
  navArrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '300',
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