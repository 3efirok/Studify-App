import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cardMark,
  finishSession,
  getSessionResult,
  listSessions,
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
import { queryKeys } from './keys';

export const useStartSession = (deckId: string) =>
  useMutation({
    mutationFn: (payload: SessionStartPayload) => startSession(deckId, payload),
  });

export const useSessions = (deckId?: string) =>
  useQuery({
    queryKey: queryKeys.sessions(deckId),
    queryFn: () => listSessions(deckId),
  });

export const useCardMark = (sessionId: string) =>
  useMutation({
    mutationFn: (payload: CardMarkPayload) => cardMark(sessionId, payload),
  });

export const useSubmitTestAnswer = (sessionId: string) =>
  useMutation({
    mutationFn: (payload: TestAnswerPayload) => submitTestAnswer(sessionId, payload),
  });

export const useSubmitFlashAnswer = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FlashAnswerPayload) => submitFlashAnswer(sessionId, payload),
    onSuccess: (data) => {
      if (data.finished) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionResult(sessionId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessions(),
        });
      }
    },
  });
};

export const useSessionResult = (sessionId: string | undefined) =>
  useQuery({
    queryKey: sessionId ? queryKeys.sessionResult(sessionId) : ['session-result', 'missing'],
    queryFn: () => {
      if (!sessionId) throw new Error('sessionId is required');
      return getSessionResult(sessionId);
    },
    enabled: !!sessionId,
  });

export const useFinishSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => finishSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions() });
    },
  });
};
