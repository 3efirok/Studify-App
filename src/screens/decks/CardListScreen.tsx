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
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useCards } from '../../query/cards';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { useDeck } from '../../query/decks';
import { useDeleteCard as useDeleteCardMutation } from '../../query/cards';
import { useAuth } from '../../store/auth.store';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DeckStackParamList, 'Cards'>;

export const CardListScreen = ({ route, navigation }: Props) => {
  const { deckId, shareCode } = route.params;
  const { user } = useAuth();
  const { data: deck } = useDeck(deckId, shareCode);
  const { data, isLoading, isError, refetch, isRefetching } = useCards(
    deckId,
    shareCode
  );
  const deleteMutation = useDeleteCardMutation(deckId);
  const [error, setError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    if (!deck || !user?.id) return false;
    return deck.ownerId === user.id;
  }, [deck, user]);

  const cards = data ?? [];

  const handleDelete = (cardId: string) => {
    Alert.alert('Видалити картку?', 'Цю дію не можна скасувати.', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(cardId);
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
        <Text style={styles.title}>Картки</Text>
        <Text style={styles.subtitle}>Deck: {deckId}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <Loader message="Завантажуємо картки..." /> : null}
      {isError ? <ErrorState message="Не вдалося отримати картки" onRetry={refetch} /> : null}

      <FlatList
        style={{ flex: 1 }}
        data={cards}
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
            <View style={styles.cardHeader}>
              <Text style={styles.question} numberOfLines={2}>
                {item.question}
              </Text>
              {isOwner ? (
                <View style={styles.actions}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('CardEdit', { deckId, cardId: item.id })
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
            </View>
            <Text style={styles.answer} numberOfLines={3}>
              {item.answer}
            </Text>
          </GlassCard>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Карток ще немає</Text>
              <Text style={styles.emptySub}>
                {isOwner ? 'Додай першу картку.' : 'Власник ще не додав карток.'}
              </Text>
            </View>
          ) : null
        }
      />

      {isOwner ? (
        <PrimaryButton
          label="Додати картку"
          onPress={() => navigation.navigate('CardEdit', { deckId })}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionText: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
  },
  question: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    flex: 1,
  },
  answer: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
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

export default CardListScreen;
