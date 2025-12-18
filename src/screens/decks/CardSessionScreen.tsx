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
import { useStartSession, useCardMark, useFinishSession } from '../../query/sessions';
import { Card } from '../../types/api';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DeckStackParamList, 'CardSession'>;

export const CardSessionScreen = ({ route, navigation }: Props) => {
  const { deckId, shareCode, onlyUnknown } = route.params;
  const startMutation = useStartSession(deckId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false);
  const markMutation = useCardMark(sessionId ?? '');
  const finishMutation = useFinishSession(sessionId ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await startMutation.mutateAsync({
          mode: 'CARD',
          shareCode,
          onlyUnknown,
        });
        setSessionId(data.session.id);
        if ('nextCard' in data) {
          setCurrentCard(data.nextCard);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    init();
  }, []);

  const handleMark = async (known: boolean) => {
    if (!sessionId || !currentCard) return;
    try {
      const res = await markMutation.mutateAsync({
        cardId: currentCard.id,
        known,
      });
      if (res.finished) {
        await finishMutation.mutateAsync();
        navigation.popToTop();
        return;
      }
      if (res.nextCard) {
        setCurrentCard(res.nextCard);
        setFlipped(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (startMutation.isPending && !currentCard) {
    return (
      <Screen>
        <Loader message="Стартуємо сесію..." />
      </Screen>
    );
  }

  if (error && !currentCard) {
    return <ErrorState message={error} onRetry={() => navigation.goBack()} />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Карткова сесія</Text>
        <Text style={styles.subtitle}>Deck: {deckId}</Text>
      </View>

      {currentCard ? (
        <>
          <Pressable onPress={() => setFlipped((prev) => !prev)}>
            <GlassCard padding="xl">
              <Text style={styles.cardLabel}>
                {flipped ? 'Відповідь' : 'Питання'}
              </Text>
              <Text style={styles.cardText}>
                {flipped ? currentCard.answer : currentCard.question}
              </Text>
              <Text style={styles.hint}>Торкнись, щоб побачити {flipped ? 'питання' : 'відповідь'}</Text>
            </GlassCard>
          </Pressable>

          <View style={styles.actions}>
            <PrimaryButton
              label="Не знаю"
              onPress={() => handleMark(false)}
              loading={markMutation.isPending}
              disabled={markMutation.isPending}
            />
            <PrimaryButton
              label="Знаю"
              onPress={() => handleMark(true)}
              loading={markMutation.isPending}
              disabled={markMutation.isPending}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </>
      ) : (
        <Loader message="Завантажуємо картку..." />
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
  cardLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  cardText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: 24,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
  },
  actions: {
    marginTop: spacing.lg,
  },
});

export default CardSessionScreen;
