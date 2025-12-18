export const queryKeys = {
  decks: ['decks'] as const,
  deck: (deckId: string, shareCode?: string) =>
    ['deck', deckId, shareCode ?? null] as const,
  sharedDeck: (shareCode: string) => ['shared-deck', shareCode] as const,
  sessions: (deckId?: string) => ['sessions', deckId ?? null] as const,
  sessionResult: (sessionId: string) => ['session-result', sessionId] as const,
};
