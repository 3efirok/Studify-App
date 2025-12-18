import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import { colors, spacing, typography } from '../theme';

export const SessionsScreen = () => {
  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Сесії</Text>
        <Text style={styles.subtitle}>
          Тут відобразиться історія сесій та результати тестів.
        </Text>
      </View>
      <GlassCard>
        <Text style={styles.body}>
          Додай виклик /api/sessions і список проходжень карток/тестів.
        </Text>
      </GlassCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  body: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
});

export default SessionsScreen;
