import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { QuestionOption, QuestionPayload, QuestionType } from '../../types/api';
import { useQuestions } from '../../query/questions';
import { useCreateQuestion, useUpdateQuestion } from '../../query/questions';
import { useAuth } from '../../store/auth.store';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { getErrorMessage } from '../../api/client';
import { useDeck } from '../../query/decks';

type Props = NativeStackScreenProps<DeckStackParamList, 'QuestionEdit'>;

const questionTypes: QuestionType[] = ['TEST_SINGLE', 'TEST_MULTI', 'TEXT'];

export const QuestionCreateEditScreen = ({ route, navigation }: Props) => {
  const { deckId, questionId } = route.params;
  const isEdit = Boolean(questionId);
  const { user } = useAuth();
  const { data: deck, isLoading: deckLoading, isError: deckError, refetch: refetchDeck } =
    useDeck(deckId);
  const { data: questions, isLoading, isError, refetch } = useQuestions(deckId);
  const createMutation = useCreateQuestion(deckId);
  const updateMutation = useUpdateQuestion(questionId ?? '', deckId);

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<QuestionType>('TEST_SINGLE');
  const [options, setOptions] = useState<QuestionOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [answerText, setAnswerText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    if (!deck || !user?.id) return false;
    return deck.ownerId === user.id;
  }, [deck, user]);

  useEffect(() => {
    if (questions && questionId) {
      const q = questions.find((x) => x.id === questionId);
      if (q) {
        setTitle(q.title);
        setPrompt(q.prompt);
        setType(q.type);
        setOptions(
          q.options?.map((opt) => ({ ...opt })) ?? [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ]
        );
        setAnswerText(q.answerText ?? '');
      }
    }
  }, [questions, questionId]);

  const updateOption = (index: number, patch: Partial<QuestionOption>) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addOption = () => setOptions((prev) => [...prev, { text: '', isCorrect: false }]);

  const removeOption = (index: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== index));

  const setCorrect = (index: number, value: boolean) => {
    setOptions((prev) =>
      prev.map((opt, i) =>
        i === index ? { ...opt, isCorrect: value } : type === 'TEST_SINGLE' ? { ...opt, isCorrect: false } : opt
      )
    );
  };

  const validate = (): string | null => {
    if (!title.trim() || !prompt.trim()) return 'Заповни назву і запит';
    if (type === 'TEXT') {
      if (!answerText.trim()) return 'Для TEXT потрібна правильна відповідь';
      return null;
    }
    if (options.length < 2) return 'Потрібно мінімум 2 опції';
    const filledOptions = options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) return 'Заповни хоча б 2 опції';
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount === 0) return 'Познач хоч одну правильну опцію';
    if (type === 'TEST_SINGLE' && correctCount !== 1) return 'Для SINGLE рівно 1 правильна';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!isOwner) {
      setError('Тільки власник може змінювати питання');
      return;
    }
    setError(null);
    const payload: QuestionPayload = {
      title: title.trim(),
      prompt: prompt.trim(),
      type,
      answerText: type === 'TEXT' ? answerText.trim() : undefined,
      options: type === 'TEXT' ? undefined : options.map((o) => ({ text: o.text.trim(), isCorrect: !!o.isCorrect })),
    };

    try {
      if (isEdit && questionId) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if ((isLoading && isEdit) || deckLoading) {
    return (
      <Screen>
        <Loader message="Завантажуємо питання..." />
      </Screen>
    );
  }

  if ((isError && isEdit) || deckError) {
    return (
      <ErrorState
        message="Не вдалося отримати питання"
        onRetry={() => {
          refetch();
          refetchDeck();
        }}
      />
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>{isEdit ? 'Редагувати питання' : 'Нове питання'}</Text>
        <Text style={styles.subtitle}>
          Обери тип і додай варіанти для тесту.
        </Text>
      </View>

      <GlassCard>
        <TextField label="Назва" value={title} onChangeText={setTitle} placeholder="Тема питання" />
        <TextField
          label="Формулювання"
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Текст питання"
          containerStyle={{ marginTop: spacing.md }}
        />

        <View style={styles.typeRow}>
          {questionTypes.map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={({ pressed }) => [
                styles.typePill,
                type === t && styles.typePillActive,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  type === t && { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                {t.replace('TEST_', '')}
              </Text>
            </Pressable>
          ))}
        </View>

        {type === 'TEXT' ? (
          <TextField
            label="Правильна відповідь"
            value={answerText}
            onChangeText={setAnswerText}
            placeholder="Очікувана відповідь"
            containerStyle={{ marginTop: spacing.md }}
          />
        ) : (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionLabel}>Опції</Text>
            {options.map((opt, index) => (
              <View key={index} style={styles.optionRow}>
                <TextField
                  value={opt.text}
                  onChangeText={(text) => updateOption(index, { text })}
                  placeholder={`Варіант ${index + 1}`}
                  style={{ flex: 1 }}
                />
                <Pressable
                  onPress={() => setCorrect(index, !opt.isCorrect)}
                  style={({ pressed }) => [
                    styles.correctBadge,
                    opt.isCorrect && styles.correctBadgeActive,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={styles.correctText}>
                    {type === 'TEST_SINGLE' ? (opt.isCorrect ? '✓' : '○') : opt.isCorrect ? '✓' : '□'}
                  </Text>
                </Pressable>
                {options.length > 2 ? (
                  <Pressable
                    onPress={() => removeOption(index)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginLeft: spacing.xs })}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <PrimaryButton
              label="Додати опцію"
              onPress={addOption}
              fullWidth={false}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={isEdit ? 'Зберегти' : 'Створити'}
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
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
  typeRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  typePill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typePillActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(124, 231, 255, 0.08)',
  },
  typeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  correctBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  correctBadgeActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(124, 231, 255, 0.12)',
  },
  correctText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  removeText: {
    color: colors.danger,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
});

export default QuestionCreateEditScreen;
