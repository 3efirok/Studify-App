import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { DeckStackParamList } from '../../navigation/types';
import { useQuestions, useDeleteQuestion } from '../../query/questions';
import { useDeck } from '../../query/decks';
import { useAuth } from '../../store/auth.store';
import { colors, spacing, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DeckStackParamList, 'Questions'>;

export const QuestionListScreen = ({ route, navigation }: Props) => {
  const { deckId, shareCode } = route.params;
  const { user } = useAuth();
  const { data: deck } = useDeck(deckId, shareCode);
  const { data, isLoading, isError, refetch, isRefetching } = useQuestions(
    deckId,
    shareCode
  );
  const deleteMutation = useDeleteQuestion(deckId);
  const [error, setError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    if (!deck || !user?.id) return false;
    return deck.ownerId === user.id;
  }, [deck, user]);

  const questions = data ?? [];

  const handleDelete = (questionId: string) => {
    Alert.alert('Видалити питання?', 'Цю дію не можна скасувати.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(questionId);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Питання</Text>
        <Text style={styles.subtitle}>Deck: {deckId}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <Loader message="Завантажуємо питання..." /> : null}
      {isError ? <ErrorState message="Не вдалося отримати питання" onRetry={refetch} /> : null}

      <FlatList
        style={{ flex: 1 }}
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <GlassCard padding="md">
            <View style={styles.row}>
              <Text style={styles.question} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.type}>{item.type}</Text>
            </View>
            <Text style={styles.prompt} numberOfLines={3}>
              {item.prompt}
            </Text>
            {item.options && item.options.length > 0 ? (
              <Text style={styles.meta}>Опцій: {item.options.length}</Text>
            ) : null}
            {isOwner ? (
              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('QuestionEdit', { deckId, questionId: item.id })
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={[styles.actionText, { color: colors.danger }]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </GlassCard>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Питань ще немає</Text>
              <Text style={styles.emptySub}>
                {isOwner ? 'Додай перше питання.' : 'Власник ще не додав питань.'}
              </Text>
            </View>
          ) : null
        }
      />

      {isOwner ? (
        <PrimaryButton
          label="Додати питання"
          onPress={() => navigation.navigate('QuestionEdit', { deckId })}
          style={styles.fab}
          fullWidth={false}
        />
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
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    flex: 1,
  },
  prompt: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
  },
  type: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionText: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  emptySub: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
  },
});

export default QuestionListScreen;
