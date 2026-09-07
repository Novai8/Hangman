export type NavigationTab = 'play' | 'multiplayer' | 'leaderboard' | 'profile';

export type GameMode = 'classic' | 'timed' | 'endless';

export type MultiplayerGameMode = 'classic' | 'timed' | 'survival';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category = 
  | 'Technology' 
  | 'Animals' 
  | 'Movies' 
  | 'Countries' 
  | 'Food' 
  | 'Sports' 
  | 'Random';

export type GameStatus = 'playing' | 'won' | 'lost';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface WordItem {
  word: string;
  hint?: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  currentScore: number;
  bestScore: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isLocal: boolean;
  score: number;
  roundScore: number;
  connectionStatus: ConnectionStatus;
  lives: number; // for survival mode (e.g. 3)
  isEliminated: boolean;
  color: string;
  currentStreak: number;
}

export type RoundLimit = 3 | 5 | 10 | 'unlimited';

export interface RoomSettings {
  mode: MultiplayerGameMode;
  category: Category;
  difficulty: Difficulty;
  maxPlayers: number;
  roundLimit: RoundLimit;
  turnDuration: number; // in seconds, default 15s
}

export type RoomPhase = 'lobby' | 'playing' | 'round_results' | 'match_results';

export interface Room {
  code: string;
  gameType?: 'hangman';
  hostId: string;
  settings: RoomSettings;
  players: Player[];
  currentRound: number;
  totalRounds: number; // 0 for unlimited
  phase: RoomPhase;
  currentWord: string;
  currentHint?: string;
  currentCategory: Category;
  guessedLetters: string[];
  mistakes: number;
  activePlayerIndex: number;
  turnTimeRemaining: number;
  turnStartedAt: number;
  isPublic: boolean;
}

export type ReactionEmoji = '🔥' | '😂' | '😱' | '👏' | '💀' | 'GG';

export interface FloatingReaction {
  id: string;
  playerId: string;
  playerName: string;
  emoji: ReactionEmoji;
  timestamp: number;
}

export interface ActivityEvent {
  id: string;
  playerId: string;
  playerName: string;
  type: 'guess_correct' | 'guess_wrong' | 'timeout' | 'eliminated' | 'connect' | 'disconnect' | 'reconnect' | 'reaction';
  text: string;
  timestamp: number;
  isCorrect?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  level: number;
  totalPoints: number;
  multiplayerWins: number;
  matchesPlayed: number;
  bestStreak: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
    description: string;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  wins: number;
  isUser?: boolean;
  trend: 'up' | 'down' | 'same';
}
