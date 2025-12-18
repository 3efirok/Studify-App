export const queryKeys = {
  decks: ['decks'] as const,
  deck: (deckId: string, shareCode?: string) =>
    ['deck', deckId, shareCode ?? null] as const,
  sharedDeck: (shareCode: string) => ['shared-deck', shareCode] as const,
};
