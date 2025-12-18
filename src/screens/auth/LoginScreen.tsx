import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../api/auth.api';
import { getErrorMessage } from '../../api/client';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import Screen from '../../components/Screen';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../store/auth.store';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const emailRegex = /\S+@\S+\.\S+/;
const asciiRegex = /^[\x20-\x7E]+$/;

export const LoginScreen = ({ navigation }: Props) => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const validate = () => {
    if (!email || !password) {
      return 'Заповніть email і пароль';
    }
    if (!emailRegex.test(email)) {
      return 'Некоректний email';
    }
    if (!asciiRegex.test(email) || !asciiRegex.test(password)) {
      return 'Використовуйте лише латиницю, цифри та стандартні символи';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    await mutateAsync({ email, password });
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Вхід</Text>
        <Text style={styles.subtitle}>Повернімо тебе до навчання.</Text>
      </View>

      <GlassCard>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          containerStyle={{ marginTop: spacing.md }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isPending ? 'Входимо...' : 'Увійти'}
          onPress={handleSubmit}
          loading={isPending}
          style={{ marginTop: spacing.lg }}
        />
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.link ]}
        >
          <Text style={styles.linkText}>Немає акаунту? Зареєструватись</Text>
        </Pressable>
      </GlassCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
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
  link: {
    marginTop: spacing.md,
  },
  linkText: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});

export default LoginScreen;
