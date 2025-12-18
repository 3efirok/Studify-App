import { api } from './client';
import {
  Deck,
  DeckCreatePayload,
  DeckShareResponse,
  DeckUpdatePayload,
} from '../types/api';

export const getMyDecks = async () => {
  const { data } = await api.get<Deck[]>('/api/decks');
  return data;
};

export const createDeck = async (payload: DeckCreatePayload) => {
  const { data } = await api.post<Deck>('/api/decks', payload);
  return data;
};

export const getDeckById = async (deckId: string, shareCode?: string) => {
  const { data } = await api.get<Deck>(`/api/decks/${deckId}`, {
    params: shareCode ? { shareCode } : undefined,
  });
  return data;
};

export const updateDeck = async (deckId: string, payload: DeckUpdatePayload) => {
  const { data } = await api.patch<Deck>(`/api/decks/${deckId}`, payload);
  return data;
};

export const deleteDeck = async (deckId: string) => {
  const { data } = await api.delete<Deck>(`/api/decks/${deckId}`);
  return data;
};

export const shareDeck = async (deckId: string) => {
  const { data } = await api.post<DeckShareResponse>(`/api/decks/${deckId}/share`);
  return data;
};

export const copyDeckByShareCode = async (shareCode: string) => {
  const { data } = await api.post<Deck>('/api/decks/copy', { shareCode });
  return data;
};

export const getSharedDeckPublic = async (shareCode: string) => {
  const { data } = await api.get<Deck>(`/api/decks/shared/${shareCode}`);
  return data;
};
