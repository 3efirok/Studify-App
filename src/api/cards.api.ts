import { api } from './client';
import { Card, CardPayload } from '../types/api';

export const listCards = async (deckId: string, shareCode?: string) => {
  const { data } = await api.get<Card[]>(`/api/decks/${deckId}/cards`, {
    params: shareCode ? { shareCode } : undefined,
  });
  return data;
};

export const createCard = async (deckId: string, payload: CardPayload) => {
  const { data } = await api.post<Card>(`/api/decks/${deckId}/cards`, payload);
  return data;
};

export const updateCard = async (
  deckId: string,
  cardId: string,
  payload: Partial<CardPayload>
) => {
  const { data } = await api.patch<Card>(
    `/api/decks/${deckId}/cards/${cardId}`,
    payload
  );
  return data;
};

export const deleteCard = async (deckId: string, cardId: string) => {
  const { data } = await api.delete<Card>(
    `/api/decks/${deckId}/cards/${cardId}`
  );
  return data;
};
