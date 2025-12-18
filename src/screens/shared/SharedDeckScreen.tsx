import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { colors, spacing, typography } from '../../theme';
import { useCopyDeck } from '../../query/decks';
import { useSharedDeck } from '../../query/sharedDeck';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store/auth.store';

export const SharedDeckScreen = () => {
  const [code, setCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const navigation = useNavigation();
  const { token } = useAuth();

  const { data, isFetching, isError, refetch, isFetched } = useSharedDeck(
    submittedCode ?? undefined
  );
  const copyMutation = useCopyDeck();

  const handleOpen = () => {
    if (!code.trim()) return;
    setSubmittedCode(code.trim());
  };

  const handleCopy = async () => {
    if (!submittedCode) return;
    const created = await copyMutation.mutateAsync(submittedCode);
    setCode('');
    setSubmittedCode(null);
    navigation.navigate('DeckDetails' as never, { deckId: created.id } as never);
  };

  const handleStartSession = () => {
    if (!submittedCode || !data) return;
    navigation.navigate('SessionStart' as never, {
      deckId: data.id,
      shareCode: submittedCode,
      presetMode: 'TEST',
    } as never);
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Відкрити спільну тему</Text>
        <Text style={styles.subtitle}>
          Введи share code, щоб переглянути або скопіювати тему.
        </Text>
      </View>

      <GlassCard>
        <TextField
          label="Share code"
          value={code}
          onChangeText={setCode}
          placeholder="Напр. ABC123"
        />
        <PrimaryButton
          label="Open"
          onPress={handleOpen}
          style={{ marginTop: spacing.lg }}
          disabled={!code.trim()}
        />
      </GlassCard>

      {isFetching ? <Loader message="Завантажуємо тему..." /> : null}
      {isError ? <ErrorState message="Не знайдено тему" onRetry={refetch} /> : null}

      {isFetched && data ? (
        <GlassCard style={{ marginTop: spacing.lg }}>
          <Text style={styles.previewTitle}>{data.title}</Text>
          {data.description ? (
            <Text style={styles.previewSubtitle}>{data.description}</Text>
          ) : null}
          <Text style={styles.meta}>
            Карток: {data._count?.cards ?? 0} • Питань: {data._count?.questions ?? 0}
          </Text>
          <PrimaryButton
            label="Start session"
            onPress={handleStartSession}
            style={{ marginTop: spacing.md }}
          />
          {token ? (
            <PrimaryButton
              label={copyMutation.isPending ? 'Копіюємо...' : 'Copy to my decks'}
              onPress={handleCopy}
              loading={copyMutation.isPending}
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
        </GlassCard>
      ) : null}
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
  previewTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  previewSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
  },
});

export default SharedDeckScreen;
