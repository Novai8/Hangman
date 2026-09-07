import { UserProfile } from '../types';

export const AVATAR_OPTIONS = ['👤', '⚡', '🌸', '🎯', '🦊', '🚀', '👑', '💎', '🎮', '🔥', '🤖', '👾'];

export function loadUserProfile(): UserProfile {
  const saved = localStorage.getItem('hangman_user_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  const defaultProfile: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: 'You',
    avatar: '🎮',
    title: 'Cyber Cipher',
    level: 7,
    totalPoints: 9870,
    multiplayerWins: 14,
    matchesPlayed: 28,
    bestStreak: 8,
    badges: [
      { id: 'b1', name: 'First Blood', icon: '⚔️', unlocked: true, description: 'Win your first multiplayer round' },
      { id: 'b2', name: 'Streak Master', icon: '🔥', unlocked: true, description: 'Achieve a 5-round win streak' },
      { id: 'b3', name: 'Code Breaker', icon: '💻', unlocked: true, description: 'Guess a 10+ letter tech word' },
      { id: 'b4', name: 'Survival Champion', icon: '🛡️', unlocked: true, description: 'Win Survival without losing a life' },
      { id: 'b5', name: 'Party Legend', icon: '👑', unlocked: false, description: 'Reach 15,000 career points' },
      { id: 'b6', name: 'Speed Demon', icon: '⚡', unlocked: false, description: 'Guess correctly with <2s remaining' }
    ]
  };

  localStorage.setItem('hangman_user_profile', JSON.stringify(defaultProfile));
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem('hangman_user_profile', JSON.stringify(profile));
}
