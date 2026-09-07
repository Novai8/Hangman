import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Gamepad2,
  BookOpen,
  Volume2,
  VolumeX,
  Flame,
  Users,
  Trophy,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface GameHubViewProps {
  userProfile: UserProfile;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onSelectGame: (game: 'hangman' | 'wordlibs') => void;
  onQuickJoinCode: (code: string) => void;
}

export const GameHubView: React.FC<GameHubViewProps> = ({
  userProfile,
  sfxEnabled,
  onToggleSfx,
  onSelectGame,
  onQuickJoinCode
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomCode.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setJoinError('Please enter a valid 6-character room code.');
      return;
    }
    setIsChecking(true);
    setJoinError(null);
    try {
      const res = await fetch(`/api/rooms/${clean}/info`);
      const data = await res.json();
      if (!data.exists) {
        setJoinError(`Room "${clean}" not found. Check the code and try again.`);
        sound.wrong();
        return;
      }
      sound.correct();
      onQuickJoinCode(clean);
    } catch {
      setJoinError('Connection error. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              GAME HUB
            </h1>
            <p className="text-[11px] font-mono text-slate-400 tracking-wide">
              MULTI-GAME PLATFORM
            </p>
          </div>
        </div>

        {/* Profile & Controls */}
        <div className="flex items-center gap-3">
          <button
            id="hub-sfx-toggle-btn"
            onClick={onToggleSfx}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={sfxEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-sm">
            <span className="text-xl" role="img" aria-label="avatar">
              {userProfile.avatar || '👤'}
            </span>
            <div className="hidden sm:block text-left">
              <div className="font-semibold text-slate-200 text-xs truncate max-w-[120px]">
                {userProfile.name}
              </div>
              <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5" />
                <span>{userProfile.totalPoints} pts</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 flex flex-col justify-center">
        {/* Hub Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SELECT A MULTIPLAYER TITLE</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3"
          >
            Choose Your Game
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base"
          >
            Pick a competitive word guessing battle or dive into unpredictable, hilarious party storytelling.
          </motion.p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: HANGMAN */}
          <motion.div
            id="hub-select-hangman-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              sound.keyTap();
              onSelectGame('hangman');
            }}
            className="group cursor-pointer relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-cyan-950/20 hover:shadow-cyan-500/10 transition-all overflow-hidden"
          >
            {/* Ambient Cyan glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  CYBER WORD GUESSING
                </span>
                <span className="text-xs font-mono text-slate-500">2-8 PLAYERS</span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors mb-2 tracking-tight">
                HANGMAN
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Classic multiplayer word guessing reinvented in high-octane neon cyber aesthetics. Crack the secret phrase letter-by-letter before your life pods deplete!
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 mb-8">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-cyan-400">⚡</span> Survival & Timed
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-cyan-400">🎯</span> 7 Word Categories
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-cyan-400">🌐</span> Live SSE Realtime
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-cyan-400">🏆</span> Global Leaderboards
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="hub-play-hangman-btn"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 group-hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Play Hangman</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Card 2: WORD LIBS */}
          <motion.div
            id="hub-select-wordlibs-card"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              sound.pop();
              onSelectGame('wordlibs');
            }}
            className="group cursor-pointer relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-amber-950/20 hover:shadow-amber-500/10 transition-all overflow-hidden"
          >
            {/* Ambient Amber glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  PARTY STORYTELLING
                </span>
                <span className="text-xs font-mono text-slate-500">2-8 PLAYERS</span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-3xl font-black text-white group-hover:text-amber-400 transition-colors mb-2 tracking-tight">
                WORD LIBS
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Make words. Make stories. Create chaos! Answer hilarious contextual prompts secretly, assemble wild original tales, and vote on the most unhinged answers.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 mb-8">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-amber-400">✍️</span> 100+ Funny Prompts
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-amber-400">🔥</span> 7 Random Chaos Events
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-amber-400">⚔️</span> Anonymous Story Battles
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className="text-amber-400">😂</span> Live Party Voting
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="hub-play-wordlibs-btn"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 group-hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Play Word Libs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Universal Quick Join Bar */}
        <div className="max-w-xl mx-auto w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>HAVE A ROOM CODE? JOIN DIRECTLY</span>
          </div>
          <form onSubmit={handleJoinSubmit} className="flex gap-2.5">
            <input
              id="hub-room-code-input"
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER 6-LETTER CODE"
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 font-mono text-center tracking-widest text-white uppercase placeholder:text-slate-600 outline-none transition-all"
            />
            <button
              id="hub-join-room-submit-btn"
              type="submit"
              disabled={isChecking || !roomCode.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-amber-500 hover:opacity-90 disabled:opacity-50 text-slate-950 transition-opacity"
            >
              {isChecking ? 'Connecting...' : 'Join Match'}
            </button>
          </form>
          {joinError && (
            <p className="mt-2.5 text-xs text-rose-400 font-mono text-center">
              {joinError}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        Game Hub Platform • Hangman & Word Libs Multiplayer Engines
      </footer>
    </div>
  );
};
