import { api } from './client';
import {
  CardMarkPayload,
  CardMarkResponse,
  CardSessionStartResponse,
  FlashAnswerPayload,
  FlashAnswerResponse,
  FlashSessionStartResponse,
  Session,
  SessionStartPayload,
  SessionResultResponse,
  TestAnswerPayload,
  TestAnswerResponse,
  TestSessionStartResponse,
} from '../types/api';

export const startSession = async (
  deckId: string,
  payload: SessionStartPayload
) => {
  const { data } = await api.post<
    CardSessionStartResponse | TestSessionStartResponse | FlashSessionStartResponse
  >(`/api/decks/${deckId}/sessions`, payload);
  return data;
};

export const cardMark = async (sessionId: string, payload: CardMarkPayload) => {
  const { data } = await api.post<CardMarkResponse>(
    `/api/sessions/${sessionId}/card-mark`,
    payload
  );
  return data;
};

export const submitTestAnswer = async (
  sessionId: string,
  payload: TestAnswerPayload
) => {
  const { data } = await api.post<TestAnswerResponse>(
    `/api/sessions/${sessionId}/test-answers`,
    payload
  );
  return data;
};

export const getSessionResult = async (sessionId: string) => {
  const { data } = await api.get<SessionResultResponse>(
    `/api/sessions/${sessionId}/result`
  );
  return data;
};

export const finishSession = async (sessionId: string) => {
  const { data } = await api.post<Session>(`/api/sessions/${sessionId}/finish`);
  return data;
};

export const submitFlashAnswer = async (
  sessionId: string,
  payload: FlashAnswerPayload
) => {
  const { data } = await api.post<FlashAnswerResponse>(
    `/api/sessions/${sessionId}/flash-answers`,
    payload
  );
  return data;
};
