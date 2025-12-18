import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import { colors, spacing, typography } from '../../theme';
import { DeckStackParamList } from '../../navigation/types';
import { useDeck } from '../../query/decks';
import { useAuth } from '../../store/auth.store';
import { useToast } from '../../components/Toast';
import { hapticsWarning } from '../../utils/haptics';
import { useStartSession } from '../../query/sessions';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DeckStackParamList, 'SessionStart'>;

const modes: Array<'CARD' | 'TEST' | 'TEST_FLASH'> = ['CARD', 'TEST', 'TEST_FLASH'];

export const SessionStartScreen = ({ route, navigation }: Props) => {
  const { deckId, shareCode: shareCodeParam, presetMode } = route.params;
  const { user } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'CARD' | 'TEST' | 'TEST_FLASH'>(presetMode ?? 'CARD');
  const [onlyUnknown, setOnlyUnknown] = useState(true);
  const [optionsCount, setOptionsCount] = useState<number>(4);
  const [shareCode, setShareCode] = useState(shareCodeParam ?? '');
  const { data: deck } = useDeck(deckId, shareCodeParam ?? shareCode);
  const startMutation = useStartSession(deckId);

  const isOwner = useMemo(() => {
    if (!deck || !user?.id) return false;
    return deck.ownerId === user.id;
  }, [deck, user]);

  const effectiveShareCode = shareCodeParam || shareCode;

  const handleStart = async () => {
    if (!isOwner && !effectiveShareCode.trim()) {
      toast.show('Потрібен share code для старту', 'error');
      hapticsWarning();
      return;
    }

    if (mode === 'CARD') {
      navigation.navigate('CardSession', {
        deckId,
        shareCode: effectiveShareCode || undefined,
        onlyUnknown,
      });
    } else if (mode === 'TEST') {
      navigation.navigate('Session', {
        deckId,
        shareCode: effectiveShareCode || undefined,
        mode,
      });
    } else {
      try {
        const data = await startMutation.mutateAsync({
          mode: 'TEST_FLASH',
          shareCode: effectiveShareCode || undefined,
          optionsCount,
        });
        const initialQuestion =
          'nextQuestion' in data && (data as any).nextQuestion?.kind === 'FLASH'
            ? (data as any).nextQuestion
            : undefined;
        navigation.replace('FlashTestSession', {
          deckId,
          sessionId: data.session.id,
          shareCode: effectiveShareCode || undefined,
          initialQuestion,
        });
      } catch (err) {
        const message = getErrorMessage(err);
        toast.show(message, 'error');
        hapticsWarning();
      }
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Старт сесії</Text>
        <Text style={styles.subtitle}>Deck: {deckId}</Text>
      </View>

      <GlassCard>
        <Text style={styles.sectionLabel}>Режим</Text>
        <View style={styles.modeRow}>
          {modes.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={({ pressed }) => [
                styles.modePill,
                mode === m && styles.modePillActive,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === m && { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === 'CARD' ? (
          <Pressable
            onPress={() => setOnlyUnknown((prev) => !prev)}
            style={({ pressed }) => [
              styles.toggleRow,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View
              style={[
                styles.toggle,
                onlyUnknown ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleHandle,
                  onlyUnknown ? styles.toggleHandleOn : styles.toggleHandleOff,
                ]}
              />
            </View>
            <Text style={styles.toggleLabel}>Тільки невідомі картки</Text>
          </Pressable>
        ) : mode === 'TEST_FLASH' ? (
          <TextField
            label="Кількість варіантів (2-8)"
            value={String(optionsCount)}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (Number.isNaN(num)) {
                setOptionsCount(2);
              } else {
                setOptionsCount(Math.min(8, Math.max(2, num)));
              }
            }}
            keyboardType="number-pad"
            placeholder="4"
            containerStyle={{ marginTop: spacing.md }}
          />
        ) : null}

        {!isOwner && !shareCodeParam ? (
          <TextField
            label="Share code"
            value={shareCode}
            onChangeText={setShareCode}
            placeholder="Введи код доступу"
            containerStyle={{ marginTop: spacing.md }}
          />
        ) : null}

        <PrimaryButton
          label="Почати"
          onPress={handleStart}
          loading={startMutation.isPending}
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
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modePill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modePillActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(124, 231, 255, 0.08)',
  },
  modeText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOn: {
    backgroundColor: 'rgba(124, 231, 255, 0.15)',
    borderColor: colors.accent,
  },
  toggleOff: {},
  toggleHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
  },
  toggleHandleOn: {
    marginLeft: 18,
  },
  toggleHandleOff: {
    marginLeft: 0,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
});

export default SessionStartScreen;
