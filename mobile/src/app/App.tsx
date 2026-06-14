import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import './global.css';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity, StyleSheet, FlatList, Dimensions, Animated, Image } from 'react-native';
import { Svg, Path, Circle, G, Rect, Line } from 'react-native-svg';
import { apiClient } from './api/apiClient';
import { SidebarDrawer } from './components/SidebarDrawer';
import { Dream11TabBar } from './components/Dream11TabBar';

const DrawerContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });
export const useDrawer = () => useContext(DrawerContext);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Modern compact header above tab bar
const ModernHeader = () => {
  const { openDrawer } = useDrawer();
  const nav = useNavigation();

  return (
    <View style={h.root}>
      <TouchableOpacity style={h.menuBtn} onPress={openDrawer} activeOpacity={0.7}>
        <Text style={h.menuTxt}>☰</Text>
      </TouchableOpacity>

      <View style={h.center}>
        <Image source={require('../../public/shield-32.png')} style={h.logoShield} resizeMode="contain" />
        <View style={h.logoWrap}>
          <Text style={h.logoMain}>11<span style={h.logoGold}>DREAMER</span></Text>
          <Text style={h.logoSub}>FANTASY CRICKET</Text>
        </View>
      </View>

      <View style={h.right}>
        <TouchableOpacity style={h.walletPill} activeOpacity={0.7}
          onPress={() => nav.navigate('Wallet' as any)}>
          <Text style={h.walletIcon}>💰</Text>
          <Text style={h.walletAmt}>₹2,500</Text>
        </TouchableOpacity>
        <TouchableOpacity style={h.bellBtn} activeOpacity={0.7}
          onPress={() => nav.navigate('Notifications' as any)}>
          <Text style={h.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const h = StyleSheet.create({
  root: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f1117',
    paddingTop: 40, paddingBottom: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
    gap: 6,
  },
  menuBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  center: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 },
  logoMark: { fontSize: 22 },
  logoShield: { width: 28, height: 28 },
  logoWrap: { gap: 0 },
  logoMain: { color: '#fff', fontSize: 15, fontWeight: 900, letterSpacing: 0.8 },
  logoGold: { color: '#ECBD15' },
  logoSub: { color: 'rgba(255,255,255,0.3)', fontSize: 7, fontWeight: 700, letterSpacing: 2.5, marginTop: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6, gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  walletIcon: { fontSize: 13 },
  walletAmt: { color: '#ECBD15', fontSize: 12, fontWeight: 800 },
  bellBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  bellIcon: { fontSize: 15 },
});

// === HOME CONTENT — WoW Edition ===
const HomeContent = () => {
  const [activeTab, setActiveTab] = useState('fixtures');
  const [matches, setMatches] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const nav = useNavigation();

  // Animated values for hero VS card
  const vsPulse = useRef(new Animated.Value(0)).current;
  const vsRotate = useRef(new Animated.Value(0)).current;
  const cardFlip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(vsPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(vsPulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]));
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    const rotate = Animated.loop(Animated.sequence([
      Animated.timing(vsRotate, { toValue: 1, duration: 3000, useNativeDriver: true }),
      Animated.timing(vsRotate, { toValue: 0, duration: 3000, useNativeDriver: true }),
    ]));
    rotate.start();
    return () => rotate.stop();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const i = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(i);
  }, [banners.length]);

  // Pulsing dot for LIVE badge
  const PulsingDot = () => {
    const pulse = useRef(new Animated.Value(1)).current;
    useEffect(() => {
      const anim = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.8, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]));
      anim.start();
      return () => anim.stop();
    }, []);
    return <Animated.View style={[mc.liveDot, { transform: [{ scale: pulse }] }]} />;
  };

  // Countdown timer
  const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
    useEffect(() => {
      const tick = () => {
        const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        setTimeLeft({ h, m, s });
      };
      tick();
      const i = setInterval(tick, 1000);
      return () => clearInterval(i);
    }, [targetDate]);
    return (
      <View style={mc.timerWrap}>
        <Text style={mc.timerNum}>{timeLeft.h}</Text>
        <Text style={mc.timerCol}>:</Text>
        <Text style={mc.timerNum}>{timeLeft.m}</Text>
        <Text style={mc.timerCol}>:</Text>
        <Text style={mc.timerNum}>{timeLeft.s}</Text>
      </View>
    );
  };

  // VS Badge with electric glow
  const VsBadge = ({ size = 64 }: { size?: number }) => {
    const glowScale = vsPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
    const glowOpacity = vsPulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
    const rotateVal = vsRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
      <View style={[mc.vsBadgeWrap, { width: size + 20, height: size + 20 }]}>
        {/* Outer glow rings */}
        <Animated.View style={[mc.vsGlowRing, mc.vsGlowRing1, {
          width: size + 28, height: size + 28,
          transform: [{ scale: glowScale }, { rotate: rotateVal }],
          opacity: glowOpacity,
        }]} />
        <Animated.View style={[mc.vsGlowRing, mc.vsGlowRing2, {
          width: size + 16, height: size + 16,
          transform: [{ scale: glowScale }],
          opacity: vsPulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        }]} />
        {/* Core badge */}
        <View style={[mc.vsBadge, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={mc.vsBadgeTxt}>VS</Text>
          {/* Lightning decorations */}
          <Text style={[mc.vsLightning, { left: -8, top: '30%' }]}>⚡</Text>
          <Text style={[mc.vsLightning, { right: -8, top: '30%', transform: [{ scaleX: -1 }] }]}>⚡</Text>
        </View>
      </View>
    );
  };

  // Banner card — big, cinematic
  const BannerCard = ({ banner, index }: { banner: any; index: number }) => (
    <View style={[mc.bigBanner, { backgroundColor: banner.backgroundColor || '#1a1a4a' }]}>
      {banner.imageUrl && <Image source={{ uri: banner.imageUrl }} style={mc.bannerImg} resizeMode="cover" />}
      <View style={mc.bannerGradient} />
      <View style={mc.bannerContent}>
        <View style={mc.bannerTopRow}>
          <View style={mc.bannerBadge}><Text style={mc.bannerBadgeTxt}>🏆 SPECIAL</Text></View>
        </View>
        <View style={mc.bannerMain}>
          <View style={mc.bannerLeft}>
            <Text style={mc.bannerEmoji}>⚡</Text>
          </View>
          <View style={mc.bannerRight}>
            <Text style={[mc.bannerTitle, { color: banner.textColor || '#fff' }]}>{banner.title}</Text>
            <Text style={[mc.bannerSub, { color: (banner.textColor || '#fff') + 'AA' }]}>{banner.subtitle}</Text>
            <View style={mc.bannerCtaRow}>
              <TouchableOpacity style={[mc.bannerCta, { backgroundColor: '#CE404D' }]} activeOpacity={0.8}>
                <Text style={mc.bannerCtaTxt}>{banner.ctaText || 'PLAY NOW'}</Text>
              </TouchableOpacity>
              {banner.prizeAmount && (
                <View style={mc.prizeChip}><Text style={mc.prizeChipTxt}>₹{banner.prizeAmount}</Text></View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Dot indicators for banner carousel
  const BannerDots = () => banners.length <= 1 ? null : (
    <View style={mc.bannerDots}>
      {banners.map((_, i) => (
        <View key={i} style={[mc.bannerDot, i === bannerIdx && mc.bannerDotActive]} />
      ))}
    </View>
  );

  const FLAGS: any = {
    MI: { e: '🔵', c: '#004C8F' }, CSK: { e: '🟡', c: '#FFD700' },
    RCB: { e: '🔴', c: '#D40026' }, KKR: { e: '🟣', c: '#3b3b98' },
    DC: { e: '🔵', c: '#004898' }, SRH: { e: '🟠', c: '#FF6A00' },
    GT: { e: '🔵', c: '#1A237E' }, LSG: { e: '🟣', c: '#6D1B7A' },
    PBKS: { e: '🔴', c: '#DA1113' }, RR: { e: '🟣', c: '#E23A6E' },
    IND: { e: '🇮🇳', c: '#1380E8' }, AUS: { e: '🇦🇺', c: '#FFCD00' },
    ENG: { e: '🇬🇧', c: '#012169' }, NZ: { e: '🇳🇿', c: '#00247D' },
    SA: { e: '🇿🇦', c: '#007749' }, PAK: { e: '🇵🇰', c: '#01411C' },
    WI: { e: '🇼🇸', c: '#71091B' }, SL: { e: '🇱🇰', c: '#003893' },
    BAN: { e: '🇧🇩', c: '#006A4E' },
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mr, br] = await Promise.all([
          apiClient.get('/matches/upcoming').catch(() => ({ data: [] })),
          apiClient.get('/banners').catch(() => ({ data: [] })),
        ]);
        setMatches(mr?.data || []);
        setBanners(br?.data || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const displayed = activeTab === 'fixtures' ? matches.filter((m: any) => !m.matchStarted) :
                   activeTab === 'live' ? matches.filter((m: any) => m.matchStarted) : [];

  const TABS = [
    { key: 'fixtures', label: 'Fixtures', icon: '📅' },
    { key: 'live', label: 'Live', icon: '🔴' },
    { key: 'results', label: 'Results', icon: '🏆' },
  ];

  const matchTypeColors: any = {
    T20I: { bg: '#7E0A13', text: '#fff', glow: '#ff3333' },
    IPL: { bg: '#1d2441', text: '#fff', glow: '#3d5afe' },
    ODI: { bg: '#1d2441', text: '#fff', glow: '#3d5afe' },
    WORLD_CUP: { bg: '#ECBD15', text: '#1d2441', glow: '#ffd700' },
    TEST: { bg: '#2d5016', text: '#fff', glow: '#4caf50' },
  };

  // Match chip — team card style
  const MatchChip = ({ item, index }: { item: any; index: number }) => {
    const t1 = item.team1 || {}, t2 = item.team2 || {};
    const tc = matchTypeColors[(item.matchStatus || 'T20I').toUpperCase()] || { bg: '#CE404D', glow: '#ff6666' };
    const f1 = FLAGS[t1.shortName] || { e: '🏏', c: '#CE404D' };
    const f2 = FLAGS[t2.shortName] || { e: '🏏', c: '#CE404D' };
    return (
      <TouchableOpacity
        style={[mc.chip, { borderColor: f1.c + '44' }]}
        activeOpacity={0.8}
        onPress={() => {
          if (activeTab !== 'fixtures') setActiveTab('fixtures');
          else nav.navigate('MatchDetail' as any, { matchId: item.id });
        }}
      >
        {/* Glassmorphic top */}
        <View style={[mc.chipTop, { backgroundColor: tc.bg + 'CC' }]}>
          {item.matchStarted ? (
            <View style={mc.chipLivePill}><PulsingDot /><Text style={mc.chipLiveTxt}>LIVE</Text></View>
          ) : (
            <Text style={[mc.chipTypeTxt, { color: tc.text }]}>{item.matchStatus || 'T20I'}</Text>
          )}
        </View>
        {/* Teams */}
        <View style={mc.chipBody}>
          <Text style={mc.chipFlag}>{f1.e}</Text>
          <View style={[mc.chipVsDot, { backgroundColor: tc.glow }]}><Text style={mc.chipVsDotTxt}>VS</Text></View>
          <Text style={mc.chipFlag}>{f2.e}</Text>
        </View>
        <Text style={mc.chipNames}>{t1.shortName} vs {t2.shortName}</Text>
        {item.matchDateTime && !item.matchStarted && (
          <CountdownTimer targetDate={item.matchDateTime} />
        )}
        {/* Bottom shine line */}
        <View style={[mc.chipShine, { backgroundColor: tc.glow }]} />
      </TouchableOpacity>
    );
  };

  // Full match card — the WOW star
  const MatchCard = ({ item }: { item: any }) => {
    const t1 = item.team1 || {}, t2 = item.team2 || {};
    const type = (item.matchStatus || 'T20I').toUpperCase();
    const tc = matchTypeColors[type] || { bg: '#CE404D', text: '#fff', glow: '#ff6666' };
    const f1 = FLAGS[t1.shortName] || { e: '🏏', c: '#CE404D' };
    const f2 = FLAGS[t2.shortName] || { e: '🏏', c: '#CE404D' };
    const isLive = item.matchStarted;
    const matchTime = item.matchDateTime ? new Date(item.matchDateTime) : null;
    const prizeVal = item.prizePool ? (item.prizePool >= 100000 ? (item.prizePool / 100000).toFixed(1) + 'L' : item.prizePool + '') : '10K';

    return (
      <TouchableOpacity style={mc.card} activeOpacity={0.85}
        onPress={() => nav.navigate('MatchDetail' as any, { matchId: item.id })}>

        {/* Glowing top bar */}
        <View style={[mc.cardTopBar, { backgroundColor: tc.bg }]}>
          <View style={[mc.cardGlowBar, { backgroundColor: tc.glow }]} />
          <Text style={[mc.cardTypeTxt, { color: tc.text }]}>{type}</Text>
          {isLive && (
            <View style={mc.cardLivePill}>
              <PulsingDot />
              <Text style={mc.cardLiveTxt}>LIVE</Text>
              <View style={mc.cardLiveBar}><Text style={mc.cardLiveBarTxt}>🔥</Text></View>
            </View>
          )}
          {!isLive && matchTime && <CountdownTimer targetDate={item.matchDateTime} />}
          <View style={mc.freeBadge}><Text style={mc.freeBadgeTxt}>FREE</Text></View>
        </View>

        {/* VS Hero Section */}
        <View style={mc.vsSection}>
          {/* Left team */}
          <View style={mc.vsTeam}>
            <View style={[mc.vsTeamAvatar, { borderColor: f1.c, shadowColor: f1.c }]}>
              <Text style={mc.vsTeamFlag}>{f1.e}</Text>
            </View>
            <View style={[mc.vsTeamGlowRing, { backgroundColor: f1.c + '33' }]} />
            <Text style={mc.vsTeamCode}>{t1.shortName || 'T1'}</Text>
            <Text style={mc.vsTeamName}>{t1.name || 'Team 1'}</Text>
            {item.team1PlayersWon && <Text style={mc.vsTeamNote}>🏅 {item.team1PlayersWon}</Text>}
          </View>

          {/* Center VS */}
          <View style={mc.vsCenter}>
            <VsBadge size={58} />
            {matchTime && (
              <Text style={mc.vsTime}>
                {matchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>

          {/* Right team */}
          <View style={mc.vsTeam}>
            <View style={[mc.vsTeamAvatar, { borderColor: f2.c, shadowColor: f2.c }]}>
              <Text style={mc.vsTeamFlag}>{f2.e}</Text>
            </View>
            <View style={[mc.vsTeamGlowRing, { backgroundColor: f2.c + '33' }]} />
            <Text style={mc.vsTeamCode}>{t2.shortName || 'T2'}</Text>
            <Text style={mc.vsTeamName}>{t2.name || 'Team 2'}</Text>
            {item.team2PlayersWon && <Text style={mc.vsTeamNote}>🏅 {item.team2PlayersWon}</Text>}
          </View>
        </View>

        {/* Prize & action footer */}
        <View style={mc.cardFooter}>
          <View style={mc.footerLeft}>
            <View style={mc.footerPrizeRow}>
              <Text style={mc.footerPrizeIcon}>💰</Text>
              <Text style={mc.footerPrizeLabel}>PRIZE POOL</Text>
            </View>
            <View style={mc.footerPrizeValue}>
              <Text style={mc.footerPrizeCurrency}>₹</Text>
              <Text style={mc.footerPrizeAmount}>{prizeVal}</Text>
            </View>
            <View style={mc.footerContestsRow}>
              <Text style={mc.footerContestIcon}>🏆</Text>
              <Text style={mc.footerContestTxt}>{item.contestCount || 4} Contests • {item.entriesJoined || 0} Joined</Text>
            </View>
          </View>
          <View style={mc.footerRight}>
            <TouchableOpacity style={[mc.playBtn, { shadowColor: tc.glow }]} activeOpacity={0.8}>
              <Text style={mc.playBtnTxt}>⚡ PLAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#080810' }}>
      <ModernHeader />

      {/* Filter tabs */}
      <View style={mc.filterRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key}
            style={[mc.filterChip, activeTab === tab.key && mc.filterChipOn]}
            onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}>
            {activeTab === tab.key && <View style={mc.filterDot} />}
            <Text style={mc.filterIcon}>{tab.icon}</Text>
            <Text style={[mc.filterTxt, activeTab === tab.key && mc.filterTxtOn]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={mc.notifChip} activeOpacity={0.7}
          onPress={() => nav.navigate('Notifications' as any)}>
          <Text style={mc.notifChipTxt}>🔔</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={mc.loading}>
          <View style={mc.loadingSpinner} />
          <Text style={mc.loadingTxt}>Loading exciting matches...</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item: any) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {/* Cinematic Banner Carousel */}
              {banners.length > 0 && (
                <View style={mc.bannerSection}>
                  <FlatList
                    horizontal
                    pagingEnabled
                    data={banners}
                    keyExtractor={(b: any) => b.id.toString()}
                    renderItem={({ item, index }: any) => <BannerCard banner={item} index={index} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / (332));
                      setBannerIdx(idx);
                    }}
                    snapToInterval={332}
                    decelerationRate="fast"
                  />
                  <BannerDots />
                </View>
              )}

              {/* Match selection chips */}
              <View style={mc.matchScrollWrap}>
                <View style={mc.matchScrollHdr}>
                  <Text style={mc.matchScrollTitle}>🎯 Select Match</Text>
                  <Text style={mc.matchScrollSub}>{matches.length} matches</Text>
                </View>
                <FlatList
                  horizontal
                  data={matches}
                  keyExtractor={(m: any) => m.id.toString()}
                  renderItem={({ item, index }: any) => <MatchChip item={item} index={index} />}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 12 }}
                />
              </View>

              {/* Featured section */}
              <View style={mc.featuredHdr}>
                <View style={mc.featuredLeft}>
                  <Text style={mc.featuredTitle}>⚡ Featured Matches</Text>
                  <View style={mc.featuredBadge}><Text style={mc.featuredBadgeTxt}>{displayed.length} LIVE</Text></View>
                </View>
                <Text style={mc.featuredCount}>↑ Scroll for more</Text>
              </View>
            </>
          )}
          renderItem={({ item }: any) => <MatchCard item={item} />}
          ListEmptyComponent={
            <View style={mc.empty}>
              <Text style={mc.emptyEmoji}>🏏</Text>
              <Text style={mc.emptyTitle}>No Matches Found</Text>
              <Text style={mc.emptySub}>Check back soon for exciting matches!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        />
      )}
    </View>
  );
};

const mc = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080810' },
  filterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1117', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, gap: 5 },
  filterChipOn: { backgroundColor: '#CE404D' },
  filterDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#fff', position: 'absolute', top: -4, alignSelf: 'center' },
  filterIcon: { fontSize: 11 },
  filterTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 },
  filterTxtOn: { color: '#fff' },
  notifChip: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  notifChipTxt: { fontSize: 14 },

  // Banner carousel
  bannerSection: { paddingVertical: 8 },
  bigBanner: { width: 332, height: 155, marginRight: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#CE404D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 8 },
  bannerImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bannerGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  bannerContent: { flex: 1, padding: 14 },
  bannerTopRow: { flexDirection: 'row', marginBottom: 6 },
  bannerBadge: { backgroundColor: '#CE404D', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  bannerBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: 900 },
  bannerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerLeft: { width: 50, alignItems: 'center', justifyContent: 'center' },
  bannerEmoji: { fontSize: 40, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  bannerRight: { flex: 1, justifyContent: 'center', gap: 5 },
  bannerTitle: { fontSize: 16, fontWeight: 900, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  bannerSub: { fontSize: 11 },
  bannerCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  bannerCta: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  bannerCtaTxt: { color: '#fff', fontSize: 11, fontWeight: 900 },
  prizeChip: { backgroundColor: 'rgba(236,189,21,0.9)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  prizeChipTxt: { color: '#1d2441', fontSize: 10, fontWeight: 900 },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  bannerDotActive: { width: 24, height: 8, borderRadius: 4, backgroundColor: '#CE404D' },

  // Match chips
  matchScrollWrap: { marginTop: 4 },
  matchScrollHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  matchScrollTitle: { color: '#fff', fontSize: 13, fontWeight: 800 },
  matchScrollSub: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 },
  chip: { backgroundColor: '#14141f', borderRadius: 14, padding: 10, marginRight: 10, alignItems: 'center', borderWidth: 1, minWidth: 105, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8 },
  chipTop: { width: '100%', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8, alignItems: 'center' },
  chipTypeTxt: { fontSize: 9, fontWeight: 900, textTransform: 'uppercase' },
  chipLivePill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipLiveTxt: { color: '#ff4444', fontSize: 9, fontWeight: 900 },
  chipBody: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipFlag: { fontSize: 22 },
  chipVsDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  chipVsDotTxt: { color: '#fff', fontSize: 8, fontWeight: 900 },
  chipNames: { color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 5, textTransform: 'uppercase', fontWeight: 700 },
  chipShine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  timerWrap: { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 4 },
  timerNum: { color: '#ECBD15', fontSize: 11, fontWeight: 800, fontVariant: ['tabular-nums'] },
  timerCol: { color: '#ECBD15', fontSize: 11, fontWeight: 800 },

  // Featured
  featuredHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginTop: 12, marginBottom: 8 },
  featuredLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredTitle: { color: '#fff', fontSize: 15, fontWeight: 800 },
  featuredBadge: { backgroundColor: '#CE404D', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  featuredBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: 900 },
  featuredCount: { color: 'rgba(255,255,255,0.25)', fontSize: 10 },

  // Match card — WOW
  card: { backgroundColor: '#14141f', marginHorizontal: 10, marginBottom: 14, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  cardTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8 },
  cardGlowBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  cardTypeTxt: { fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 },
  cardLivePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  cardLiveTxt: { color: '#ff4444', fontSize: 10, fontWeight: 900 },
  cardLiveBar: { backgroundColor: 'rgba(255,100,0,0.3)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  cardLiveBarTxt: { fontSize: 10 },
  freeBadge: { backgroundColor: '#6D1B7A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  freeBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' },

  // VS Hero section
  vsSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 20, paddingHorizontal: 8 },
  vsTeam: { alignItems: 'center', gap: 5, flex: 1 },
  vsTeamAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 12, elevation: 6 },
  vsTeamFlag: { fontSize: 34 },
  vsTeamGlowRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, zIndex: -1 },
  vsTeamCode: { color: '#fff', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 },
  vsTeamName: { color: 'rgba(255,255,255,0.35)', fontSize: 8, textTransform: 'uppercase', textAlign: 'center', maxWidth: 70 },
  vsTeamNote: { color: '#ECBD15', fontSize: 8, fontWeight: 700, marginTop: 2 },
  vsCenter: { alignItems: 'center', gap: 6 },
  vsBadgeWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  vsGlowRing: { position: 'absolute', borderRadius: 1000, borderWidth: 2, borderColor: '#CE404D' },
  vsGlowRing1: { borderColor: '#CE404D' },
  vsGlowRing2: { borderColor: '#ECBD15' },
  vsBadge: { backgroundColor: '#CE404D', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ECBD15', position: 'relative' },
  vsBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: 1 },
  vsLightning: { position: 'absolute', fontSize: 12 },
  vsTime: { color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', fontWeight: 600 },
  timerUnit: { color: '#ECBD15', fontSize: 11, fontWeight: 800, fontVariant: ['tabular-nums'] },
  timerSep: { color: '#ECBD15', fontSize: 11, fontWeight: 800 },

  // Card footer
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  footerLeft: { gap: 4 },
  footerPrizeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerPrizeIcon: { fontSize: 10 },
  footerPrizeLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 8, fontWeight: 700, letterSpacing: 1 },
  footerPrizeValue: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  footerPrizeCurrency: { color: '#ECBD15', fontSize: 14, fontWeight: 900 },
  footerPrizeAmount: { color: '#ECBD15', fontSize: 20, fontWeight: 900, textShadowColor: '#ECBD15', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  footerContestsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerContestIcon: { fontSize: 10 },
  footerContestTxt: { color: 'rgba(255,255,255,0.35)', fontSize: 10 },
  footerRight: {},
  prizePool: { color: '#ECBD15', fontSize: 12, fontWeight: 800 },
  playBtn: { backgroundColor: '#CE404D', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
  playBtnTxt: { color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: 0.5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff4444' },
  contestCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },

  // Empty & loading
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 800, marginTop: 16 },
  emptySub: { color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 6 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingSpinner: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#CE404D' },
  loadingTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});

// Screen imports
import { LandingScreen } from './screens/LandingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AccountScreen } from './screens/AccountScreen';
import { MyContestsScreen } from './screens/MyContestsScreen';
import { MyTeamsScreen } from './screens/MyTeamsScreen';
import { ContestLobbyScreen } from './screens/ContestLobbyScreen';
import { ContestJoinScreen } from './screens/ContestJoinScreen';
import { WalletScreen } from './screens/WalletScreen';
import { ContestWinningBreakdownScreen } from './screens/ContestWinningBreakdownScreen';
import { WinnersScreen } from './screens/WinnersScreen';
import { KYCVerificationScreen } from './screens/KYCVerificationScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { RewardsReferralScreen } from './screens/RewardsReferralScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { OffersScreen } from './screens/OffersScreen';
import { AITeamSuggestionsScreen } from './screens/AITeamSuggestionsScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
import { BankAccountsScreen } from './screens/BankAccountsScreen';
import { HelpSupportScreen } from './screens/HelpSupportScreen';
import { TermsPrivacyScreen } from './screens/TermsPrivacyScreen';

export const App = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigationRef = useRef<any>(null);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <DrawerContext.Provider value={{ openDrawer }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Main">
            {() => <MainTabs />}
          </Stack.Screen>
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="MyContests" component={MyContestsScreen} />
          <Stack.Screen name="MyTeams" component={MyTeamsScreen} />
          <Stack.Screen name="ContestLobby" component={ContestLobbyScreen} />
          <Stack.Screen name="ContestJoin" component={ContestJoinScreen} />
          <Stack.Screen name="WalletScreen" component={WalletScreen} />
          <Stack.Screen name="ContestWinningBreakdown" component={ContestWinningBreakdownScreen} />
          <Stack.Screen name="Winners" component={WinnersScreen} />
          <Stack.Screen name="KYCVerification" component={KYCVerificationScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="RewardsReferral" component={RewardsReferralScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Offers" component={OffersScreen} />
          <Stack.Screen name="AITeamSuggestions" component={AITeamSuggestionsScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
        </Stack.Navigator>
        <SidebarDrawer
          visible={drawerVisible}
          onClose={closeDrawer}
          navigation={navigationRef.current}
        />
      </NavigationContainer>
    </DrawerContext.Provider>
  );
};

const MainTabs = () => (
  <Tab.Navigator tabBar={Dream11TabBar} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HOME" component={HomeContent} />
    <Tab.Screen name="MYCONTESTS" component={MyContestsScreen} />
    <Tab.Screen name="MYTEAMS" component={MyTeamsScreen} />
    <Tab.Screen name="WALLET" component={WalletScreen} />
    <Tab.Screen
      name="MORE"
      component={() => (
        <View style={{ flex: 1, backgroundColor: '#080810', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>More coming soon</Text>
        </View>
      )}
    />
  </Tab.Navigator>
);

export default App;