import axios, { AxiosError } from 'axios';
import { API_URL } from '../utils/env';
import type { ApiError as ApiErrorShape } from '../types/api';

export type ApiError = ApiErrorShape;
export type TokenGetter = () => string | null | undefined;
export type LogoutHandler = () => void;

let tokenGetter: TokenGetter | null = null;
let logoutHandler: LogoutHandler | null = null;

/**
 * Connect your Zustand store:
 * setAuthTokenGetter(() => useAuthStore.getState().token);
 * setLogoutHandler(() => useAuthStore.getState().logout());
 */
export const setAuthTokenGetter = (getter: TokenGetter) => {
  tokenGetter = getter;
};

export const setLogoutHandler = (handler: LogoutHandler) => {
  logoutHandler = handler;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenGetter?.();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      logoutHandler?.();
    }

    const normalized: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Unexpected error occurred',
      status,
      details: error.response?.data ?? error,
    };

    return Promise.reject(normalized);
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;

  const maybeAxios = error as AxiosError<ApiError>;
  if (maybeAxios?.response?.data?.message) {
    return maybeAxios.response.data.message;
  }

  const maybeApi = error as ApiError;
  if (maybeApi?.message) return maybeApi.message;

  if (maybeAxios?.message) return maybeAxios.message;

  return 'Something went wrong';
};
