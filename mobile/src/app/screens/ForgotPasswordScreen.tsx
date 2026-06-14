/**
 * File:        mobile/src/app/screens/ForgotPasswordScreen.tsx
 * Module:      Auth · Forgot Password Screen
 * Purpose:     Password recovery flow — email input, OTP verification, and new password
 *
 * Exports:
 *   - ForgotPasswordScreen
 *
 * Depends on:
 *   - react-native                    — View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput
 *   - react-native-svg                — Svg, Path
 *   - @react-navigation/native         — useNavigation
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-14
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// ─── Inline SVG Icons ───────────────────────────────────────────────────────

const BackIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const EmailIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M3 6h18v12H3zM3 6l9 7 9-7" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const LockIcon = ({ color = '#8a8a9a' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M5 11h14v10H5zM8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={1.5} fill="none" />
  </Svg>
);

const CheckIcon = ({ color = '#27c28a' }: { color?: string }) => (
  <Svg width={32} height={32} viewBox="0 0 24 24">
    <Path d="M5 12l5 5L19 7" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeIcon = ({ open = false }: { open?: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    {open ? (
      <>
        <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#8a8a9a" strokeWidth={1.5} fill="none" />
        <Path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#8a8a9a" strokeWidth={1.5} fill="none" />
      </>
    ) : (
      <>
        <Path d="M2 12s4-7 10-7c2 0 4 .5 5.5 1.5M22 12s-1.5 2.5-4 4.5M9.5 9.5L4 15M14.5 14.5L20 19" stroke="#8a8a9a" strokeWidth={1.5} fill="none" />
      </>
    )}
  </Svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState<'email' | 'otp' | 'newpass' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(30);

  React.useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const i = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(i);
  }, [step, timer]);

  const handleOtpChange = (idx: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isOtpComplete = otp.every(d => d.length === 1);
  const passwordsMatch = newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080810" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Reset Password</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Steps */}
        <View style={styles.progressRow}>
          {['email', 'otp', 'newpass'].map((s, i) => (
            <View key={s} style={styles.progressItem}>
              <View style={[
                styles.progressCircle,
                (step === s || (['email', 'otp', 'newpass'].indexOf(step) > i)) && styles.progressCircleDone
              ]}>
                <Text style={styles.progressCircleText}>
                  {(i + 1)}
                </Text>
              </View>
              {i < 2 && <View style={[styles.progressLine, ['email', 'otp', 'newpass'].indexOf(step) > i && styles.progressLineDone]} />}
            </View>
          ))}
        </View>

        {step === 'email' && (
          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <LockIcon color="#3F8FFF" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter the email address you used to sign up. We'll send you a code to reset your password.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <EmailIcon />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#5a5a6a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, !isEmailValid && styles.primaryBtnDisabled]}
              onPress={() => setStep('otp')}
              disabled={!isEmailValid}
            >
              <Text style={styles.primaryBtnText}>Send Reset Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'otp' && (
          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <EmailIcon color="#3F8FFF" />
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to {email || 'your email'}.
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={v => handleOtpChange(i, v)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, !isOtpComplete && styles.primaryBtnDisabled]}
              onPress={() => setStep('newpass')}
              disabled={!isOtpComplete}
            >
              <Text style={styles.primaryBtnText}>Verify Code</Text>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.resendTimer}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={() => setTimer(30)}>
                  <Text style={styles.resendBtn}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {step === 'newpass' && (
          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <LockIcon color="#3F8FFF" />
            </View>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from previous passwords.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrap}>
                <LockIcon />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#5a5a6a"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <EyeIcon open={showPassword} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <LockIcon />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#5a5a6a"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <View style={styles.passwordHints}>
              <Text style={styles.passwordHint}>• At least 6 characters</Text>
              <Text style={styles.passwordHint}>• One uppercase letter</Text>
              <Text style={styles.passwordHint}>• One number</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, !passwordsMatch && styles.primaryBtnDisabled]}
              onPress={() => setStep('done')}
              disabled={!passwordsMatch}
            >
              <Text style={styles.primaryBtnText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'done' && (
          <View style={[styles.body, { alignItems: 'center' }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(39,194,138,0.15)' }]}>
              <CheckIcon />
            </View>
            <Text style={styles.title}>Password Reset!</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              Your password has been successfully reset. You can now log in with your new password.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login' as any)}>
              <Text style={styles.primaryBtnText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingVertical: 16, gap: 0,
  },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  progressCircleDone: { backgroundColor: colors.brandPrimary },
  progressCircleText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  progressLine: {
    width: 50, height: 2, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 4,
  },
  progressLineDone: { backgroundColor: colors.brandPrimary },

  body: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: 'rgba(63,143,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, alignSelf: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#8a8a9a', fontSize: 13, marginTop: 8, lineHeight: 20, textAlign: 'center', marginBottom: 32 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#8a8a9a', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#10101c', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },

  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 6 },
  otpInput: {
    flex: 1, aspectRatio: 1, maxWidth: 48,
    backgroundColor: '#10101c', borderRadius: 12, color: '#fff',
    fontSize: 20, fontWeight: '900', textAlign: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  otpInputFilled: { borderColor: colors.brandPrimary, backgroundColor: 'rgba(206,64,77,0.08)' },

  resendRow: { alignItems: 'center', marginTop: 16 },
  resendTimer: { color: '#5a5a6a', fontSize: 13 },
  resendBtn: { color: colors.brandPrimary, fontSize: 13, fontWeight: '700' },

  passwordHints: { marginBottom: 16 },
  passwordHint: { color: '#5a5a6a', fontSize: 11, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: colors.brandPrimary, padding: 16, borderRadius: 12, alignItems: 'center',
    shadowColor: colors.brandPrimary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6, marginTop: 8,
  },
  primaryBtnDisabled: { backgroundColor: '#3a1015' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default ForgotPasswordScreen;
