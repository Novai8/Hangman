import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Trophy, Flame, Shield, Award, Edit3, Check, Sparkles, Star, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_OPTIONS } from '../utils/userProfile';
import { sound } from '../utils/audio';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      sound.keyTap();
      onUpdateProfile({ ...profile, name: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleSelectAvatar = (avatar: string) => {
    sound.keyTap();
    onUpdateProfile({ ...profile, avatar });
  };

  const winRate = profile.matchesPlayed > 0 
    ? Math.round((profile.multiplayerWins / profile.matchesPlayed) * 100) 
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6 relative z-20">
      {/* Top Profile Card */}
      <div className="p-6 sm:p-8 rounded-[36px] bg-gradient-to-b from-purple-950/30 via-[#111320] to-[#0c0d15] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Large */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              {profile.avatar}
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-black font-mono font-black text-[10px] shadow">
              LVL {profile.level}
            </span>
          </div>

          {/* Name & Title */}
          <div className="flex-1 text-center sm:text-left">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2 max-w-sm justify-center sm:justify-start">
                <input
                  type="text"
                  maxLength={15}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-white/10 border border-cyan-400 rounded-xl px-3 py-1.5 text-lg font-bold text-white outline-none font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-bold transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {profile.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
                  title="Edit Player Nickname"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs font-mono text-purple-400 mt-1 uppercase tracking-widest font-bold">
              {profile.title}
            </p>

            {/* Level XP Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>XP PROGRESS</span>
                <span>{profile.totalPoints % 2000} / 2000 XP TO LEVEL {profile.level + 1}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((profile.totalPoints % 2000) / 2000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker Swatches */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
            CHOOSE YOUR MULTIPLAYER AVATAR
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => handleSelectAvatar(av)}
                className={`w-11 h-11 rounded-2xl border text-xl flex items-center justify-center transition-all ${
                  profile.avatar === av
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Career Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[28px] bg-black/40 border border-white/10 backdrop-blur-md">
          <Trophy className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-mono font-black text-white">{profile.multiplayerWins}</p>
          <p className="text-[10px] font-mono uppercase text-slate-400">Match Victories</p>
        </div>

        <div className="p-4 rounded-[28px] bg-black/40 border border-white/10 backdrop-blur-md">
          <Zap className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-mono font-black text-cyan-400">{winRate}%</p>
          <p className="text-[10px] font-mono uppercase text-slate-400">Win Rate</p>
        </div>

        <div className="p-4 rounded-[28px] bg-black/40 border border-white/10 backdrop-blur-md">
          <Flame className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-mono font-black text-purple-400">{profile.bestStreak}</p>
          <p className="text-[10px] font-mono uppercase text-slate-400">Best Streak</p>
        </div>

        <div className="p-4 rounded-[28px] bg-black/40 border border-white/10 backdrop-blur-md">
          <Star className="w-5 h-5 text-rose-400 mb-2" />
          <p className="text-2xl font-mono font-black text-white">{profile.totalPoints.toLocaleString()}</p>
          <p className="text-[10px] font-mono uppercase text-slate-400">Total Career Points</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="p-6 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-wider">
            ACHIEVEMENT BADGES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {profile.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                badge.unlocked
                  ? 'bg-purple-950/20 border-purple-500/30 text-white'
                  : 'bg-white/[0.02] border-white/5 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">
                {badge.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{badge.name}</span>
                  {badge.unlocked && <span className="text-[10px] text-cyan-400">✓</span>}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
