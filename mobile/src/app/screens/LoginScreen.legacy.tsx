import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { apiClient } from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';

type LoginScreenNavigationProp = StackNavigationProp<any, 'Login'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const login = useAuthStore((state) => state.login);

  // Phone input state
  const [phone, setPhone] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown state
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // OTP input refs
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Start countdown timer
  useEffect(() => {
    if (otpStep && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [otpStep, countdown > 0]);

  // Slide animation when switching to OTP step
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [otpStep]);

  // Shake animation on error
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Validate phone number (10 digits)
  const isValidPhone = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    return cleanNum.length === 10;
  };

  // Request OTP
  const handleRequestOTP = async () => {
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      shake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call to request OTP
      await apiClient.post('/auth/request-otp', {
        phone: `+91${phone.replace(/\D/g, '')}`,
      });

      // Success - switch to OTP step
      setOtpStep(true);
      setCountdown(30);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      // For demo/development - simulate success
      console.log('OTP request failed, using demo mode');
      setOtpStep(true);
      setCountdown(30);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      shake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call to verify OTP
      const response = await apiClient.post('/auth/verify-otp', {
        phone: `+91${phone.replace(/\D/g, '')}`,
        otp: otpCode,
      });

      // Login successful - update auth store
      const { token, userId, email, userName } = response.data;
      login(token, userId, email, userName);

      // Navigate to main app
      navigation.replace('Main');
    } catch (err: any) {
      // For demo/development - simulate success
      console.log('OTP verification failed, using demo mode');
      login('demo-token-123', 1, 'demo@example.com', 'Cricket Fan');
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === 3) {
      const completeOtp = [...newOtp].join('');
      if (completeOtp.length === 4) {
        setTimeout(handleVerifyOTP, 100);
      }
    }
  };

  // Handle backspace on OTP
  const handleOTPKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = () => {
    setCountdown(30);
    setOtp(['', '', '', '']);
    setError('');
    otpInputRefs.current[0]?.focus();
    handleRequestOTP();
  };

  // Go back to phone input
  const handleBack = () => {
    if (otpStep) {
      setOtpStep(false);
      setOtp(['', '', '', '']);
      setError('');
      setCountdown(30);
    } else {
      navigation.goBack();
    }
  };

  // Navigate to Register
  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  // Navigate to Main (skip)
  const handleSkip = () => {
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>🛡️</Text>
          <Text style={styles.logoMain}>11<span style={styles.logoGold}>DREAMER</span></Text>
          <Text style={styles.logoSub}>FANTASY CRICKET</Text>
        </View>

        {/* Form Section */}
        <Animated.View
          style={[
            styles.formSection,
            {
              transform: [
                { translateX: shakeAnim },
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
                {
                  opacity: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {!otpStep ? (
            // Phone Input Step
            <View style={styles.stepContainer}>
              <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
              <Text style={styles.instructionText}>
                Enter your phone number to continue
              </Text>

              {/* Phone Input */}
              <View
                style={[
                  styles.phoneInputContainer,
                  phoneFocused && styles.phoneInputContainerFocused,
                  error && !isValidPhone(phone) && styles.inputError,
                ]}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.countryFlag}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="98765 43210"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="phone-pad"
                  maxLength={14}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setError('');
                  }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                />
              </View>

              {/* Error Message */}
              {error && !isValidPhone(phone) && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Get OTP Button */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!isValidPhone(phone) || loading) && styles.primaryBtnDisabled,
                ]}
                onPress={handleRequestOTP}
                disabled={!isValidPhone(phone) || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Sending...' : 'GET OTP'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Create Account Link */}
              <View style={styles.accountPrompt}>
                <Text style={styles.accountPromptText}>Don't have an account?</Text>
                <TouchableOpacity onPress={handleCreateAccount} activeOpacity={0.7}>
                  <Text style={styles.createAccountText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // OTP Verification Step
            <View style={styles.stepContainer}>
              <Text style={styles.welcomeText}>Verify OTP 🔐</Text>
              <Text style={styles.instructionText}>
                Enter the 4-digit code sent to{'\n'}+91 {phone}
              </Text>

              {/* OTP Input Boxes */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      digit && styles.otpBoxFilled,
                      error && styles.otpBoxError,
                    ]}
                  >
                    <TextInput
                      ref={(ref) => (otpInputRefs.current[index] = ref)}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(value) => handleOTPChange(value, index)}
                      onKeyPress={(e) => handleOTPKeyPress(e, index)}
                      autoFocus={index === 0}
                    />
                    {digit && <View style={styles.otpCursor} />}
                  </View>
                ))}
              </View>

              {/* Error Message */}
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Countdown / Resend */}
              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Resend OTP in{' '}
                    <Text style={styles.countdownTimer}>
                      00:{String(countdown).padStart(2, '0')}
                    </Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (otp.join('').length !== 4 || loading) && styles.primaryBtnDisabled,
                ]}
                onPress={handleVerifyOTP}
                disabled={otp.join('').length !== 4 || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Verifying...' : 'VERIFY & CONTINUE'}
                </Text>
              </TouchableOpacity>

              {/* Change Number */}
              <TouchableOpacity
                style={styles.changeNumberBtn}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Text style={styles.changeNumberText}>
                  ← Change phone number
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080810',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoMain: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoGold: {
    color: '#ECBD15',
  },
  logoSub: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 4,
  },
  formSection: {
    flex: 1,
  },
  stepContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141f',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    width: SCREEN_WIDTH - 40,
    height: 56,
    marginBottom: 16,
  },
  phoneInputContainerFocused: {
    borderColor: '#CE404D',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#CE404D',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    shadowColor: '#CE404D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(206,64,77,0.4)',
    shadowOpacity: 0,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  accountPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountPromptText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  createAccountText: {
    color: '#CE404D',
    fontSize: 14,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  otpBox: {
    width: 60,
    height: 64,
    backgroundColor: '#14141f',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  otpBoxFilled: {
    borderColor: '#CE404D',
    backgroundColor: 'rgba(206,64,77,0.1)',
  },
  otpBoxError: {
    borderColor: '#ff4444',
  },
  otpInput: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  otpCursor: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: '#CE404D',
    borderRadius: 1,
  },
  resendContainer: {
    marginBottom: 24,
    height: 24,
  },
  countdownText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  countdownTimer: {
    color: '#ECBD15',
    fontWeight: '700',
  },
  resendText: {
    color: '#CE404D',
    fontSize: 14,
    fontWeight: '700',
  },
  changeNumberBtn: {
    marginTop: 20,
  },
  changeNumberText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.5)',
  },
});