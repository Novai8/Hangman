import { UserProfile } from '../types';

export const AVATAR_OPTIONS = ['👤', '⚡', '🌸', '🎯', '🦊', '🚀', '👑', '💎', '🎮', '🔥', '🤖', '👾'];

export function hasSavedUserProfile(): boolean {
  try {
    return localStorage.getItem('hangman_user_profile') !== null;
  } catch {
    return false;
  }
}

export function createDefaultUserProfile(name: string = 'Operative', avatar: string = '🎮'): UserProfile {
  return {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name,
    avatar,
    title: 'Cyber Cipher',
    level: 1,
    totalPoints: 0,
    multiplayerWins: 0,
    matchesPlayed: 0,
    bestStreak: 0,
    badges: [
      { id: 'b1', name: 'First Blood', icon: '⚔️', unlocked: false, description: 'Win your first multiplayer round' },
      { id: 'b2', name: 'Streak Master', icon: '🔥', unlocked: false, description: 'Achieve a 5-round win streak' },
      { id: 'b3', name: 'Code Breaker', icon: '💻', unlocked: false, description: 'Guess a 10+ letter tech word' },
      { id: 'b4', name: 'Survival Champion', icon: '🛡️', unlocked: false, description: 'Win Survival without losing a life' },
      { id: 'b5', name: 'Party Legend', icon: '👑', unlocked: false, description: 'Reach 15,000 career points' },
      { id: 'b6', name: 'Speed Demon', icon: '⚡', unlocked: false, description: 'Guess correctly with <2s remaining' }
    ]
  };
}

export function loadUserProfile(): UserProfile {
  const saved = localStorage.getItem('hangman_user_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }

  return createDefaultUserProfile();
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem('hangman_user_profile', JSON.stringify(profile));
}
