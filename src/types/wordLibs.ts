import { UserProfile, ConnectionStatus } from '../types';

export type WordLibsGameMode = 
  | 'classic'
  | 'speed'
  | 'secret'
  | 'battle'
  | 'random_chaos'
  | 'one_word'
  | 'team_chaos';

export type WordLibsTopic =
  | 'Random'
  | 'School'
  | 'Work'
  | 'Food'
  | 'Space'
  | 'Fantasy'
  | 'Superheroes'
  | 'Apocalypse'
  | 'Travel'
  | 'Mystery'
  | 'Pirates'
  | 'Gaming'
  | 'AI'
  | 'Everyday Life'
  | 'Dating Disaster'
  | 'Family Chaos'
  | 'Vacation Disaster'
  | 'Restaurant Disaster'
  | 'Medieval Chaos'
  | 'Future Chaos';

export type WordInputType =
  | 'name'
  | 'animal'
  | 'food'
  | 'place'
  | 'object'
  | 'adjective'
  | 'verb'
  | 'profession'
  | 'superpower'
  | 'sound'
  | 'catchphrase'
  | 'excuse'
  | 'secret'
  | 'invention'
  | 'character'
  | 'number'
  | 'brand'
  | 'internet_phrase'
  | 'random_object';

export interface WordLibsPrompt {
  id: string;
  key: string;
  promptText: string;
  inputType: WordInputType;
  placeholder?: string;
}

export interface WordLibsStoryTemplate {
  id: string;
  title: string;
  topic: WordLibsTopic;
  paragraphs: string[];
  requiredPromptKeys: string[];
}

export type WordLibsChaosEvent = 
  | 'none'
  | 'double_points'
  | 'speed_round'
  | 'one_word_only'
  | 'jackpot'
  | 'reverse_story'
  | 'secret_bonus'
  | 'last_second'
  | 'everyone_is_a_villain';

export interface WordLibsSettings {
  mode: WordLibsGameMode;
  topic: WordLibsTopic;
  maxPlayers: number; // 2-8
  rounds: number; // 3, 5, 7, 10
  timerDuration: number; // 15, 30, 45, 60, 0
}

export type WordLibsPhase = 
  | 'lobby'
  | 'answering'
  | 'story_reveal'
  | 'voting'
  | 'round_results'
  | 'final_results';

export interface WordLibsPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isLocal: boolean;
  score: number;
  roundScore: number;
  connectionStatus: ConnectionStatus;
  color: string;
  currentStreak: number;
  hasSubmitted: boolean;
  awardedTitle?: string;
}

export type WordLibsVoteCategory = 
  | 'funniest'
  | 'most_unexpected'
  | 'most_chaotic'
  | 'best_story'
  | 'most_unhinged'
  | 'best_plot_twist'
  | 'most_questionable';

export interface InsertedToken {
  key: string;
  word: string;
  submitterName?: string;
}

export interface StoryParagraph {
  rawText: string;
  tokens: InsertedToken[];
}

export interface WordLibsStory {
  id: string;
  authorPlayerId?: string;
  authorAnonymousLabel: string; // e.g. "Story A (Anonymous)", "Story B (Anonymous)"
  authorRealName?: string;
  title: string;
  paragraphs: string[];
  insertedWords: Record<string, { word: string; submitterName?: string; submitterId?: string }>;
}

export interface WordLibsVoteItem {
  category: WordLibsVoteCategory;
  label: string;
  icon: string;
  points: number;
}

export interface WordLibsRoom {
  code: string;
  gameType: 'wordlibs';
  hostId: string;
  settings: WordLibsSettings;
  players: WordLibsPlayer[];
  currentRound: number;
  totalRounds: number;
  phase: WordLibsPhase;
  activeChaosEvent: WordLibsChaosEvent;
  storyTitle: string;
  currentPrompts: WordLibsPrompt[];
  currentPromptIndex: number; // For progressive prompt answering if desired or 0
  timeRemaining: number;
  timerStartedAt: number;
  // Answers submitted for current round: public view only shows who has submitted, not the words until reveal!
  submittedPlayerIds: string[];
  // Revealed stories
  revealedStories: WordLibsStory[];
  currentRevealParagraph: number;
  totalParagraphs: number;
  // Votes: category -> targetStoryId -> count
  votesReceived: Record<WordLibsVoteCategory, Record<string, number>>;
  roundWinners?: Array<{ category: WordLibsVoteCategory; winnerStoryId: string; winnerPlayerName: string; points: number }>;
  finalLeaderboard?: Array<{ rank: number; player: WordLibsPlayer; title: string }>;
  isPublic: boolean;
}
