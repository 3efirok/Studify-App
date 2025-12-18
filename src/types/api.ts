export type User = {
  id: string;
  email: string;
  name?: string | null;
};

// Auth
export type AuthRegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type RegisterResponse = User;

// Decks
export type DeckCreatePayload = {
  title: string;
  description?: string | null;
};

export type DeckUpdatePayload = Partial<DeckCreatePayload>;

export type DeckShareResponse = {
  shareCode: string;
};

export type DeckCopyPayload = {
  shareCode: string;
};

// Cards
export type Card = {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  known?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CardPayload = {
  question: string;
  answer: string;
};

// Questions
export type QuestionType = 'TEST_SINGLE' | 'TEST_MULTI' | 'TEXT';

export type QuestionOption = {
  id?: string;
  text: string;
  isCorrect?: boolean;
};

export type Question = {
  id: string;
  deckId: string;
  title: string;
  prompt: string;
  type: QuestionType;
  answerText?: string | null;
  options?: QuestionOption[];
};

export type QuestionPayload = {
  title: string;
  prompt: string;
  type: QuestionType;
  answerText?: string;
  options?: QuestionOption[];
};

// Deck aggregate
export type Deck = {
  id: string;
  title: string;
  description?: string | null;
  ownerId?: string;
  shareCode?: string | null;
  cards?: Card[];
  questions?: Question[];
  _count?: {
    cards: number;
    questions?: number;
  };
};

// Sessions
export type SessionMode = 'CARD' | 'TEST' | 'TEST_FLASH';

export type Session = {
  id: string;
  deckId: string;
  mode: SessionMode;
  shareCode?: string | null;
  createdAt: string;
  finishedAt?: string | null;
};

export type SessionStartPayload = {
  mode: SessionMode;
  shareCode?: string;
  onlyUnknown?: boolean;
  optionsCount?: number;
};

export type CardSessionStartResponse = {
  session: Session;
  nextCard: Card;
};

export type TestSessionStartResponse = {
  session: Session;
  nextQuestion: Question;
};

export type FlashQuestion = {
  kind: 'FLASH';
  cardId: string | number;
  prompt: string;
  options: string[];
};

export type FlashSessionStartResponse = {
  session: Session;
  nextQuestion: FlashQuestion;
};

export type CardAnswerPayload = {
  cardId: string;
  isCorrect: boolean;
};

export type CardMarkPayload = {
  cardId: string;
  known: boolean;
};

export type CardMarkResponse = {
  progress: number;
  nextCard?: Card;
  finished?: boolean;
};

export type TestAnswerPayload = {
  questionId: string;
  selectedOptionIds?: string[];
  answerText?: string;
};

export type TestAnswerResponse = {
  answer: {
    questionId: string;
    isCorrect?: boolean;
    selectedOptionIds?: string[];
  };
  nextQuestion?: Question;
  finished?: boolean;
  stats?: {
    correct: number;
    total: number;
    };
};

export type FlashAnswerPayload = {
  cardId: string | number;
  selectedIndex: number;
};

export type FlashAnswerResponse = {
  answered: { cardId: string | number; isCorrect: boolean };
  nextQuestion?: FlashQuestion;
  finished: boolean;
  stats: { totalAnswered: number; correctCount: number; progressPercent: number };
};

export type SessionResult = {
  session: Session;
  testAnswers?: Array<{
    questionId: string;
    isCorrect?: boolean;
    selectedOptionIds?: string[];
    correctOptionIds?: string[];
    questionTitle?: string;
    correctAnswerText?: string;
  }>;
  mode?: SessionMode;
};

export type SessionResultFlash = {
  mode: 'TEST_FLASH';
  session?: Session;
  deck: { id: string; title: string };
  stats: { totalAnswered: number; correctCount: number; progressPercent: number };
  items: Array<{
    cardId: string | number;
    prompt: string;
    options: string[];
    correctOption: string;
    selectedOption?: string;
    isCorrect: boolean;
  }>;
};

export type SessionResultResponse = SessionResult | SessionResultFlash;

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};
