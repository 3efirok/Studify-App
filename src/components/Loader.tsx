import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type LoaderProps = {
  message?: string;
};

export const Loader = ({ message }: LoaderProps) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.accent} />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
});

export default Loader;
