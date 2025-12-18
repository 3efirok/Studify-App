import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SpacingKey, blur as blurLevels, colors, radii, spacing } from '../theme';

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: SpacingKey | number;
  intensity?: number;
};

export const GlassCard = ({
  children,
  style,
  padding = 'lg',
  intensity,
}: GlassCardProps) => {
  const resolvedPadding = typeof padding === 'number' ? padding : spacing[padding];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[
          'rgba(124, 231, 255, 0.18)',
          'rgba(124, 140, 255, 0.12)',
          'rgba(124, 231, 255, 0.18)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, styles.gradient]}
        pointerEvents="none"
      />
      <BlurView
        intensity={intensity ?? blurLevels.medium}
        tint="dark"
        style={[StyleSheet.absoluteFillObject, styles.blur, { borderRadius: radii.lg }]}
        pointerEvents="none"
      />
      <View style={[styles.inner, { padding: resolvedPadding }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 0,
  },
  gradient: {
    opacity: 0.45,
  },
  blur: {
    opacity: 0.6,
    backgroundColor: 'transparent',
  },
  inner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
});

export default GlassCard;
