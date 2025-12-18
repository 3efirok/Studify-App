import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useDeck, useDeleteDeck, useShareDeck, useCopyDeck } from '../../query/decks';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import { useAuth } from '../../store/auth.store';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DeckStackParamList, 'DeckDetails'>;

export const DeckDetailsScreen = ({ route, navigation }: Props) => {
  const { deckId, shareCode: shareCodeParam } = route.params;
  const { user } = useAuth();
  const { data: deck, isLoading, isError, refetch } = useDeck(deckId, shareCodeParam);
  const deleteMutation = useDeleteDeck();
  const shareMutation = useShareDeck(deckId);
  const copyMutation = useCopyDeck();
  const [error, setError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    if (!deck || !user?.id) return false;
    return deck.ownerId === user.id;
  }, [deck, user]);

  const canEdit = isOwner;
  const shareCode = deck?.shareCode ?? shareCodeParam;
  const isSharedView = !isOwner && !!shareCodeParam;

  useEffect(() => {
    setError(null);
  }, [deckId]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deckId);
      navigation.popToTop();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleShare = async () => {
    try {
      const result = await shareMutation.mutateAsync();
      await Clipboard.setStringAsync(result.shareCode);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCopyDeck = async () => {
    if (!shareCode) return;
    try {
      const created = await copyMutation.mutateAsync(shareCode);
      navigation.replace('DeckDetails', { deckId: created.id });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <Loader message="Завантажуємо тему..." />
      </Screen>
    );
  }

  if (isError || !deck) {
    return <ErrorState message="Не вдалося отримати тему" onRetry={refetch} />;
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>{deck.title}</Text>
        {deck.description ? (
          <Text style={styles.subtitle}>{deck.description}</Text>
        ) : null}
        <Text style={styles.meta}>
          Карток: {deck._count?.cards ?? 0} • Питань: {deck._count?.questions ?? 0}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <GlassCard>
        <Text style={styles.sectionTitle}>Дії</Text>
        <View style={styles.actions}>
          <PrimaryButton
            label="Картки"
            onPress={() => navigation.navigate('Cards', { deckId })}
          />
          <PrimaryButton
            label="Питання"
            onPress={() =>
              navigation.navigate('Questions', { deckId, shareCode: shareCodeParam })
            }
            style={{ marginTop: spacing.sm }}
          />
          <PrimaryButton
            label="Start CARD"
            onPress={() =>
              navigation.navigate('SessionStart', {
                deckId,
                shareCode: shareCodeParam,
                presetMode: 'CARD',
              })
            }
            style={{ marginTop: spacing.sm }}
          />
          <PrimaryButton
            label="Start TEST"
            onPress={() =>
              navigation.navigate('SessionStart', {
                deckId,
                shareCode: shareCodeParam,
                presetMode: 'TEST',
              })
            }
            style={{ marginTop: spacing.sm }}
          />
          <PrimaryButton
            label="Тест з карток"
            onPress={() =>
              navigation.navigate('SessionStart', {
                deckId,
                shareCode: shareCodeParam ?? shareCode ?? undefined,
                presetMode: 'TEST_FLASH',
              })
            }
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </GlassCard>

      <GlassCard style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Доступ</Text>
        <Text style={styles.meta}>
          Режим: {isOwner ? 'власник' : isSharedView ? 'гостьовий' : 'перегляд'}
        </Text>

        {shareCode ? (
          <View style={styles.shareRow}>
            <View>
              <Text style={styles.shareLabel}>Share code</Text>
              <Text style={styles.shareCode}>{shareCode}</Text>
            </View>
            <Pressable
              onPress={handleShare}
              disabled={!isOwner || shareMutation.isPending}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={styles.copyText}>
                {isOwner ? 'Оновити & копіювати' : 'Доступно тільки власнику'}
              </Text>
            </Pressable>
          </View>
        ) : isOwner ? (
          <PrimaryButton
            label={shareMutation.isPending ? 'Створюємо...' : 'Поділитись'}
            onPress={handleShare}
            loading={shareMutation.isPending}
            style={{ marginTop: spacing.md }}
          />
        ) : null}

        {!isOwner && shareCode ? (
          <PrimaryButton
            label={copyMutation.isPending ? 'Копіюємо...' : 'Скопіювати до себе'}
            onPress={handleCopyDeck}
            loading={copyMutation.isPending}
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </GlassCard>

      {canEdit ? (
        <View style={{ marginTop: spacing.lg }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Керування</Text>
            <PrimaryButton
              label="Редагувати"
              onPress={() => navigation.navigate('DeckCreateEdit', { deckId })}
            />
            <PrimaryButton
              label="Видалити"
              onPress={handleDelete}
              style={{ marginTop: spacing.sm }}
              loading={deleteMutation.isPending}
            />
          </GlassCard>
        </View>
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
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  actions: {},
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  shareLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  shareCode: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
  },
  copyText: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default DeckDetailsScreen;
