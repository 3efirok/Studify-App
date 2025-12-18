import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  copyDeckByShareCode,
  createDeck,
  deleteDeck,
  getDeckById,
  getMyDecks,
  shareDeck,
  updateDeck,
} from '../api/decks.api';
import { DeckCreatePayload, DeckUpdatePayload } from '../types/api';
import { queryKeys } from './keys';

export const useDecks = () =>
  useQuery({
    queryKey: queryKeys.decks,
    queryFn: getMyDecks,
  });

export const useDeck = (deckId: string | undefined, shareCode?: string) =>
  useQuery({
    queryKey: deckId ? queryKeys.deck(deckId, shareCode) : ['deck', 'missing'],
    queryFn: () => {
      if (!deckId) throw new Error('deckId is required');
      return getDeckById(deckId, shareCode);
    },
    enabled: !!deckId,
  });

export const useCreateDeck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeckCreatePayload) => createDeck(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decks });
    },
  });
};

export const useUpdateDeck = (deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DeckUpdatePayload) => updateDeck(deckId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decks });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};

export const useDeleteDeck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deckId: string) => deleteDeck(deckId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decks });
    },
  });
};

export const useShareDeck = (deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shareDeck(deckId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};

export const useCopyDeck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareCode: string) => copyDeckByShareCode(shareCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.decks });
    },
  });
};
