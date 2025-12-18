import { getSessionResult } from '../api/sessions.api';
import { listQuestions } from '../api/questions.api';
import type { FlashQuestion, Question } from '../types/api';

const toFiniteNumber = (value: unknown): number | null => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

export const shouldAttemptSessionResync = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('internal server error') ||
    normalized.includes('question is not the current step') ||
    normalized.includes('question already answered')
  );
};

export async function resyncNextFlashQuestion(sessionId: string): Promise<{
  nextQuestion: FlashQuestion | null;
  finished: boolean;
}> {
  const result = await getSessionResult(sessionId);
  const mode = (result as any)?.mode;
  if (mode !== 'TEST_FLASH') {
    return { nextQuestion: null, finished: false };
  }

  const items: any[] = Array.isArray((result as any).items) ? (result as any).items : [];
  const nextPending = items.find((item) => item && item.selectedOption == null);

  if (!nextPending) {
    return { nextQuestion: null, finished: true };
  }

  const cardId = (nextPending as any).cardId;
  const prompt = String((nextPending as any).prompt ?? '');
  const options = Array.isArray((nextPending as any).options)
    ? (nextPending as any).options.map((v: unknown) => String(v))
    : [];

  return {
    nextQuestion: {
      kind: 'FLASH',
      cardId: cardId as any,
      prompt,
      options,
    },
    finished: false,
  };
}

export async function resyncNextTestQuestion(params: {
  sessionId: string;
  deckId: string;
  shareCode?: string;
}): Promise<{ nextQuestion: Question | null; finished: boolean }> {
  const result = await getSessionResult(params.sessionId);
  const mode = (result as any)?.mode;
  if (mode !== 'TEST') {
    return { nextQuestion: null, finished: false };
  }

  const session = (result as any)?.session;
  const testAnswers: any[] = Array.isArray(session?.testAnswers)
    ? session.testAnswers
    : Array.isArray((result as any)?.testAnswers)
      ? (result as any).testAnswers
      : [];

  const answeredIds = new Set<number>();
  for (const ans of testAnswers) {
    const qid = toFiniteNumber(ans?.questionId);
    if (qid != null) answeredIds.add(qid);
  }

  const questions = await listQuestions(params.deckId, params.shareCode);
  const sorted = [...questions].sort((a: any, b: any) => {
    const at = Date.parse(String(a?.createdAt ?? ''));
    const bt = Date.parse(String(b?.createdAt ?? ''));
    if (Number.isFinite(at) && Number.isFinite(bt)) return at - bt;
    const aid = toFiniteNumber(a?.id) ?? 0;
    const bid = toFiniteNumber(b?.id) ?? 0;
    return aid - bid;
  });

  const next = sorted.find((q: any) => {
    const qid = toFiniteNumber(q?.id);
    if (qid == null) return false;
    return !answeredIds.has(qid);
  });

  if (!next) {
    return { nextQuestion: null, finished: true };
  }

  return { nextQuestion: next, finished: false };
}

