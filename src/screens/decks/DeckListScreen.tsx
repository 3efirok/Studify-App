import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DeckStackParamList } from '../../navigation/types';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import { colors, spacing, typography } from '../../theme';
import { useDecks } from '../../query/decks';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import PrimaryButton from '../../components/PrimaryButton';

type Props = NativeStackScreenProps<DeckStackParamList, 'DeckList'>;

export const DeckListScreen = ({ navigation }: Props) => {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch, isRefetching } = useDecks();

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((deck) => deck.title.toLowerCase().includes(term));
  }, [data, search]);

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Мої теми</Text>
        <Text style={styles.subtitle}>
          Переглядай, запускай сесії або створюй нові.
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Пошук за назвою..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {isLoading ? <Loader message="Завантажуємо теми..." /> : null}
      {isError ? (
        <ErrorState message="Не вдалося отримати теми" onRetry={refetch} />
      ) : null}

      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('DeckDetails', { deckId: item.id })}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <GlassCard padding="lg">
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardSubtitle}>{item.description}</Text>
              ) : null}
              {item._count?.cards != null ? (
                <Text style={styles.meta}>
                  Карток: {item._count.cards} • Питань:{' '}
                  {item._count.questions ?? 0}
                </Text>
              ) : null}
            </GlassCard>
          </Pressable>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Немає тем</Text>
              <Text style={styles.emptySub}>
                Створи першу тему, щоб почати.
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.fabContainer}>
        <PrimaryButton
          label="Open shared"
          onPress={() => navigation.navigate('SharedDeck' as never)}
          fullWidth={false}
        />
        <PrimaryButton
          label="+"
          onPress={() => navigation.navigate('DeckCreateEdit')}
          style={{ marginTop: spacing.sm }}
          fullWidth={false}
        />
      </View>
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
  searchWrapper: {
    marginBottom: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  searchInput: {
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
  },
  listContent: {
    paddingBottom: 120,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
  fabContainer: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
  },
});

export default DeckListScreen;
