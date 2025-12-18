import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useSubmitFlashAnswer } from '../../query/sessions';
import { FlashQuestion } from '../../types/api';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../components/Toast';
import { hapticsWarning } from '../../utils/haptics';
import {
  resyncNextFlashQuestion,
  shouldAttemptSessionResync,
} from '../../utils/sessionResync';

type Props = NativeStackScreenProps<DeckStackParamList, 'FlashTestSession'>;

export const FlashTestSessionScreen = ({ route, navigation }: Props) => {
  const { sessionId, deckId, initialQuestion } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState<FlashQuestion | null>(
    initialQuestion ?? null
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resyncing, setResyncing] = useState(false);
  const answerMutation = useSubmitFlashAnswer(sessionId);
  const toast = useToast();

  useEffect(() => {
    setError(null);
  }, [sessionId]);

  useEffect(() => {
    if (initialQuestion) {
      setCurrentQuestion(initialQuestion);
    } else {
      setError('Не вдалося отримати перше питання. Спробуйте запустити сесію знову.');
    }
  }, [initialQuestion]);

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    if (resyncing) return;
    if (selectedIndex === null) {
      setError('Оберіть варіант');
      hapticsWarning();
      return;
    }
    setError(null);
    try {
      const selectedOptionText = currentQuestion.options[selectedIndex];
      const res = await answerMutation.mutateAsync({
        cardId: currentQuestion.cardId,
        selectedIndex,
        selectedOptionText,
      });
      if (res.finished) {
        navigation.replace('SessionResult', { sessionId });
      } else if (res.nextQuestion) {
        setCurrentQuestion(res.nextQuestion);
        setSelectedIndex(null);
      } else {
        navigation.replace('SessionResult', { sessionId });
      }
    } catch (err) {
      const message = getErrorMessage(err);
      if (shouldAttemptSessionResync(message)) {
        try {
          setResyncing(true);
          setError('Синхронізуємо прогрес…');
          const { nextQuestion, finished } = await resyncNextFlashQuestion(sessionId);
          if (finished) {
            navigation.replace('SessionResult', { sessionId });
            return;
          }
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            setSelectedIndex(null);
            setError(null);
            return;
          }
        } catch {
          // ignore and show original error
        } finally {
          setResyncing(false);
        }
      }

      setError(message);
      toast.show(message, 'error');
      hapticsWarning();
    }
  };

  if (!currentQuestion) {
    if (error) {
      return <ErrorState message={error} onRetry={() => navigation.goBack()} />;
    }
    return (
      <Screen>
        <Loader message="Отримуємо питання..." />
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Тест з карток</Text>
        <Text style={styles.subtitle}>Deck: {deckId}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <GlassCard>
        <Text style={styles.prompt}>{currentQuestion.prompt}</Text>
        <View style={{ marginTop: spacing.md }}>
          {currentQuestion.options.map((opt, idx) => {
            const selected = selectedIndex === idx;
            return (
              <Pressable
                key={`${currentQuestion.cardId}-${idx}`}
                onPress={() => setSelectedIndex(idx)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.radio, selected && styles.radioActive]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label={
            resyncing
              ? 'Синхронізуємо...'
              : answerMutation.isPending
                ? 'Відправляємо...'
                : 'Відповісти'
          }
          onPress={handleSubmit}
          loading={answerMutation.isPending || resyncing}
          disabled={answerMutation.isPending || resyncing}
          style={{ marginTop: spacing.lg }}
        />
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
  prompt: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(124, 231, 255, 0.06)',
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  radioActive: {
    borderColor: colors.accent,
    backgroundColor: colors.glass,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default FlashTestSessionScreen;
