/**
 * File:        mobile/src/app/components/Toast.tsx
 * Module:      Mobile · UI Primitives
 * Purpose:     Shared in-screen toast. Slide-up + fade-in animation, auto
 *              dismisses after ~2s. Used by LandingScreen (social taps)
 *              and HomeScreen (tab taps, match joins, etc).
 *
 * Exports:
 *   - useToast       — hook returning { toast, show }
 *   - ToastView      — the positioned Animated.View to render in the host
 *
 * Usage:
 *   const { toast, show } = useToast();
 *   show('Google sign-in coming soon');
 *   ...
 *   <ToastView toast={toast} />
 *
 * Author:      Aman Vats Sharma
 * Last-updated: 2026-06-12
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

const VISIBLE_MS = 1800;
const ANIM_MS = 220;

export type ToastState = { message: string; key: number } | null;

export function useToast(): {
  toast: ToastState;
  show: (message: string) => void;
} {
  const [toast, setToast] = useState<ToastState>(null);
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);
  const anim = useRef(new Animated.Value(0)).current;

  const show = (message: string) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setToast({ message, key: Date.now() });
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: ANIM_MS,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      dismissTimer.current = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: ANIM_MS,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }).start(() => setToast(null));
      }, VISIBLE_MS);
    });
  };

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  return { toast, show };
}

export const ToastView: React.FC<{
  toast: ToastState;
  bottomOffset?: number;
}> = ({ toast, bottomOffset = 32 }) => {
  if (!toast) return null;
  // Re-mount the Animated.View on each new toast so the animation restarts
  return <ToastViewInner key={toast.key} message={toast.message} bottomOffset={bottomOffset} />;
};

const ToastViewInner: React.FC<{ message: string; bottomOffset: number }> = ({
  message,
  bottomOffset,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: ANIM_MS,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      dismissTimer.current = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: ANIM_MS,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }).start();
      }, VISIBLE_MS);
    });
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [anim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          bottom: bottomOffset,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: colors.surface.panelElevated,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
  },
  toastText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
