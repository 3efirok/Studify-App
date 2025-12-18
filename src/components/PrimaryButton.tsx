import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { blur as blurLevels, colors, radii, spacing, typography } from '../theme';

type PrimaryButtonProps = {
  label: string;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, 'style'>;

export const PrimaryButton = ({
  label,
  loading = false,
  disabled,
  icon,
  fullWidth = true,
  style,
  onPress,
  ...pressableProps
}: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.pressable,
        fullWidth && styles.fullWidth,
        {
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      <View style={styles.inner}>
        <LinearGradient
          colors={['rgba(124, 231, 255, 0.5)', 'rgba(124, 140, 255, 0.45)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.gradient]}
          pointerEvents="none"
        />
        <BlurView
          intensity={blurLevels.medium}
          tint="dark"
          style={[StyleSheet.absoluteFillObject, styles.blur]}
          pointerEvents="none"
        />
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radii.md,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 0,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.glass,
    borderColor: colors.border,
    borderWidth: 1,
  },
  gradient: {
    opacity: 0.7,
  },
  blur: {
    borderRadius: radii.md - 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default PrimaryButton;
