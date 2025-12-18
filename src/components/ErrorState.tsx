import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import GlassCard from './GlassCard';
import PrimaryButton from './PrimaryButton';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) => (
  <GlassCard padding="lg" style={styles.card}>
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <View style={styles.buttonWrapper}>
          <PrimaryButton label={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  </GlassCard>
);

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  body: {
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
});

export default ErrorState;
