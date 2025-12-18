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
import { SessionResultFlash, SessionResultTest, SessionTestAnswer } from '../../types/api';
import { computeProgressPercent } from '../../utils/percent';

type Props = NativeStackScreenProps<DeckStackParamList, 'SessionResult'>;

export const SessionResultScreen = ({ route }: Props) => {
  const { sessionId } = route.params;
  const { data, isLoading, isError, refetch } = useSessionResult(sessionId);

  const isFlashResult = (res: unknown): res is SessionResultFlash => {
    return !!res && typeof res === 'object' && 'mode' in res && (res as any).mode === 'TEST_FLASH';
  };

  const isTestResult = (res: unknown): res is SessionResultTest => {
    return !!res && typeof res === 'object' && 'mode' in res && (res as any).mode === 'TEST';
  };

  const normalizeId = (value: unknown) => {
    if (typeof value === 'string' || typeof value === 'number') return value;
    return String(value);
  };

  const normalizeSelectedIds = (value: unknown): Array<string | number> => {
    if (!Array.isArray(value)) return [];
    return value.filter((v) => typeof v === 'string' || typeof v === 'number');
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
    const percent = computeProgressPercent({
      progressPercent: data.stats.progressPercent,
      correct,
      total,
    });
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

  if (!isTestResult(data)) {
    return <ErrorState message="Невідомий формат результату" onRetry={refetch} />;
  }

  const answers: SessionTestAnswer[] = Array.isArray((data as any).session?.testAnswers)
    ? (data as any).session.testAnswers
    : [];

  const correct = data.stats?.correctCount ?? answers.filter((a) => a.isCorrect).length;
  const total = data.stats?.totalAnswered ?? answers.length;
  const percent = computeProgressPercent({
    progressPercent: data.stats?.progressPercent,
    correct,
    total,
  });
  const mistakes = answers.filter((a) => a.isCorrect === false);

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
          {mistakes.map((answer: SessionTestAnswer) => {
            const question = (answer as any).question;
            const questionTitle =
              typeof question?.title === 'string'
                ? question.title
                : `Питання ${normalizeId(answer.questionId)}`;
            const questionType = question?.type as any;
            const options = Array.isArray(question?.options) ? question.options : [];

            const correctOptions = options.filter((o: any) => o?.isCorrect === true);
            const correctText =
              questionType === 'TEXT'
                ? (typeof question?.answerText === 'string' ? question.answerText : null)
                : correctOptions.length > 0
                  ? correctOptions.map((o: any) => o?.text).filter(Boolean).join(', ')
                  : null;

            const selectedIds = normalizeSelectedIds((answer as any).selectedOptionIds);
            const selectedText =
              questionType === 'TEXT'
                ? (typeof (answer as any).answerText === 'string' ? (answer as any).answerText : null)
                : selectedIds.length > 0
                  ? selectedIds
                      .map((id) => {
                        const idStr = String(id);
                        return options.find((o: any) => String(o?.id) === idStr)?.text;
                      })
                      .filter(Boolean)
                      .join(', ')
                  : null;

            return (
              <View key={normalizeId(answer.id ?? answer.questionId)} style={styles.mistake}>
                <Text style={styles.mistakeTitle}>{questionTitle}</Text>
                {selectedText ? (
                  <Text style={styles.mistakeText}>Твоя: {selectedText}</Text>
                ) : null}
                {correctText ? (
                  <Text style={styles.mistakeText}>Правильна: {correctText}</Text>
                ) : null}
              </View>
            );
          })}
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
