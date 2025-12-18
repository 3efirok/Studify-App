import { useMutation, useQuery } from '@tanstack/react-query';
import {
  cardMark,
  finishSession,
  getSessionResult,
  startSession,
  submitFlashAnswer,
  submitTestAnswer,
} from '../api/sessions.api';
import {
  CardMarkPayload,
  FlashAnswerPayload,
  SessionStartPayload,
  TestAnswerPayload,
} from '../types/api';

export const useStartSession = (deckId: string) =>
  useMutation({
    mutationFn: (payload: SessionStartPayload) => startSession(deckId, payload),
  });

export const useCardMark = (sessionId: string) =>
  useMutation({
    mutationFn: (payload: CardMarkPayload) => cardMark(sessionId, payload),
  });

export const useSubmitTestAnswer = (sessionId: string) =>
  useMutation({
    mutationFn: (payload: TestAnswerPayload) => submitTestAnswer(sessionId, payload),
  });

export const useSubmitFlashAnswer = (sessionId: string) =>
  useMutation({
    mutationFn: (payload: FlashAnswerPayload) => submitFlashAnswer(sessionId, payload),
    onSuccess: (data) => {
      if (data.finished) {
        queryClient.invalidateQueries({
          queryKey: ['session-result', sessionId],
        });
      }
    },
  });

export const useSessionResult = (sessionId: string | undefined) =>
  useQuery({
    queryKey: sessionId ? ['session-result', sessionId] : ['session-result', 'missing'],
    queryFn: () => {
      if (!sessionId) throw new Error('sessionId is required');
      return getSessionResult(sessionId);
    },
    enabled: !!sessionId,
  });

export const useFinishSession = (sessionId: string) =>
  useMutation({
    mutationFn: () => finishSession(sessionId),
  });
