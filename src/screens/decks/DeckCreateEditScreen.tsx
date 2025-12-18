import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useCreateDeck, useDeck, useUpdateDeck } from '../../query/decks';
import Loader from '../../components/Loader';
import { getErrorMessage } from '../../api/client';
import ErrorState from '../../components/ErrorState';
import { useAuth } from '../../store/auth.store';

type Props = NativeStackScreenProps<DeckStackParamList, 'DeckCreateEdit'>;

export const DeckCreateEditScreen = ({ route, navigation }: Props) => {
  const deckId = route.params?.deckId;
  const isEdit = Boolean(deckId);
  const { user } = useAuth();
  const { data: deck, isLoading, isError, refetch } = useDeck(deckId ?? undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deck) {
      setTitle(deck.title);
      setDescription(deck.description ?? '');
    }
  }, [deck]);

  const createMutation = useCreateDeck();
  const updateMutation = useUpdateDeck(deckId ?? '');

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Назва обовʼязкова');
      return;
    }
    setError(null);

    try {
      if (isEdit && deckId) {
        await updateMutation.mutateAsync({ title: title.trim(), description });
      } else {
        const created = await createMutation.mutateAsync({
          title: title.trim(),
          description,
        });
        navigation.replace('DeckDetails', { deckId: created.id });
        return;
      }
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const ownerMismatch =
    isEdit && deck && deck.ownerId && user?.id && deck.ownerId !== user.id;

  if (isEdit && isLoading) {
    return (
      <Screen>
        <Loader message="Завантажуємо тему..." />
      </Screen>
    );
  }

  if (isEdit && isError) {
    return <ErrorState message="Не вдалося отримати тему" onRetry={refetch} />;
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>{isEdit ? 'Редагувати тему' : 'Створити тему'}</Text>
        <Text style={styles.subtitle}>
          {isEdit ? 'Онови назву та опис' : 'Заповни поля, щоб створити нову тему.'}
        </Text>
      </View>

      <GlassCard>
        <TextField
          label="Назва"
          value={title}
          onChangeText={setTitle}
          placeholder="Напр. React Basics"
        />
        <TextField
          label="Опис"
          value={description}
          onChangeText={setDescription}
          placeholder="Короткий опис"
          containerStyle={{ marginTop: spacing.md }}
        />
        {ownerMismatch ? (
          <Text style={styles.warning}>Тільки власник може редагувати цю тему.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isEdit ? 'Зберегти' : 'Створити'}
          onPress={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={ownerMismatch}
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

export default DeckCreateEditScreen;
