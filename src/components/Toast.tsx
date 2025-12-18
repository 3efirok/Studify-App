import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

type ToastType = 'info' | 'success' | 'error';

type ToastState = {
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const show = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    Haptics.selectionAsync();
  };

  useEffect(() => {
    if (!toast) return;
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [toast, opacity]);

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View style={[styles.container, { opacity }]}>
          <LinearGradient
            colors={
              toast.type === 'success'
                ? ['rgba(90, 246, 181, 0.4)', colors.glass]
                : toast.type === 'error'
                ? ['rgba(255, 107, 107, 0.4)', colors.glass]
                : ['rgba(124, 231, 255, 0.35)', colors.glass]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <BlurView intensity={40} tint="dark" style={styles.blur}>
              <Text style={styles.text}>{toast.message}</Text>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  gradient: {
    borderRadius: 14,
    padding: 1,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
});
