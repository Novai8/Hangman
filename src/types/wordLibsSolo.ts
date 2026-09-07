export type WordLibsSoloMode = 'classic' | 'speed' | 'random_chaos' | 'one_word' | 'endless';

export type WordLibsSoloDifficulty = 'easy' | 'medium' | 'hard';

export type WordLibsSoloStep =
  | 'mode_select'
  | 'topic_select'
  | 'difficulty_select'
  | 'playing'
  | 'reveal'
  | 'results';

export interface WordLibsSoloPrompt {
  id: string;
  key: string;
  promptText: string;
  inputType: string;
  placeholder?: string;
}

export interface WordLibsSoloStoryTemplate {
  id: string;
  title: string;
  topic: string;
  difficulty: WordLibsSoloDifficulty;
  requiredPromptKeys: string[];
  paragraphs: string[];
}

export interface WordLibsSoloGameState {
  mode: WordLibsSoloMode;
  topic: string;
  difficulty: WordLibsSoloDifficulty;
  storyTemplate: WordLibsSoloStoryTemplate;
  prompts: WordLibsSoloPrompt[];
  currentPromptIndex: number;
  answers: Record<string, string>;
  startTime: number;
  endTime?: number;
  timeRemaining?: number; // for speed mode
  initialTimerDuration?: number;
  score: number;
  streak: number;
  completedStoriesCount: number; // for endless mode
  chaosLevel: string;
  expiredTimer?: boolean;
}

export interface WordLibsSoloStats {
  totalStoriesCompleted: number;
  highestScore: number;
  totalScore: number;
  averageScore: number;
  longestStreak: number;
  currentStreak: number;
  favoriteTopic: string;
  topicCounts: Record<string, number>;
  fastestCompletion: number | null; // in seconds
  totalPromptsAnswered: number;
  totalWordsEntered: number;
  mostRecentStoryTitle?: string;
}
