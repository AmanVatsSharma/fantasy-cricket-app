/**
 * File:        mobile/src/app/screens/OtpScreen.tsx
 * Module:      Mobile · OTP Verification
 * Purpose:     4-digit OTP entry screen with auto-advance, shake on error,
 *              and 30-second resend countdown.
 *
 * Exports:
 *   - OtpScreen — second route in the dev preview app
 *
 * Depends on:
 *   - react-native, react-native-svg
 *   - @react-navigation/native + stack
 *   - @/api/apiClient (aliased to apiClient.stub by Metro)
 *   - @/store/useAuthStore
 *   - @/theme/colors
 *
 * Route params: { phone: string }   — passed by LandingScreen on SEND OTP
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
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
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';

type OtpScreenNavigationProp = StackNavigationProp<any, 'Otp'>;
type OtpScreenRouteProp = RouteProp<any, 'Otp'>;

const RESEND_SECONDS = 30;

export const OtpScreen: React.FC = () => {
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();
  const phoneFromRoute = (route.params as { phone?: string })?.phone ?? '+91xxxxxxxxxx';

  const login = useAuthStore((s) => s.login);

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  /* ---------- Effects ---------- */

  // Start the 30-second resend countdown
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

  // Auto-focus the first box on mount
  useEffect(() => {
    setTimeout(() => otpInputRefs.current[0]?.focus(), 250);
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

  /* ---------- Handlers ---------- */

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError(null);

    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all four boxes are filled
    if (digit && index === 3) {
      const code = next.join('');
      if (code.length === 4) {
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
        setOtp(['', '', '', '']);
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

  /* ---------- Render ---------- */

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header strip with back button + wordmark */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M15 6 L9 12 L15 18"
              fill="none"
              stroke={colors.text.onRed}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerWordmark}>
          <View style={styles.headerEleven}>
            <Text style={styles.headerElevenText}>11</Text>
          </View>
          <Text style={styles.headerDreamer}>DREAMER</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 4-digit code to{' '}
          <Text style={styles.phoneHighlight}>{phoneFromRoute}</Text>
        </Text>

        {/* OTP boxes */}
        <Animated.View
          style={[
            styles.otpRow,
            {
              transform: [{ translateX: shakeAnim }],
            },
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

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Verify button */}
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            otp.join('').length < 4 && styles.verifyBtnDisabled,
          ]}
          disabled={otp.join('').length < 4 || loading}
          activeOpacity={0.85}
          onPress={() => handleVerify(otp.join(''))}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.onRed} />
          ) : (
            <Text style={styles.verifyBtnText}>VERIFY</Text>
          )}
        </TouchableOpacity>

        {/* Resend row */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendWaiting}>
              Resend code in{' '}
              <Text style={styles.resendCountdown}>{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendActive}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.helperText}>
          Demo: enter any 4 digits — the stub will respond with "Invalid OTP" so
          you can see the error UX.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },

  /* Header */
  header: {
    backgroundColor: colors.brand.red,
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingBottom: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerEleven: {
    backgroundColor: colors.text.onRed,
    paddingHorizontal: 4,
    borderRadius: 3,
    marginRight: 4,
  },
  headerElevenText: {
    color: colors.brand.red,
    fontSize: 18,
    fontWeight: '900',
  },
  headerDreamer: {
    color: colors.text.onRed,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },

  /* Body */
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  phoneHighlight: {
    color: colors.text.primary,
    fontWeight: '700',
  },

  /* OTP boxes */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  otpBox: {
    width: 60,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surface.input,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.brand.red,
    backgroundColor: 'rgba(206, 64, 77, 0.05)',
  },
  otpBoxError: {
    borderColor: colors.feedback.error,
  },
  otpInput: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },

  /* Error */
  errorText: {
    color: colors.feedback.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '600',
  },

  /* Verify */
  verifyBtn: {
    marginTop: 28,
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
  verifyBtnDisabled: {
    backgroundColor: 'rgba(206, 64, 77, 0.4)',
  },
  verifyBtnText: {
    color: colors.text.onRed,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  /* Resend */
  resendRow: {
    marginTop: 22,
    alignItems: 'center',
  },
  resendWaiting: {
    color: colors.text.muted,
    fontSize: 13,
  },
  resendCountdown: {
    color: colors.brand.gold,
    fontWeight: '800',
  },
  resendActive: {
    color: colors.brand.red,
    fontSize: 14,
    fontWeight: '800',
  },

  /* Helper */
  helperText: {
    color: colors.text.subtle,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});

export default OtpScreen;
