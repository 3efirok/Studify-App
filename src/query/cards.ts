import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCard, deleteCard, listCards, updateCard } from '../api/cards.api';
import { CardPayload } from '../types/api';
import { queryKeys } from './keys';

export const useCards = (deckId: string | undefined, shareCode?: string) =>
  useQuery({
    queryKey: deckId ? ['cards', deckId, shareCode ?? null] : ['cards', 'missing'],
    queryFn: () => {
      if (!deckId) throw new Error('deckId is required');
      return listCards(deckId, shareCode);
    },
    enabled: !!deckId,
  });

export const useCreateCard = (deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CardPayload) => createCard(deckId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards', deckId] });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};

export const useUpdateCard = (deckId: string, cardId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CardPayload>) => updateCard(deckId, cardId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards', deckId] });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};

export const useDeleteCard = (deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => deleteCard(deckId, cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards', deckId] });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};
