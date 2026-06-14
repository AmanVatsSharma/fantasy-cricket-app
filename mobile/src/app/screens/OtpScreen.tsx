/**
 * File:        mobile/src/app/screens/OtpScreen.tsx
 * Module:      Mobile · OTP Verification (Redesigned)
 * Purpose:     6-digit OTP entry screen matching design image 22
 *
 * Features:
 *   - 6-digit OTP entry with auto-advance
 *   - Dark gradient header with player silhouette
 *   - Shield phone icon
 *   - "VERIFY & CONTINUE" button with arrow
 *   - "Auto Read OTP" card
 *   - 30-second resend countdown (MM:SS format)
 *   - Shake animation on error
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Svg, Path, G, Circle, LinearGradient, Defs, ClipPath, Rect } from 'react-native-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';

type OtpScreenNavigationProp = StackNavigationProp<any, 'Otp'>;
type OtpScreenRouteProp = RouteProp<any, 'Otp'>;

const RESEND_SECONDS = 30;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_COUNT = 6;

export const OtpScreen: React.FC = () => {
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const phoneFromRoute = (route.params as { phone?: string })?.phone ?? '+91 98765 43210';

  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState<string[]>(Array(OTP_COUNT).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  /* ---------- Effects ---------- */

  useEffect(() => {
    setCountdown(RESEND_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
  }, []);

  /* ---------- Helpers ---------- */

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  /* ---------- Handlers ---------- */

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError(null);

    if (digit && index < OTP_COUNT - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (digit && index === OTP_COUNT - 1) {
      const code = next.join('');
      if (code.length === OTP_COUNT) {
        Keyboard.dismiss();
        handleVerify(code);
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/verify-otp', { phone: phoneFromRoute, otp: code });
      if (res.data?.success) {
        login(
          res.data.token ?? 'demo-token-123',
          res.data.userId ?? 1,
          res.data.email ?? 'demo@11dreamer.com',
          res.data.userName ?? 'Cricket Fan'
        );
        navigation.replace('Account');
      } else {
        setError(res.data?.message ?? 'Invalid OTP. Please try again.');
        triggerShake();
        setOtp(Array(OTP_COUNT).fill(''));
        setTimeout(() => otpInputRefs.current[0]?.focus(), 200);
      }
    } catch (e) {
      setError('Network error. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    apiClient.post('/auth/request-otp', { phone: phoneFromRoute }).catch(() => {});
  };

  const handleBack = () => navigation.goBack();

  /* ---------- Player Silhouette SVG ---------- */

  const PlayerSilhouette = () => (
    <Svg
      width={SCREEN_WIDTH * 0.55}
      height={180}
      viewBox="0 0 220 180"
      style={{ position: 'absolute', right: -10, bottom: 0 }}
    >
      <Defs>
        <LinearGradient id="playerGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(206,64,77,0.35)" />
          <Stop offset="100%" stopColor="rgba(8,8,16,0)" />
        </LinearGradient>
        <ClipPath id="playerClip">
          <Rect x="20" y="0" width="200" height="180" rx="10" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#playerClip)">
        {/* Simplified cricket player silhouette - batter stance */}
        {/* Head */}
        <Circle cx="110" cy="30" r="18" fill="rgba(0,0,0,0.5)" />
        {/* Helmet */}
        <Path
          d="M92 28 C92 16, 128 16, 128 28"
          fill="rgba(0,0,0,0.6)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        {/* Body */}
        <Path
          d="M95 48 L90 95 L110 95 L125 95 L130 50 C130 44, 95 44, 95 48Z"
          fill="rgba(0,0,0,0.45)"
        />
        {/* Left arm (holding bat) */}
        <Path
          d="M95 52 L75 70 L65 65 L80 48"
          fill="rgba(0,0,0,0.4)"
        />
        {/* Right arm */}
        <Path
          d="M125 55 L140 75 L135 80 L118 60"
          fill="rgba(0,0,0,0.4)"
        />
        {/* Bat */}
        <Path
          d="M60 60 L30 30 L25 35 L55 68Z"
          fill="rgba(180,140,100,0.3)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />
        {/* Legs */}
        <Path
          d="M100 92 L88 140 L82 160 L92 162 L100 145 L105 145 L110 162 L120 160 L112 140"
          fill="rgba(0,0,0,0.4)"
        />
        {/* Pads */}
        <Path
          d="M80 140 L78 158 L94 160 L96 142"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <Path
          d="M124 140 L126 158 L110 160 L108 142"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
      </G>
      {/* Red accent sweep */}
      <Path
        d="M0 140 Q110 100, 220 130 L220 180 L0 180Z"
        fill="url(#playerGrad)"
      />
    </Svg>
  );

  /* ---------- Render ---------- */

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Dark gradient header with player silhouette */}
      <View style={styles.header}>
        {/* Background gradient overlay */}
        <View style={styles.headerGradient} />

        {/* 11DREAMER Logo */}
        <View style={styles.headerContent}>
          <View style={styles.logoRow}>
            <View style={styles.logoEleven}>
              <Text style={styles.logoElevenText}>11</Text>
            </View>
            <Text style={styles.logoDreamer}>DREAMER</Text>
          </View>
          <Text style={styles.logoTagline}>PICK. PLAY. WIN BIG.</Text>
        </View>

        {/* Player silhouette */}
        <PlayerSilhouette />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Shield + Verify icon */}
        <View style={styles.shieldContainer}>
          <View style={styles.shieldCircle}>
            {/* Outer glow */}
            <View style={styles.shieldGlow} />
            {/* Shield SVG */}
            <Svg width={48} height={48} viewBox="0 0 24 24">
              <Path
                d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V5l-8-3z"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
              />
              {/* Phone icon inside shield */}
              <Path
                d="M12 14a2 2 0 100-4 2 2 0 000 4z"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M8.5 8.5L5.5 5.5"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Green checkmark */}
              <Path
                d="M8 13l3 3 5-5"
                fill="none"
                stroke="#3DD870"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Mobile Number</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to{' '}
          <Text style={styles.phoneText}>{phoneFromRoute}</Text>
        </Text>

        {/* Phone with Change link */}
        <TouchableOpacity style={styles.phoneRow} activeOpacity={0.7}>
          <Text style={styles.phoneLabel}>+91 98765 43210</Text>
          <View style={styles.changeRow}>
            <Text style={styles.changeText}>Change</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path
                d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                fill="none"
                stroke={colors.brand.gold}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </TouchableOpacity>

        {/* OTP Inputs */}
        <Animated.View
          style={[
            styles.otpRow,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {otp.map((digit, i) => (
            <View
              key={i}
              style={[
                styles.otpBox,
                focusedIndex === i && styles.otpBoxFocused,
                error && styles.otpBoxError,
              ]}
            >
              <TextInput
                ref={(el) => (otpInputRefs.current[i] = el)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(t) => handleOtpChange(t, i)}
                onKeyPress={(e) => handleOtpKeyPress(e, i)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!loading}
                selectTextOnFocus
                caretHidden={false}
              />
            </View>
          ))}
        </Animated.View>

        {/* Safety notice */}
        <View style={styles.safetyRow}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill="none" stroke={colors.brand.green} strokeWidth="2" />
            <Path
              d="M8 12l3 3 5-5"
              fill="none"
              stroke={colors.brand.green}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.safetyText}>
            Your number is safe with us. We never share your information.
          </Text>
        </View>

        {/* Verify & Continue button */}
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            otp.join('').length < OTP_COUNT && styles.verifyBtnDisabled,
          ]}
          disabled={otp.join('').length < OTP_COUNT || loading}
          activeOpacity={0.85}
          onPress={() => handleVerify(otp.join(''))}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.onRed} />
          ) : (
            <View style={styles.verifyBtnContent}>
              <Text style={styles.verifyBtnText}>VERIFY &amp; CONTINUE</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path
                  d="M5 12h14M12 5l7 7-7 7"
                  fill="none"
                  stroke={colors.text.onRed}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          )}
        </TouchableOpacity>

        {/* OR separator */}
        <Text style={styles.orText}>OR</Text>

        {/* Auto Read OTP card */}
        <TouchableOpacity style={styles.autoReadCard} activeOpacity={0.7}>
          <View style={styles.autoReadLeft}>
            <View style={styles.autoReadIcon}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M8 9h8M8 13h4"
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.autoReadTitle}>Auto Read OTP</Text>
              <Text style={styles.autoReadDesc}>Allow to read OTP automatically</Text>
            </View>
          </View>
          <View style={styles.autoReadBadge}>
            <Text style={styles.autoReadBadgeText}>Recommended</Text>
          </View>
        </TouchableOpacity>

        {/* Get Help link */}
        <TouchableOpacity style={styles.helpRow} activeOpacity={0.7}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill="none" stroke={colors.brand.gold} strokeWidth="2" />
            <Path
              d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
              fill="none"
              stroke={colors.brand.gold}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx="12" cy="17" r="0.5" fill={colors.brand.gold} />
          </Svg>
          <Text style={styles.helpText}>
            Didn&apos;t receive OTP? <Text style={styles.helpLink}>Get Help</Text>
          </Text>
        </TouchableOpacity>

        {/* Resend row */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendWaiting}>
              Resend OTP in{' '}
              <Text style={styles.resendCountdown}>{formatTime(countdown)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendActive}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },

  /* ---------- Header ---------- */
  header: {
    height: 200,
    backgroundColor: '#050508',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080810',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEleven: {
    backgroundColor: colors.text.onRed,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  logoElevenText: {
    color: colors.brand.red,
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  logoDreamer: {
    color: colors.text.onRed,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  logoTagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },

  /* ---------- Body ---------- */
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: 'center',
  },

  /* Shield */
  shieldContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shieldGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(61,216,112,0.08)',
    top: -6,
    left: -6,
  },

  /* Title */
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },

  /* Subtitle */
  subtitle: {
    color: colors.text.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  phoneText: {
    color: colors.text.primary,
    fontWeight: '700',
  },

  /* Phone row with Change */
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  phoneLabel: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    color: colors.brand.gold,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
  },

  /* OTP boxes */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 14,
  },
  otpBox: {
    width: (SCREEN_WIDTH - 48 - 40) / 6,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.surface.input,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.brand.red,
    backgroundColor: 'rgba(206, 64, 77, 0.06)',
    borderWidth: 2,
  },
  otpBoxError: {
    borderColor: colors.feedback.error,
  },
  otpInput: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },

  /* Safety notice */
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  safetyText: {
    color: colors.text.muted,
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },

  /* Verify button */
  verifyBtn: {
    width: '100%',
    backgroundColor: colors.brand.red,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  verifyBtnDisabled: {
    backgroundColor: 'rgba(206, 64, 77, 0.35)',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: {
    color: colors.text.onRed,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginRight: 8,
  },

  /* OR */
  orText: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 18,
  },

  /* Auto Read OTP card */
  autoReadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.surface.panel,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 16,
  },
  autoReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoReadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  autoReadTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  autoReadDesc: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  autoReadBadge: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  autoReadBadgeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Help row */
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  helpText: {
    color: colors.text.muted,
    fontSize: 12,
    marginLeft: 4,
  },
  helpLink: {
    color: colors.brand.gold,
    fontWeight: '700',
  },

  /* Resend */
  resendRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  resendWaiting: {
    color: colors.text.muted,
    fontSize: 12,
  },
  resendCountdown: {
    color: colors.brand.gold,
    fontWeight: '800',
  },
  resendActive: {
    color: colors.brand.red,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default OtpScreen;
