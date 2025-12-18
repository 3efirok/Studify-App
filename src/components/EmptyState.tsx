import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GlassCard from './GlassCard';
import { colors, spacing, typography } from '../theme';
import PrimaryButton from './PrimaryButton';

type EmptyStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  title = 'Нічого немає',
  message = 'Спробуй додати щось нове.',
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <GlassCard padding="lg">
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </View>
  </GlassCard>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
});

export default EmptyState;
