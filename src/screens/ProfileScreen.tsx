import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../store/auth.store';
import { useToast } from '../components/Toast';
import { API_URL } from '../utils/env';
import { api } from '../api/client';
import { hapticsSuccess, hapticsWarning } from '../utils/haptics';
import { useDecks } from '../query/decks';
import { startSession } from '../api/sessions.api';
import { FlashQuestion } from '../types/api';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const navigation = useNavigation<any>();
  const { data: decks } = useDecks();
  const [debugLoading, setDebugLoading] = useState(false);

  const handleLogout = async () => {
    await qc.clear();
    logout();
    hapticsSuccess();
    toast.show('Вихід виконано', 'success');
  };

  const handleHealth = async () => {
    try {
      const res = await api.get('/api/health');
      toast.show(res?.data?.status ?? 'OK', 'success');
      hapticsSuccess();
    } catch (err) {
      toast.show('Health check failed', 'error');
      hapticsWarning();
    }
  };

  const handleClearStorage = async () => {
    await qc.clear();
    logout();
    toast.show('Сховище очищено', 'info');
    hapticsWarning();
  };

  const handleFlashDebug = () => {
    if (!decks || decks.length === 0) {
      toast.show('Немає тем для старту', 'error');
      hapticsWarning();
      return;
    }

    const startForDeck = async (deckId: string) => {
      try {
        setDebugLoading(true);
        const res = await startSession(deckId, { mode: 'TEST_FLASH', optionsCount: 4 });
        const initialQuestion =
          'nextQuestion' in res && (res as any).nextQuestion?.kind === 'FLASH'
            ? ((res as any).nextQuestion as FlashQuestion)
            : undefined;
        navigation.navigate('Decks', {
          screen: 'FlashTestSession',
          params: {
            deckId,
            sessionId: String(res.session.id),
            initialQuestion,
          },
        });
        toast.show('Flash test запущено', 'success');
        hapticsSuccess();
      } catch (err) {
        toast.show('Не вдалось стартувати flash тест', 'error');
        hapticsWarning();
      } finally {
        setDebugLoading(false);
      }
    };

    Alert.alert(
      'Тест з карток',
      'Обери тему для швидкого FLASH тесту',
      [
        ...decks.slice(0, 6).map((deck) => ({
          text: deck.title,
          onPress: () => startForDeck(deck.id),
        })),
        { text: 'Скасувати', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Профіль</Text>
        <Text style={styles.subtitle}>Керуй акаунтом та виходом.</Text>
      </View>

      <GlassCard>
        <Text style={styles.body}>
          Email: {user?.email ?? '—'}
          {'\n'}
          Name: {user?.name ?? '—'}
        </Text>
        <PrimaryButton
          label="Вийти"
          onPress={handleLogout}
          style={{ marginTop: spacing.lg }}
        />
      </GlassCard>

      {__DEV__ ? (
        <GlassCard style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Debug</Text>
          <Text style={styles.meta}>API: {API_URL}</Text>
          <PrimaryButton
            label="Test /api/health"
            onPress={handleHealth}
            style={{ marginTop: spacing.sm }}
          />
          <PrimaryButton
            label="Generate flash test debug"
            onPress={handleFlashDebug}
            loading={debugLoading}
            disabled={debugLoading}
            style={{ marginTop: spacing.sm }}
          />
          <PrimaryButton
            label="Clear storage"
            onPress={handleClearStorage}
            style={{ marginTop: spacing.sm }}
          />
        </GlassCard>
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
  body: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
});

export default ProfileScreen;
