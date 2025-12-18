import { Platform } from 'react-native';

const devApiUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

const apiUrl =
  process.env?.EXPO_PUBLIC_API_URL?.trim() || devApiUrl;

export const API_URL = apiUrl;
export const APP_ENV = process.env?.EXPO_PUBLIC_ENV || (__DEV__ ? 'development' : 'production');

export const env = {
  API_URL: apiUrl,
  APP_ENV,
  isDev: __DEV__,
};
