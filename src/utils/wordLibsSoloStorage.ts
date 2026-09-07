import { WordLibsSoloStats } from '../types/wordLibsSolo';

const STATS_STORAGE_KEY = 'wordlibs_solo_stats_v1';

export const DEFAULT_SOLO_STATS: WordLibsSoloStats = {
  totalStoriesCompleted: 0,
  highestScore: 0,
  totalScore: 0,
  averageScore: 0,
  longestStreak: 0,
  currentStreak: 0,
  favoriteTopic: 'None yet',
  topicCounts: {},
  fastestCompletion: null,
  totalPromptsAnswered: 0,
  totalWordsEntered: 0,
  mostRecentStoryTitle: undefined
};

/**
 * Safely retrieves Solo Statistics from localStorage.
 * Automatically handles missing or corrupted JSON without crashing.
 */
export function getSoloStats(): WordLibsSoloStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SOLO_STATS };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_SOLO_STATS };
    }

    // Merge with defaults to guarantee all expected fields exist
    return {
      totalStoriesCompleted: Number(parsed.totalStoriesCompleted) || 0,
      highestScore: Number(parsed.highestScore) || 0,
      totalScore: Number(parsed.totalScore) || 0,
      averageScore: Number(parsed.averageScore) || 0,
      longestStreak: Number(parsed.longestStreak) || 0,
      currentStreak: Number(parsed.currentStreak) || 0,
      favoriteTopic: typeof parsed.favoriteTopic === 'string' ? parsed.favoriteTopic : 'None yet',
      topicCounts: typeof parsed.topicCounts === 'object' && parsed.topicCounts !== null ? parsed.topicCounts : {},
      fastestCompletion: typeof parsed.fastestCompletion === 'number' ? parsed.fastestCompletion : null,
      totalPromptsAnswered: Number(parsed.totalPromptsAnswered) || 0,
      totalWordsEntered: Number(parsed.totalWordsEntered) || 0,
      mostRecentStoryTitle: typeof parsed.mostRecentStoryTitle === 'string' ? parsed.mostRecentStoryTitle : undefined
    };
  } catch (err) {
    console.warn('Corrupted Word Libs solo statistics in storage, resetting to default:', err);
    return { ...DEFAULT_SOLO_STATS };
  }
}

/**
 * Safely persists Solo Statistics to localStorage.
 */
export function saveSoloStats(stats: WordLibsSoloStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save Word Libs solo statistics to storage:', err);
  }
}

/**
 * Updates stats after finishing a solo game.
 */
export function recordSoloGameCompletion(params: {
  score: number;
  promptsCount: number;
  wordsEnteredCount: number;
  durationSeconds: number;
  topic: string;
  storyTitle: string;
  isCompletedStory: boolean;
}): WordLibsSoloStats {
  const stats = getSoloStats();

  if (params.isCompletedStory) {
    stats.totalStoriesCompleted += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  } else {
    // If expired without completing, streak resets
    stats.currentStreak = 0;
  }

  stats.totalScore += params.score;
  if (params.score > stats.highestScore) {
    stats.highestScore = params.score;
  }
  stats.averageScore = stats.totalStoriesCompleted > 0
    ? Math.round(stats.totalScore / stats.totalStoriesCompleted)
    : params.score;

  stats.totalPromptsAnswered += params.promptsCount;
  stats.totalWordsEntered += params.wordsEnteredCount;
  stats.mostRecentStoryTitle = params.storyTitle;

  // Track topic counts
  const currentTopicCount = (stats.topicCounts[params.topic] || 0) + 1;
  stats.topicCounts[params.topic] = currentTopicCount;

  // Determine favorite topic
  let maxCount = 0;
  let fav = stats.favoriteTopic;
  for (const [t, c] of Object.entries(stats.topicCounts)) {
    if (c > maxCount) {
      maxCount = c;
      fav = t;
    }
  }
  stats.favoriteTopic = fav;

  // Fastest completion (for fully completed stories)
  if (params.isCompletedStory && params.durationSeconds > 0) {
    if (stats.fastestCompletion === null || params.durationSeconds < stats.fastestCompletion) {
      stats.fastestCompletion = params.durationSeconds;
    }
  }

  saveSoloStats(stats);
  return stats;
}

/**
 * Resets solo stats
 */
export function resetSoloStats(): WordLibsSoloStats {
  try {
    localStorage.removeItem(STATS_STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
  return { ...DEFAULT_SOLO_STATS };
}
