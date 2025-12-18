import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import {
  useSubmitFlashAnswer,
  useSubmitTestAnswer,
  useStartSession,
} from '../../query/sessions';
import { FlashQuestion, Question, QuestionOption } from '../../types/api';
import { getErrorMessage } from '../../api/client';
import {
  resyncNextFlashQuestion,
  resyncNextTestQuestion,
  shouldAttemptSessionResync,
} from '../../utils/sessionResync';

type Props = NativeStackScreenProps<DeckStackParamList, 'Session'>;

export const TestSessionScreen = ({ route, navigation }: Props) => {
  const { deckId, shareCode, mode = 'TEST', optionsCount } = route.params;
  const startMutation = useStartSession(deckId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const answerMutation = useSubmitTestAnswer(sessionId ?? '');
  const flashAnswerMutation = useSubmitFlashAnswer(sessionId ?? '');
  const [currentQuestion, setCurrentQuestion] = useState<(Question | FlashQuestion) | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedFlashIndex, setSelectedFlashIndex] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resyncing, setResyncing] = useState(false);

  const isFlash = useMemo(
    () => currentQuestion != null && 'kind' in currentQuestion && currentQuestion.kind === 'FLASH',
    [currentQuestion]
  );
  const isMulti = !isFlash && currentQuestion?.type === 'TEST_MULTI';
  const isSingle = !isFlash && currentQuestion?.type === 'TEST_SINGLE';
  const isText = !isFlash && currentQuestion?.type === 'TEXT';

  useEffect(() => {
    const init = async () => {
      try {
        const data = await startMutation.mutateAsync({
          mode,
          shareCode,
          optionsCount: mode === 'TEST_FLASH' ? optionsCount : undefined,
        });
        setSessionId(String(data.session.id));
        if ('nextQuestion' in data) {
          setCurrentQuestion(data.nextQuestion);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    init();
  }, []);

  const toggleOption = (optionId: string) => {
    if (isSingle) {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !sessionId) return;
    if (resyncing) return;
    if (isFlash && selectedFlashIndex === null) {
      setError('Оберіть відповідь');
      return;
    }
    if ((isSingle || isMulti) && selectedOptions.length === 0) {
      setError('Оберіть відповідь');
      return;
    }
    if (isText && !answerText.trim()) {
      setError('Введіть відповідь');
      return;
    }

    setError(null);

    try {
      if (isFlash) {
        const selectedOptionText =
          selectedFlashIndex == null ? undefined : currentQuestion.options[selectedFlashIndex];
        const result = await flashAnswerMutation.mutateAsync({
          cardId: currentQuestion.cardId,
          selectedIndex: selectedFlashIndex ?? 0,
          selectedOptionText,
        });
        if (result.finished) {
          navigation.replace('SessionResult', { sessionId: sessionId ?? '' });
        } else if (result.nextQuestion) {
          setCurrentQuestion(result.nextQuestion);
          setSelectedFlashIndex(null);
          setSelectedOptions([]);
          setAnswerText('');
        }
      } else {
        const selectedOptionId = selectedOptions[0];
        const result = await answerMutation.mutateAsync({
          questionId: currentQuestion.id,
          selectedOptionId: isText ? undefined : selectedOptionId,
          selectedOptionIds: isText ? undefined : selectedOptions,
          answerText: isText ? answerText.trim() : undefined,
        });
        if (result.finished) {
          navigation.replace('SessionResult', { sessionId });
        } else if (result.nextQuestion) {
          setCurrentQuestion(result.nextQuestion);
          setSelectedOptions([]);
          setAnswerText('');
        }
      }
    } catch (err) {
      const message = getErrorMessage(err);
      if (shouldAttemptSessionResync(message)) {
        try {
          setResyncing(true);
          setError('Синхронізуємо прогрес…');
          if (isFlash) {
            const { nextQuestion, finished } = await resyncNextFlashQuestion(sessionId);
            if (finished) {
              navigation.replace('SessionResult', { sessionId });
              return;
            }
            if (nextQuestion) {
              setCurrentQuestion(nextQuestion);
              setSelectedFlashIndex(null);
              setSelectedOptions([]);
              setAnswerText('');
              setError(null);
              return;
            }
          } else {
            const { nextQuestion, finished } = await resyncNextTestQuestion({
              sessionId,
              deckId,
              shareCode,
            });
            if (finished) {
              navigation.replace('SessionResult', { sessionId });
              return;
            }
            if (nextQuestion) {
              setCurrentQuestion(nextQuestion);
              setSelectedOptions([]);
              setAnswerText('');
              setError(null);
              return;
            }
          }
        } catch {
          // fall through
        } finally {
          setResyncing(false);
        }
      }

      setError(message);
    }
  };

  const renderOption = (option: QuestionOption) => {
    const selected = selectedOptions.includes(option.id ?? '');
    return (
      <Pressable
        key={option.id ?? option.text}
        onPress={() => toggleOption(option.id ?? option.text)}
        style={({ pressed }) => [
          styles.option,
          selected && styles.optionSelected,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {isSingle ? (
            <View style={[styles.radioInner, selected && styles.radioInnerActive]} />
          ) : selected ? (
            <Text style={styles.checkboxMark}>✓</Text>
          ) : null}
        </View>
        <Text style={styles.optionText}>{option.text}</Text>
      </Pressable>
    );
  };

  if (startMutation.isPending && !currentQuestion) {
    return (
      <Screen>
        <Loader message="Стартуємо сесію..." />
      </Screen>
    );
  }

  if (error && !currentQuestion) {
    return <ErrorState message={error} onRetry={() => navigation.goBack()} />;
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Тестова сесія</Text>
        <Text style={styles.subtitle}>Deck: {deckId}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {currentQuestion ? (
        <GlassCard>
          <Text style={styles.questionTitle}>
            {isFlash ? 'Flash питання' : currentQuestion.title}
          </Text>
          <Text style={styles.prompt}>{currentQuestion.prompt}</Text>

          {isFlash ? (
            <View style={{ marginTop: spacing.md }}>
              {currentQuestion.options.map((opt, index) => {
                const selected = selectedFlashIndex === index;
                return (
                  <Pressable
                    key={`${currentQuestion.cardId}-${index}-${opt}`}
                    onPress={() => setSelectedFlashIndex(index)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      <View
                        style={[styles.radioInner, selected && styles.radioInnerActive]}
                      />
                    </View>
                    <Text style={styles.optionText}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <>
              {isSingle || isMulti ? (
                <View style={{ marginTop: spacing.md }}>
                  {currentQuestion.options?.map(renderOption)}
                </View>
              ) : null}

              {isText ? (
                <View style={{ marginTop: spacing.md }}>
                  <TextField
                    value={answerText}
                    onChangeText={setAnswerText}
                    placeholder="Введи відповідь"
                    multiline
                  />
                </View>
              ) : null}
            </>
          )}

          <PrimaryButton
            label={
              resyncing
                ? 'Синхронізуємо...'
                : answerMutation.isPending || flashAnswerMutation.isPending
                  ? 'Відправляємо...'
                  : 'Відповісти'
            }
            onPress={handleSubmit}
            loading={answerMutation.isPending || flashAnswerMutation.isPending || resyncing}
            style={{ marginTop: spacing.lg }}
          />
        </GlassCard>
      ) : (
        <Loader message="Отримуємо питання..." />
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
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  questionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  prompt: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.glass,
  },
  checkboxMark: {
    color: colors.accent,
    fontSize: 14,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  radioInnerActive: {
    backgroundColor: colors.accent,
  },
});

export default TestSessionScreen;
