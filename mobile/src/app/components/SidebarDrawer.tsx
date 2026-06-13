import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions, ScrollView, Image } from 'react-native';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { useDrawer } from '../../..';
import { useToast } from './Toast';

const { width, height } = Dimensions.get('window');
const DRAWER_W = Math.min(320, width * 0.82);

// Routes we have wired up in the dev server's Stack.Navigator. The drawer
// is rendered above <NavigationContainer> and so uses DrawerContext.navigate
// to dispatch pushes. Routes outside this set fall through to a "coming
// soon" toast so the drawer stays navigable during the design preview
// phase without crashing the app.
const KNOWN_ROUTES = new Set(['Home', 'Landing', 'Otp', 'Account', 'MyContests', 'ContestLobby', 'ContestJoin']);

const MENU_ITEMS = [
  { label: 'My Balance', icon: '💰', route: 'Wallet' },
  { label: 'My Vouchers', icon: '🎟️', route: 'Wallet' },
  { label: 'How to Play', icon: '🎮', route: 'Info' },
  { label: 'More', icon: '•••', route: 'Settings' },
];

const SUPPORT_ITEM = { label: '24x7 Help & Support', icon: '🎧', route: 'HelpSupport' };

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const SidebarDrawer = ({ visible, onClose }: SidebarDrawerProps) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const [sidebarBanner, setSidebarBanner] = useState<any>(null);
  const userName = useUserStore(s => s.name) || useAuthStore(s => s.email?.split('@')[0]) || 'DREAMER';
  const { navigate } = useDrawer();
  const { show } = useToast();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      fetchSidebarBanner();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_W,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchSidebarBanner = async () => {
    try {
      const { data } = await apiClient.get('/banners?position=sidebarBanner&active=true');
      if (data && data.length > 0) setSidebarBanner(data[0]);
    } catch {}
  };

  const navigateTo = (route: string) => {
    onClose();
    setTimeout(() => {
      // Only push known routes. Unknown destinations (Settings, Wallet,
      // Info, HelpSupport) surface as a dev-friendly toast so the drawer
      // never crashes the preview build.
      if (KNOWN_ROUTES.has(route)) {
        navigate(route);
        return;
      }
      if (route === 'Info') {
        show('How to Play: Fantasy cricket lets you build a team of real players and earn points from their real-match performance.');
        return;
      }
      show(`${route} — coming soon`);
    }, 220);
  };

  const MenuItem = ({ item }: { item: typeof MENU_ITEMS[0] | typeof SUPPORT_ITEM }) => (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={() => navigateTo(item.route)}
    >
      <View style={styles.menuItemIcon}>
        {item.icon === '•••' ? (
          <Text style={styles.menuDots}>• • •</Text>
        ) : (
          <Text style={styles.menuIconTxt}>{item.icon}</Text>
        )}
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Drawer panel */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.drawerHdr}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnTxt}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userRow} activeOpacity={0.7}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarTxt}>{userName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName.toUpperCase()}</Text>
                <Text style={styles.userTagline}>Tap to edit profile</Text>
              </View>
              <Text style={styles.userArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Text style={styles.notifBtnTxt}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Ad-free banner */}
          <TouchableOpacity style={styles.adBanner} activeOpacity={0.9}>
            <View style={styles.adIcon}>
              <Text style={styles.adIconTxt}>🚫</Text>
            </View>
            <View style={styles.adText}>
              <Text style={styles.adTitle}>Ad-Free Contest Join</Text>
              <Text style={styles.adSub}>No Ads • Multi-team join</Text>
            </View>
            <TouchableOpacity style={styles.adBtn} activeOpacity={0.7}>
              <Text style={styles.adBtnTxt}>GO AD-FREE</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Menu list */}
          <View style={styles.menuSection}>
            {MENU_ITEMS.map((item, i) => (
              <React.Fragment key={item.label}>
                <MenuItem item={item} />
                {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Support button (full width, separate) */}
          <View style={styles.supportWrap}>
            <MenuItem item={SUPPORT_ITEM} />
          </View>

          {/* Sidebar Banner (admin-controlled) */}
          <View style={styles.bannerArea}>
            {sidebarBanner ? (
              <TouchableOpacity
                style={[styles.sidebarBanner, { backgroundColor: sidebarBanner.backgroundColor || '#1a3a5c' }]}
                activeOpacity={0.9}
                onPress={() => sidebarBanner.ctaLink && navigateTo(sidebarBanner.ctaLink)}
              >
                {sidebarBanner.imageUrl ? (
                  <Image source={{ uri: sidebarBanner.imageUrl }} style={styles.bannerImg} resizeMode="cover" />
                ) : null}
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerContent}>
                  <Text style={[styles.bannerTitle, { color: sidebarBanner.textColor || '#fff' }]}>
                    {sidebarBanner.title}
                  </Text>
                  <Text style={[styles.bannerSub, { color: (sidebarBanner.textColor || '#fff') + 'CC' }]}>
                    {sidebarBanner.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.sidebarBannerPlaceholder}>
                <Text style={styles.bannerPlaceholderTxt}>🖼️ Sidebar Banner</Text>
                <Text style={styles.bannerPlaceholderSub}>Set from Admin → Banners</Text>
              </View>
            )}
          </View>

          {/* Version */}
          <View style={styles.footer}>
            <Text style={styles.versionTxt}>VERSION 7.7.2</Text>
            <TouchableOpacity style={styles.updateBtn} activeOpacity={0.7}>
              <Text style={styles.updateBtnTxt}>App Update Available</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  drawer: {
    width: DRAWER_W,
    height,
    backgroundColor: '#000',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  drawerHdr: { paddingHorizontal: 14, paddingTop: 52, paddingBottom: 16, backgroundColor: '#0d0d0d', flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  userRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#CE404D', alignItems: 'center', justifyContent: 'center' },
  userAvatarTxt: { color: '#fff', fontSize: 15, fontWeight: 800 },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: 0.5 },
  userTagline: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 },
  userArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 18 },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  notifBtnTxt: { fontSize: 16 },
  adBanner: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    overflow: 'hidden',
  },
  adIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  adIconTxt: { fontSize: 18 },
  adText: { flex: 1 },
  adTitle: { color: '#fff', fontSize: 13, fontWeight: 800 },
  adSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 1 },
  adBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  adBtnTxt: { color: '#4F46E5', fontSize: 10, fontWeight: 900 },
  menuSection: { backgroundColor: '#1C1C1C', marginHorizontal: 12, borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 14, gap: 14 },
  menuItemIcon: { width: 22, alignItems: 'center' },
  menuIconTxt: { fontSize: 16 },
  menuDots: { color: '#fff', fontSize: 11, letterSpacing: 2 },
  menuLabel: { flex: 1, color: '#fff', fontSize: 14, fontWeight: 600 },
  menuArrow: { color: 'rgba(255,255,255,0.25)', fontSize: 18 },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 14 },
  supportWrap: { backgroundColor: '#1C1C1C', marginHorizontal: 12, borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  bannerArea: { paddingHorizontal: 12, flex: 1 },
  sidebarBanner: { flex: 1, borderRadius: 14, overflow: 'hidden', minHeight: 120, justifyContent: 'flex-end' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  bannerImg: { ...StyleSheet.absoluteFillObject },
  bannerContent: { padding: 14 },
  bannerTitle: { fontSize: 15, fontWeight: 900 },
  bannerSub: { fontSize: 11, marginTop: 2 },
  sidebarBannerPlaceholder: { flex: 1, borderRadius: 14, backgroundColor: '#1C1C1C', borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  bannerPlaceholderTxt: { color: 'rgba(255,255,255,0.2)', fontSize: 14 },
  bannerPlaceholderSub: { color: 'rgba(255,255,255,0.1)', fontSize: 10, marginTop: 4 },
  footer: { paddingHorizontal: 16, paddingBottom: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  versionTxt: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 600 },
  updateBtn: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  updateBtnTxt: { color: '#0056B3', fontSize: 11, fontWeight: 800 },
});