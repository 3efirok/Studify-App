import { api } from './client';
import {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthResponse,
  RegisterResponse,
} from '../types/api';

export const login = async (payload: AuthLoginPayload) => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', payload);
  return data;
};

export const register = async (payload: AuthRegisterPayload) => {
  const { data } = await api.post<RegisterResponse>('/api/auth/register', payload);
  return data;
};
