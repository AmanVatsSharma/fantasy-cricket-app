/**
 * File:        mobile/src/app/screens/LandingScreen.tsx
 * Module:      Mobile · Entry Screen
 * Purpose:     11DREAMER splash/login screen with brand header, trust badges,
 *              hero block, login panel, social buttons, and terms footer.
 *
 * Exports:
 *   - LandingScreen — initial route of the dev preview app
 *
 * Depends on:
 *   - react-native, react-native-svg — UI primitives
 *   - @react-navigation/native       — useNavigation for the OTP step
 *   - @/theme/colors                 — shared color tokens
 *
 * Flow:
 *   - "Continue with Mobile" → opens in-screen phone modal
 *   - "SEND OTP" in modal    → navigation.replace('Otp', { phone })
 *   - social buttons         → toast "X sign-in coming soon"
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Svg, Path, Circle, Rect, G, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useToast, ToastView } from '../components/Toast';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH - 32, 420);

type LandingScreenNavigationProp = StackNavigationProp<any, 'Landing'>;

/* ------------------------------------------------------------------ *
 *  Sub-components
 * ------------------------------------------------------------------ */

const ShieldLogo: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Defs>
      <LinearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#CE404D" />
        <Stop offset="1" stopColor="#8E1A24" />
      </LinearGradient>
    </Defs>
    <Path
      d="M32 4 L56 14 L56 30 C56 46 44 56 32 60 C20 56 8 46 8 30 L8 14 Z"
      fill="url(#shieldGrad)"
      stroke="#FFFFFF"
      strokeWidth={2.5}
    />
    <SvgText
      x="32"
      y="40"
      textAnchor="middle"
      fontSize={24}
      fontWeight="900"
      fill="#FFFFFF"
      fontFamily="System"
    >
      11
    </SvgText>
  </Svg>
);

const TrustBadge: React.FC<{
  icon: 'users' | 'trophy' | 'rupee';
  label: string;
}> = ({ icon, label }) => {
  const IconEl = () => {
    if (icon === 'users') {
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Circle cx={9} cy={8} r={3.2} fill="none" stroke={colors.brand.red} strokeWidth={1.8} />
          <Circle cx={15.5} cy={8} r={2.5} fill="none" stroke={colors.brand.red} strokeWidth={1.8} />
          <Path
            d="M3 19 C3 15.5 5.5 13 9 13 C12.5 13 15 15.5 15 19"
            fill="none"
            stroke={colors.brand.red}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M15 19 C15 16 17 14 19.5 14 C21 14 22 14.5 22 15.5"
            fill="none"
            stroke={colors.brand.red}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </Svg>
      );
    }
    if (icon === 'trophy') {
      return (
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path
            d="M7 4 H17 V9 C17 12.5 14.5 15 12 15 C9.5 15 7 12.5 7 9 V4 Z"
            fill="none"
            stroke={colors.brand.gold}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path
            d="M7 6 H4 C4 9 5 11 7 11"
            fill="none"
            stroke={colors.brand.gold}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M17 6 H20 C20 9 19 11 17 11"
            fill="none"
            stroke={colors.brand.gold}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Rect x={9} y={15} width={6} height={3} fill={colors.brand.gold} />
          <Rect x={8} y={18} width={8} height={2} rx={1} fill={colors.brand.gold} />
        </Svg>
      );
    }
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          d="M7 5 H15 C16 5 17 6 17 7 V18 C17 19.5 15.5 21 14 21 H8 C6.5 21 5 19.5 5 18 V9 C5 7 6 5 7 5 Z"
          fill="none"
          stroke={colors.brand.green}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path d="M9 10 H13" stroke={colors.brand.green} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M9 13 H13" stroke={colors.brand.green} strokeWidth={1.8} strokeLinecap="round" />
        <Circle cx={12} cy={17} r={1.2} fill={colors.brand.green} />
      </Svg>
    );
  };

  return (
    <View style={styles.badge}>
      <IconEl />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

const SocialIcon: React.FC<{ name: 'google' | 'facebook' | 'apple' | 'email' }> = ({ name }) => {
  const c = '#FFFFFF';
  const sw = 1.8;
  switch (name) {
    case 'google':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M21.6 12.2 C21.6 11.5 21.5 10.8 21.4 10.2 H12 V14.1 H17.4 C17.2 15.3 16.5 16.3 15.5 17 V19.5 H18.7 C20.5 17.9 21.6 15.3 21.6 12.2 Z"
            fill={c}
          />
          <Path
            d="M12 22 C14.7 22 16.9 21.1 18.4 19.6 L15.3 17.3 C14.5 17.9 13.4 18.3 12 18.3 C9.4 18.3 7.2 16.6 6.4 14.3 H3.1 V16.9 C4.6 19.9 8 22 12 22 Z"
            fill={c}
          />
          <Path
            d="M6.4 14.3 C6.2 13.7 6.1 13.1 6.1 12.5 C6.1 11.9 6.2 11.3 6.4 10.7 V8.1 H3.1 C2.4 9.4 2 10.9 2 12.5 C2 14.1 2.4 15.6 3.1 16.9 L6.4 14.3 Z"
            fill={c}
          />
          <Path
            d="M12 6.7 C13.6 6.7 15 7.2 16.1 8.2 L18.5 5.8 C16.9 4.3 14.7 3.5 12 3.5 C8 3.5 4.6 5.6 3.1 8.6 L6.4 11.2 C7.2 8.9 9.4 6.7 12 6.7 Z"
            fill={c}
          />
        </Svg>
      );
    case 'facebook':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M13 22 L13 13 H16 L16.5 9.5 H13 V7.5 C13 6.5 13.4 6 14.5 6 H16.5 V2.8 C16.1 2.7 15 2.5 13.9 2.5 C11.5 2.5 10 4 10 6.7 V9.5 H7 V13 H10 V22 Z"
            fill={c}
          />
        </Svg>
      );
    case 'apple':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M17 12.5 C17 10.2 18.9 8.8 19 8.7 C18 7.4 16.5 7.2 16 7.2 C14.7 7.1 13.5 8 12.8 8 C12 8 11 7.2 9.9 7.2 C8.5 7.2 7.2 8.1 6.4 9.5 C4.8 12.2 6 16.5 7.6 18.7 C8.4 19.8 9.3 21 10.6 21 C11.8 21 12.2 20.2 13.7 20.2 C15.1 20.2 15.5 21 16.8 21 C18.1 21 18.9 19.9 19.6 18.8 C20.5 17.5 20.8 16.3 20.8 16.2 C20.8 16.2 17 15 17 12.5 Z"
            fill={c}
          />
          <Path
            d="M14.7 5.5 C15.3 4.7 15.7 3.6 15.6 2.5 C14.6 2.6 13.7 3.1 13.1 3.9 C12.5 4.6 12.1 5.7 12.2 6.8 C13.2 6.8 14.1 6.3 14.7 5.5 Z"
            fill={c}
          />
        </Svg>
      );
    case 'email':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Rect
            x={3}
            y={5}
            width={18}
            height={14}
            rx={2}
            ry={2}
            fill="none"
            stroke={c}
            strokeWidth={sw}
          />
          <Path d="M3 7 L12 13 L21 7" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
  }
};

const SocialButton: React.FC<{
  name: 'google' | 'facebook' | 'apple' | 'email';
  label: string;
  onPress: () => void;
}> = ({ name, label, onPress }) => (
  <TouchableOpacity style={styles.socialBtn} onPress={onPress} activeOpacity={0.7}>
    <SocialIcon name={name} />
    <Text style={styles.socialLabel}>{label}</Text>
  </TouchableOpacity>
);

/* Player silhouette — stylized cricket player with bat raised */
const PlayerSilhouette: React.FC = () => (
  <Svg width={180} height={220} viewBox="0 0 180 220">
    <Defs>
      <LinearGradient id="silhouetteGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.25" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
      </LinearGradient>
    </Defs>
    <G>
      {/* Head */}
      <Circle cx={90} cy={30} r={18} fill="url(#silhouetteGrad)" />
      {/* Body */}
      <Path
        d="M70 50 C70 48 75 46 90 46 C105 46 110 48 110 50 L112 120 C112 125 108 128 100 128 L80 128 C72 128 68 125 68 120 Z"
        fill="url(#silhouetteGrad)"
      />
      {/* Left arm holding bat up */}
      <Path
        d="M70 55 C65 55 60 60 60 70 L55 30 C54 22 60 18 65 20 C70 22 72 28 71 35 L74 60 Z"
        fill="url(#silhouetteGrad)"
      />
      {/* Right arm down */}
      <Path
        d="M110 55 C115 55 120 62 118 75 L120 115 C120 122 115 125 110 122 L108 80 Z"
        fill="url(#silhouetteGrad)"
      />
      {/* Bat */}
      <Rect
        x={48}
        y={5}
        width={8}
        height={45}
        rx={2}
        fill="#FFFFFF"
        opacity={0.85}
        transform="rotate(-15 52 28)"
      />
      <Rect
        x={47}
        y={48}
        width={10}
        height={4}
        rx={1}
        fill="#FFFFFF"
        opacity={0.85}
        transform="rotate(-15 52 50)"
      />
      {/* Legs */}
      <Path
        d="M75 128 L73 200 C73 205 78 207 82 205 L88 130 Z"
        fill="url(#silhouetteGrad)"
      />
      <Path
        d="M105 128 L107 200 C107 205 102 207 98 205 L92 130 Z"
        fill="url(#silhouetteGrad)"
      />
    </G>
  </Svg>
);

/* ------------------------------------------------------------------ *
 *  Main screen
 * ------------------------------------------------------------------ */

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation<LandingScreenNavigationProp>();

  const [modalVisible, setModalVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [sending, setSending] = useState(false);

  const { toast, show: showToast } = useToast();

  const handleContinueWithMobile = () => {
    setModalVisible(true);
    setPhone('');
  };

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Enter a valid 10-digit phone number');
      return;
    }
    setSending(true);
    // Simulate API latency, then navigate
    setTimeout(() => {
      setSending(false);
      setModalVisible(false);
      navigation.replace('Otp', { phone: `+91${phone.replace(/\D/g, '')}` });
    }, 600);
  };

  const handleSocialTap = (provider: 'google' | 'facebook' | 'apple' | 'email') => {
    const labels: Record<typeof provider, string> = {
      google: 'Google sign-in',
      facebook: 'Facebook sign-in',
      apple: 'Apple sign-in',
      email: 'Email sign-in',
    };
    showToast(`${labels[provider]} coming soon`);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Red header strip */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <ShieldLogo size={48} />
            <View style={styles.wordmark}>
              <Text style={styles.wordmark11}>11</Text>
              <Text style={styles.wordmarkDreamer}>DREAMER</Text>
            </View>
          </View>
          <Text style={styles.tagline}>DREAM BIG. PLAY BOLD. WIN MORE.</Text>
        </View>

        {/* Trust badges row */}
        <View style={styles.badgesRow}>
          <TrustBadge icon="users" label="10 Crore+ Users" />
          <View style={styles.badgeDivider} />
          <TrustBadge icon="trophy" label="100% Legal" />
          <View style={styles.badgeDivider} />
          <TrustBadge icon="rupee" label="Crores in Winnings" />
        </View>

        {/* Hero gradient block */}
        <View style={styles.hero}>
          <View style={[styles.heroGlow, styles.heroGlow1]} />
          <View style={[styles.heroGlow, styles.heroGlow2]} />
          <View style={[styles.heroGlow, styles.heroGlow3]} />
          <View style={styles.heroSilhouette}>
            <PlayerSilhouette />
          </View>
          <Text style={styles.heroText}>DREAM THE GAME.</Text>
        </View>

        {/* Login / Sign Up panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Login / Sign Up</Text>
          <Text style={styles.panelSubtitle}>
            Join 10 Crore+ cricket fans on 11Dreamer
          </Text>

          {/* Continue with Mobile button */}
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={handleContinueWithMobile}
          >
            <View style={styles.continueBtnLeft}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M22 16.9 V21 C22 21.5 21.5 22 21 22 C10.5 22 2 13.5 2 3 C2 2.5 2.5 2 3 2 H7.1 C7.6 2 8 2.4 8.1 2.9 L8.8 6.2 C8.9 6.6 8.7 7.1 8.4 7.4 L6.4 9.4 C7.9 12.7 10.3 15.1 13.6 16.6 L15.6 14.6 C15.9 14.3 16.4 14.1 16.8 14.2 L20.1 14.9 C20.6 15 21 15.4 21 15.9 Z"
                  fill="#FFFFFF"
                />
              </Svg>
              <Text style={styles.continueBtnText}>Continue with Mobile</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M9 6 L15 12 L9 18"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons row */}
          <View style={styles.socialRow}>
            <SocialButton name="google" label="Google" onPress={() => handleSocialTap('google')} />
            <SocialButton name="facebook" label="Facebook" onPress={() => handleSocialTap('facebook')} />
            <SocialButton name="apple" label="Apple" onPress={() => handleSocialTap('apple')} />
            <SocialButton name="email" label="Email" onPress={() => handleSocialTap('email')} />
          </View>
        </View>

        {/* Security footer */}
        <TouchableOpacity style={styles.securityBar} activeOpacity={0.7}>
          <View style={styles.securityBarLeft}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M12 2 L21 6 V12 C21 17 17 21 12 22 C7 21 3 17 3 12 V6 Z"
                fill="none"
                stroke={colors.brand.green}
                strokeWidth={1.8}
                strokeLinejoin="round"
              />
              <Path
                d="M9 12 L11 14 L15 10"
                fill="none"
                stroke={colors.brand.green}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View>
              <Text style={styles.securityTitle}>100% Safe & Secure</Text>
              <Text style={styles.securitySubtitle}>
                Bank-level security protects your data
              </Text>
            </View>
          </View>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
              d="M9 6 L15 12 L9 18"
              fill="none"
              stroke={colors.text.muted}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Terms text */}
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>

      {/* Phone input modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropTouch}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Enter your mobile number</Text>
            <Text style={styles.modalSubtitle}>
              We'll send you a 4-digit verification code
            </Text>

            <View
              style={[
                styles.phoneInputRow,
                phoneFocused && styles.phoneInputRowFocused,
              ]}
            >
              <View style={styles.countryPill}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
                <Svg width={10} height={10} viewBox="0 0 24 24">
                  <Path
                    d="M6 9 L12 15 L18 9"
                    fill="none"
                    stroke={colors.text.muted}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Mobile Number"
                placeholderTextColor={colors.text.placeholder}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                maxLength={10}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendOtpBtn,
                phone.replace(/\D/g, '').length < 10 && styles.sendOtpBtnDisabled,
              ]}
              disabled={phone.replace(/\D/g, '').length < 10 || sending}
              activeOpacity={0.85}
              onPress={handleSendOtp}
            >
              <Text style={styles.sendOtpBtnText}>
                {sending ? 'SENDING…' : 'SEND OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Toast */}
      <ToastView toast={toast} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    flexGrow: 1,
  },

  /* Header */
  header: {
    backgroundColor: colors.brand.red,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark11: {
    color: colors.brand.red,
    fontSize: 30,
    fontWeight: '900',
    backgroundColor: colors.text.onRed,
    paddingHorizontal: 4,
    borderRadius: 3,
    marginRight: 4,
    overflow: 'hidden',
  },
  wordmarkDreamer: {
    color: colors.text.onRed,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    color: colors.text.onRed,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.95,
  },

  /* Trust badges */
  badgesRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface.input,
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  badge: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.text.secondary,
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  badgeDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.subtle,
  },

  /* Hero */
  hero: {
    marginHorizontal: 16,
    marginTop: 18,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.brand.red,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    borderRadius: 999,
  },
  heroGlow1: {
    width: 320,
    height: 320,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -120,
  },
  heroGlow2: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
  },
  heroGlow3: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: 30,
  },
  heroSilhouette: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    position: 'absolute',
    bottom: 18,
    color: colors.text.onRed,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    opacity: 0.9,
  },

  /* Panel */
  panel: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.surface.panel,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  panelTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  panelSubtitle: {
    color: colors.text.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },

  /* Continue button (green gradient) */
  continueBtn: {
    backgroundColor: colors.brand.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.brand.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  continueBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  continueBtnText: {
    color: colors.text.onRed,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  dividerText: {
    color: colors.text.muted,
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '600',
  },

  /* Social row */
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  socialBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  socialLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },

  /* Security bar */
  securityBar: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: colors.surface.panel,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  securityBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityTitle: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  securitySubtitle: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 1,
  },

  /* Terms */
  termsText: {
    color: colors.text.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 24,
    marginHorizontal: 24,
    lineHeight: 16,
  },
  termsLink: {
    color: colors.brand.red,
    fontWeight: '700',
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: colors.surface.panelElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.strong,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.text.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.input,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    paddingHorizontal: 12,
  },
  phoneInputRowFocused: {
    borderColor: colors.brand.red,
    backgroundColor: 'rgba(206, 64, 77, 0.05)',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border.subtle,
    marginRight: 10,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCode: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    paddingVertical: 14,
  },
  sendOtpBtn: {
    marginTop: 16,
    backgroundColor: colors.brand.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendOtpBtnDisabled: {
    backgroundColor: 'rgba(206, 64, 77, 0.4)',
  },
  sendOtpBtnText: {
    color: colors.text.onRed,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

export default LandingScreen;
