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
  id: string | number;
  deckId: string | number;
  mode: SessionMode;
  startedAt: string;
  /** Backward-compat alias used by older client code. */
  createdAt?: string;
  finishedAt?: string | null;
  totalCards?: number | null;
  correctCount?: number | null;
};

export type SessionHistoryItem = Session & {
  deck?: { id: string | number; title: string };
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
  /** Some backends expose a separate step/question id. */
  questionId?: string;
  /** Alternative naming used by some backends. */
  stepId?: string;
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
  /** For single-choice APIs that expect a singular value. */
  selectedOptionId?: string;
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
  stats?: { totalAnswered: number; correctCount: number; progressPercent: number };
};

export type FlashAnswerPayload = {
  cardId: string | number;
  selectedIndex?: number;
  selectedOptionText?: string;
};

export type FlashAnswerResponse = {
  answered: { cardId: string | number; isCorrect: boolean };
  nextQuestion?: FlashQuestion;
  finished: boolean;
  stats: { totalAnswered: number; correctCount: number; progressPercent: number };
};

export type SessionTestAnswer = {
  id?: string | number;
  sessionId?: string | number;
  questionId: string | number;
  isCorrect?: boolean;
  selectedOptionIds?: Array<string | number> | null;
  answerText?: string | null;
  answeredAt?: string;
  question?: Question;
};

export type SessionResultTest = {
  mode: 'TEST';
  session: Session & { testAnswers: SessionTestAnswer[] };
  stats: { totalAnswered: number; correctCount: number; progressPercent: number };
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
    correctOption: string | null;
    selectedOption?: string | null;
    isCorrect: boolean;
  }>;
};

export type SessionResultResponse = SessionResultTest | SessionResultFlash;

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};
