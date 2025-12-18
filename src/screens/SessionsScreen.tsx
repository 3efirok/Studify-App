import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { colors, spacing, typography } from '../theme';
import { useSessionResult, useSessions } from '../query/sessions';
import { SessionHistoryItem } from '../types/api';
import { computeProgressPercent } from '../utils/percent';

const SessionRow = ({
  session,
  onOpen,
}: {
  session: SessionHistoryItem;
  onOpen: (session: SessionHistoryItem) => void;
}) => {
  const mode = String((session as any).mode ?? '');
  const canOpen = mode === 'TEST' || mode === 'TEST_FLASH';
  const sessionId = String((session as any).id);
  const { data: result, isLoading: resultLoading } = useSessionResult(
    canOpen ? sessionId : undefined
  );

  const deckTitle = (session as any).deck?.title ?? `Deck ${String(session.deckId)}`;
  const startedAt = (session as any).startedAt ?? (session as any).createdAt;
  const finishedAt = (session as any).finishedAt;

  const formatDate = (value: unknown) => {
    const str = String(value ?? '');
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) return str || '—';
    return date.toLocaleString();
  };

  const modeLabel = (m: string) => {
    if (m === 'CARD') return 'Картки';
    if (m === 'TEST') return 'Тест';
    if (m === 'TEST_FLASH') return 'Тест з карток';
    return m;
  };

  const stats = canOpen && result && (result as any).stats ? (result as any).stats : null;
  const showStats = !!stats && Number.isFinite(Number(stats.totalAnswered));
  const percent = showStats
    ? computeProgressPercent({
        progressPercent: (stats as any).progressPercent,
        correct: (stats as any).correctCount,
        total: (stats as any).totalAnswered,
      })
    : null;

  const correctCount = (session as any).correctCount;
  const totalCards = (session as any).totalCards;
  const hasCardResult =
    mode === 'CARD' &&
    finishedAt &&
    typeof correctCount === 'number' &&
    typeof totalCards === 'number' &&
    totalCards >= 0;

  return (
    <Pressable
      onPress={() => onOpen(session)}
      disabled={!canOpen}
      style={({ pressed }) => [
        styles.itemPressable,
        { opacity: pressed && canOpen ? 0.85 : 1 },
      ]}
    >
      <GlassCard padding="lg">
        <View style={styles.row}>
          <Text style={styles.itemTitle}>{deckTitle}</Text>
          <Text style={[styles.badge, canOpen ? styles.badgeActive : styles.badgeMuted]}>
            {modeLabel(mode)}
          </Text>
        </View>
        <Text style={styles.itemMeta}>Початок: {formatDate(startedAt)}</Text>
        <Text style={styles.itemMeta}>
          Статус: {finishedAt ? `завершено (${formatDate(finishedAt)})` : 'в процесі'}
        </Text>

        {canOpen ? (
          <Text style={styles.itemMeta}>
            Результат:{' '}
            {resultLoading
              ? '...'
              : showStats
                ? `${String(stats.correctCount)} / ${String(stats.totalAnswered)} • ${String(
                    percent ?? 0
                  )}%`
                : '—'}
          </Text>
        ) : hasCardResult ? (
          <Text style={styles.itemMeta}>
            Результат: {String(correctCount)} / {String(totalCards)}
          </Text>
        ) : (
          <Text style={styles.hint}>Результат доступний тільки для тестів</Text>
        )}
      </GlassCard>
    </Pressable>
  );
};

export const SessionsScreen = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch } = useSessions();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const sessions = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return [...list].sort((a, b) => {
      const at = Date.parse(String((a as any).startedAt ?? (a as any).createdAt ?? ''));
      const bt = Date.parse(String((b as any).startedAt ?? (b as any).createdAt ?? ''));
      if (Number.isFinite(at) && Number.isFinite(bt)) return bt - at;
      return Number((b as any).id) - Number((a as any).id);
    });
  }, [data]);

  const openSession = (session: SessionHistoryItem) => {
    const mode = (session as any).mode;
    if (mode !== 'TEST' && mode !== 'TEST_FLASH') return;
    navigation.navigate('Decks', {
      screen: 'SessionResult',
      params: { sessionId: String((session as any).id) },
    });
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Завантажуємо історію..." />
      </Screen>
    );
  }

  if (isError) {
    return <ErrorState message="Не вдалося завантажити сесії" onRetry={refetch} />;
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Сесії</Text>
        <Text style={styles.subtitle}>
          Тут відобразиться історія сесій та результати тестів.
        </Text>
      </View>

      {sessions.length === 0 ? (
        <GlassCard>
          <Text style={styles.body}>Поки що немає сесій.</Text>
        </GlassCard>
      ) : (
        <View style={styles.list}>
          {sessions.map((session) => (
            <SessionRow
              key={String((session as any).id)}
              session={session}
              onOpen={openSession}
            />
          ))}
        </View>
      )}
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
  list: {
    gap: spacing.md,
  },
  itemPressable: {
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  badge: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeActive: {
    backgroundColor: 'rgba(124, 231, 255, 0.14)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeMuted: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textSecondary,
  },
  itemMeta: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
  },
  hint: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
  },
});

export default SessionsScreen;
