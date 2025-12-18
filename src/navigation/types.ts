export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type DeckStackParamList = {
  DeckList: undefined;
  DeckCreateEdit: { deckId?: string } | undefined;
  DeckDetails: { deckId: string; shareCode?: string };
  Cards: { deckId: string; shareCode?: string };
  CardEdit: { deckId: string; cardId?: string };
  Questions: { deckId: string; shareCode?: string };
  QuestionEdit: { deckId: string; questionId?: string };
  SessionStart: {
    deckId: string;
    shareCode?: string;
    presetMode?: 'CARD' | 'TEST' | 'TEST_FLASH';
  };
  Session: {
    deckId: string;
    sessionId?: string;
    shareCode?: string;
    onlyUnknown?: boolean;
    mode?: 'TEST' | 'TEST_FLASH';
    optionsCount?: number;
  };
  FlashTestSession: {
    deckId: string;
    sessionId: string;
    shareCode?: string;
    initialQuestion?: import('../types/api').FlashQuestion;
  };
  CardSession: { deckId: string; sessionId?: string; shareCode?: string; onlyUnknown?: boolean };
  SessionResult: { sessionId: string };
  SharedDeck: undefined;
};

export type AppTabsParamList = {
  Decks: undefined;
  Sessions: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  AppTabs: undefined;
  Auth: undefined;
};
