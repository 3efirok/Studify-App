import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from '../api/questions.api';
import { QuestionPayload } from '../types/api';
import { queryKeys } from './keys';

export const useQuestions = (deckId: string | undefined, shareCode?: string) =>
  useQuery({
    queryKey: deckId ? ['questions', deckId, shareCode ?? null] : ['questions', 'missing'],
    queryFn: () => {
      if (!deckId) throw new Error('deckId is required');
      return listQuestions(deckId, shareCode);
    },
    enabled: !!deckId,
  });

export const useCreateQuestion = (deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: QuestionPayload) => createQuestion(deckId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions', deckId] });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};

export const useUpdateQuestion = (questionId: string, deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<QuestionPayload>) =>
      updateQuestion(questionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions', deckId] });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};

export const useDeleteQuestion = (deckId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions', deckId] });
      qc.invalidateQueries({ queryKey: queryKeys.deck(deckId) });
    },
  });
};
