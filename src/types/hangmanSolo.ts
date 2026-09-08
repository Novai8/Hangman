export type HangmanSoloDifficulty = 'easy' | 'medium' | 'hard';

export type HangmanSoloCategory =
  | 'Animals'
  | 'Food'
  | 'Countries'
  | 'Cities'
  | 'Technology'
  | 'Sports'
  | 'Movies'
  | 'Games'
  | 'Science'
  | 'Space'
  | 'Nature'
  | 'Vehicles'
  | 'Everyday Objects'
  | 'Professions'
  | 'Medical'
  | 'Random';

export type HangmanSoloStep =
  | 'category_select'
  | 'difficulty_select'
  | 'playing'
  | 'results';

export interface HangmanWordItem {
  word: string;
  hint?: string;
}

export interface HangmanSoloScoreBreakdown {
  basePoints: number;
  correctLetterPoints: number;
  remainingAttemptsBonus: number;
  speedBonus: number;
  incorrectPenalty: number;
  streakBonus: number;
  difficultyMultiplier: number;
  finalScore: number;
}

export interface HangmanSoloGameState {
  category: HangmanSoloCategory;
  resolvedCategory: string;
  difficulty: HangmanSoloDifficulty;
  word: string;
  hint: string;
  guessedLetters: Set<string>;
  mistakes: number;
  maxMistakes: number;
  remainingAttempts: number;
  status: 'playing' | 'won' | 'lost';
  score: number;
  startTime: number;
  endTime?: number;
  elapsedSeconds: number;
  scoreBreakdown?: HangmanSoloScoreBreakdown;
}

export interface HangmanSoloStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  highestScore: number;
  averageScore: number;
  bestStreak: number;
  currentStreak: number;
  fastestWin: number | null; // in seconds
  totalGuesses: number;
  totalCorrectGuesses: number;
  favoriteCategory: string;
  categoryPlayedCount: Record<string, number>;
}
