import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useSessionResult } from '../../query/sessions';
import { SessionResultFlash } from '../../types/api';

type Props = NativeStackScreenProps<DeckStackParamList, 'SessionResult'>;

export const SessionResultScreen = ({ route }: Props) => {
  const { sessionId } = route.params;
  const { data, isLoading, isError, refetch } = useSessionResult(sessionId);

  const isFlashResult = (res: unknown): res is SessionResultFlash => {
    return !!res && typeof res === 'object' && 'mode' in res && (res as any).mode === 'TEST_FLASH';
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Завантажуємо результати..." />
      </Screen>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Не вдалося отримати результат" onRetry={refetch} />;
  }

  if (isFlashResult(data)) {
    const correct = data.stats.correctCount;
    const total = data.stats.totalAnswered;
    const percent = Math.round(data.stats.progressPercent ?? (total ? (correct / total) * 100 : 0));
    const mistakes = data.items.filter((item) => !item.isCorrect);

    return (
      <Screen scrollable>
        <View style={styles.header}>
          <Text style={styles.title}>Результат FLASH</Text>
          <Text style={styles.subtitle}>{data.deck.title}</Text>
        </View>

        <GlassCard>
          <Text style={styles.score}>{percent}%</Text>
          <Text style={styles.meta}>
            Правильно: {correct} / {total}
          </Text>
        </GlassCard>

        {mistakes.length > 0 ? (
          <GlassCard style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Помилки</Text>
            {mistakes.map((item) => (
              <View key={item.cardId} style={styles.mistake}>
                <Text style={styles.mistakeTitle}>{item.prompt}</Text>
                <Text style={styles.mistakeText}>Правильна: {item.correctOption}</Text>
                {item.selectedOption ? (
                  <Text style={styles.mistakeText}>Твоя: {item.selectedOption}</Text>
                ) : null}
              </View>
            ))}
          </GlassCard>
        ) : (
          <GlassCard style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Без помилок 🎉</Text>
          </GlassCard>
        )}
      </Screen>
    );
  }

  const correct = data.testAnswers?.filter((a) => a.isCorrect)?.length ?? 0;
  const total = data.testAnswers?.length ?? 0;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const mistakes = data.testAnswers?.filter((a) => a.isCorrect === false) ?? [];

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Результат сесії</Text>
        <Text style={styles.subtitle}>Session: {sessionId}</Text>
      </View>

      <GlassCard>
        <Text style={styles.score}>{percent}%</Text>
        <Text style={styles.meta}>
          Правильно: {correct} / {total}
        </Text>
      </GlassCard>

      {mistakes.length > 0 ? (
        <GlassCard style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Помилки</Text>
          {mistakes.map((answer) => (
            <View key={answer.questionId} style={styles.mistake}>
              <Text style={styles.mistakeTitle}>
                {answer.questionTitle ?? `Питання ${answer.questionId}`}
              </Text>
              {answer.correctAnswerText ? (
                <Text style={styles.mistakeText}>
                  Правильна: {answer.correctAnswerText}
                </Text>
              ) : null}
              {answer.correctOptionIds ? (
                <Text style={styles.mistakeText}>
                  Правильні опції: {answer.correctOptionIds.join(', ')}
                </Text>
              ) : null}
            </View>
          ))}
        </GlassCard>
      ) : (
        <GlassCard style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Без помилок 🎉</Text>
        </GlassCard>
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
  score: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: typography.weights.bold,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  mistake: {
    marginBottom: spacing.md,
  },
  mistakeTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  mistakeText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default SessionResultScreen;
