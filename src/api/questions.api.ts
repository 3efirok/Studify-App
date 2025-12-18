import { api } from './client';
import { Question, QuestionPayload } from '../types/api';

export const listQuestions = async (deckId: string, shareCode?: string) => {
  const { data } = await api.get<Question[]>(`/api/decks/${deckId}/questions`, {
    params: shareCode ? { shareCode } : undefined,
  });
  return data;
};

export const createQuestion = async (
  deckId: string,
  payload: QuestionPayload
) => {
  const { data } = await api.post<Question>(`/api/decks/${deckId}/questions`, payload);
  return data;
};

export const updateQuestion = async (
  questionId: string,
  payload: Partial<QuestionPayload>
) => {
  const { data } = await api.patch<Question>(`/api/questions/${questionId}`, payload);
  return data;
};

export const deleteQuestion = async (questionId: string) => {
  const { data } = await api.delete<Question>(`/api/questions/${questionId}`);
  return data;
};
