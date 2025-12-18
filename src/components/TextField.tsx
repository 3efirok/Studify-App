import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { blur as blurLevels, colors, radii, spacing, typography } from '../theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const TextField = ({
  label,
  helperText,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const inputStyle = style as StyleProp<TextStyle>;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.fieldWrapper,
          focused && styles.fieldFocused,
          error && styles.fieldError,
        ]}
      >
        <LinearGradient
          colors={
            focused
              ? ['rgba(124, 231, 255, 0.32)', 'rgba(124, 140, 255, 0.18)']
              : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.gradient]}
          pointerEvents="none"
        />
        <BlurView
          intensity={blurLevels.subtle}
          tint="dark"
          style={[StyleSheet.absoluteFillObject, styles.blur]}
          pointerEvents="none"
        />
        <View style={styles.field}>
          <TextInput
            {...inputProps}
            style={[styles.input, inputStyle]}
            placeholderTextColor={
              inputProps.placeholderTextColor ?? colors.textSecondary
            }
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
        </View>
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldWrapper: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  blur: {
    borderRadius: radii.md,
    backgroundColor: colors.glass,
  },
  gradient: {
    opacity: 0.6,
  },
  field: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  fieldFocused: {
    borderColor: 'rgba(124, 231, 255, 0.4)',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    padding: 0,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});

export default TextField;
