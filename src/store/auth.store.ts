import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '../types/api';

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User | null) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
};

const secureOrAsyncStorage = {
  async getItem(key: string) {
    try {
      if (await SecureStore.isAvailableAsync()) {
        return SecureStore.getItemAsync(key);
      }
    } catch {
      // fall through to AsyncStorage
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    try {
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch {
      // fall through to AsyncStorage
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    try {
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch {
      // fall through to AsyncStorage
    }
    await AsyncStorage.removeItem(key);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => secureOrAsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const useAuth = () =>
  ({
    token: useAuthStore((s) => s.token),
    user: useAuthStore((s) => s.user),
    hydrated: useAuthStore((s) => s.hydrated),
    setAuth: useAuthStore((s) => s.setAuth),
    logout: useAuthStore((s) => s.logout),
  });
