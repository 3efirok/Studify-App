import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useCards, useCreateCard, useUpdateCard } from '../../query/cards';
import { useDeck } from '../../query/decks';
import { useAuth } from '../../store/auth.store';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DeckStackParamList, 'CardEdit'>;

export const CardEditScreen = ({ route, navigation }: Props) => {
  const { deckId, cardId } = route.params;
  const isEdit = Boolean(cardId);
  const { user } = useAuth();
  const { data: deck, isLoading: deckLoading, isError: deckError, refetch: refetchDeck } =
    useDeck(deckId);
  const { data: cards, isLoading: cardsLoading, isError: cardsError, refetch: refetchCards } =
    useCards(deckId);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    if (!deck || !user?.id) return false;
    return deck.ownerId === user.id;
  }, [deck, user]);

  useEffect(() => {
    if (cards && cardId) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        setQuestion(card.question);
        setAnswer(card.answer);
      }
    }
  }, [cards, cardId]);

  const createMutation = useCreateCard(deckId);
  const updateMutation = useUpdateCard(deckId, cardId ?? '');

  const handleSubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      setError('Питання і відповідь обовʼязкові');
      return;
    }
    if (!isOwner) {
      setError('Тільки власник може змінювати картки');
      return;
    }
    setError(null);
    try {
      if (isEdit && cardId) {
        await updateMutation.mutateAsync({
          question: question.trim(),
          answer: answer.trim(),
        });
      } else {
        await createMutation.mutateAsync({
          question: question.trim(),
          answer: answer.trim(),
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (deckLoading || (isEdit && cardsLoading)) {
    return (
      <Screen>
        <Loader message="Завантажуємо дані..." />
      </Screen>
    );
  }

  if (deckError || (isEdit && cardsError)) {
    return (
      <ErrorState
        message="Не вдалося отримати дані"
        onRetry={() => {
          refetchDeck();
          refetchCards();
        }}
      />
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>{isEdit ? 'Редагувати картку' : 'Нова картка'}</Text>
        <Text style={styles.subtitle}>
          {isEdit ? 'Онови питання та відповідь' : 'Заповни, щоб додати картку.'}
        </Text>
      </View>

      <GlassCard>
        <TextField
          label="Питання"
          value={question}
          onChangeText={setQuestion}
          placeholder="Що таке React?"
        />
        <TextField
          label="Відповідь"
          value={answer}
          onChangeText={setAnswer}
          placeholder="Бібліотека для UI"
          containerStyle={{ marginTop: spacing.md }}
        />
        {!isOwner ? (
          <Text style={styles.warning}>Тільки власник може редагувати картки.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isEdit ? 'Зберегти' : 'Створити'}
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={!isOwner}
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
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  warning: {
    color: colors.warning,
    marginTop: spacing.sm,
  },
});

export default CardEditScreen;
