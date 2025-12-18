import React, { useEffect } from 'react';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import Loader from '../components/Loader';
import Screen from '../components/Screen';
import { useAuth, useAuthStore } from '../store/auth.store';
import { setAuthTokenGetter, setLogoutHandler } from '../api/client';

export const RootNavigator = () => {
  const { token, hydrated } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => useAuthStore.getState().token);
    setLogoutHandler(() => useAuthStore.getState().logout());
  }, []);

  if (!hydrated) {
    return (
      <Screen>
        <Loader message="Відновлюємо сесію..." />
      </Screen>
    );
  }

  return token ? <AppTabs /> : <AuthStack />;
};

export default RootNavigator;
