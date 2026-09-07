import { HangmanSoloStats } from '../types/hangmanSolo';

const STORAGE_KEY = 'hangman_solo_stats_v1';

const DEFAULT_STATS: HangmanSoloStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  winRate: 0,
  highestScore: 0,
  averageScore: 0,
  bestStreak: 0,
  currentStreak: 0,
  fastestWin: null,
  totalGuesses: 0,
  totalCorrectGuesses: 0,
  favoriteCategory: 'None',
  categoryPlayedCount: {}
};

export function getHangmanSoloStats(): HangmanSoloStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_STATS };

    return {
      gamesPlayed: Number(parsed.gamesPlayed) || 0,
      gamesWon: Number(parsed.gamesWon) || 0,
      gamesLost: Number(parsed.gamesLost) || 0,
      winRate: Number(parsed.winRate) || 0,
      highestScore: Number(parsed.highestScore) || 0,
      averageScore: Number(parsed.averageScore) || 0,
      bestStreak: Number(parsed.bestStreak) || 0,
      currentStreak: Number(parsed.currentStreak) || 0,
      fastestWin: typeof parsed.fastestWin === 'number' ? parsed.fastestWin : null,
      totalGuesses: Number(parsed.totalGuesses) || 0,
      totalCorrectGuesses: Number(parsed.totalCorrectGuesses) || 0,
      favoriteCategory: typeof parsed.favoriteCategory === 'string' ? parsed.favoriteCategory : 'None',
      categoryPlayedCount:
        typeof parsed.categoryPlayedCount === 'object' && parsed.categoryPlayedCount !== null
          ? parsed.categoryPlayedCount
          : {}
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function recordHangmanSoloGame(params: {
  won: boolean;
  score: number;
  durationSeconds: number;
  category: string;
  totalGuesses: number;
  correctGuesses: number;
}): HangmanSoloStats {
  const current = getHangmanSoloStats();

  const gamesPlayed = current.gamesPlayed + 1;
  const gamesWon = current.gamesWon + (params.won ? 1 : 0);
  const gamesLost = current.gamesLost + (params.won ? 0 : 1);
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  const highestScore = Math.max(current.highestScore, params.score);
  const prevTotalScore = current.averageScore * current.gamesPlayed;
  const averageScore = Math.round((prevTotalScore + params.score) / gamesPlayed);

  const currentStreak = params.won ? current.currentStreak + 1 : 0;
  const bestStreak = Math.max(current.bestStreak, currentStreak);

  let fastestWin = current.fastestWin;
  if (params.won) {
    if (fastestWin === null || params.durationSeconds < fastestWin) {
      fastestWin = params.durationSeconds;
    }
  }

  const totalGuesses = current.totalGuesses + params.totalGuesses;
  const totalCorrectGuesses = current.totalCorrectGuesses + params.correctGuesses;

  const categoryPlayedCount = { ...current.categoryPlayedCount };
  categoryPlayedCount[params.category] = (categoryPlayedCount[params.category] || 0) + 1;

  // Compute favorite category
  let favoriteCategory = current.favoriteCategory;
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryPlayedCount)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = cat;
    }
  }

  const updated: HangmanSoloStats = {
    gamesPlayed,
    gamesWon,
    gamesLost,
    winRate,
    highestScore,
    averageScore,
    bestStreak,
    currentStreak,
    fastestWin,
    totalGuesses,
    totalCorrectGuesses,
    favoriteCategory,
    categoryPlayedCount
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Graceful fallback if localStorage is unavailable/quota exceeded
  }

  return updated;
}
