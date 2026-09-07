import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, LogIn, Zap, Shield, Sparkles, Trophy, Globe, Flame } from 'lucide-react';
import { sound } from '../../utils/audio';
import { multiplayerClient } from '../../services/multiplayerClient';

interface MultiplayerHomeProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onQuickMatch: () => void;
  isSearchingMatch: boolean;
}

export const MultiplayerHome: React.FC<MultiplayerHomeProps> = ({
  onCreateRoom,
  onJoinRoom,
  onQuickMatch,
  isSearchingMatch
}) => {
  const [stats, setStats] = useState<{ onlinePlayers: number; activeRooms: number }>({
    onlinePlayers: 1,
    activeRooms: 0
  });

  useEffect(() => {
    multiplayerClient.fetchStats().then(setStats);
    const timer = setInterval(() => {
      multiplayerClient.fetchStats().then(setStats);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-8 flex flex-col items-center justify-center text-center relative z-20">
      {/* Live Multiplayer Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 sm:mb-8"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-mono text-slate-300">
          <strong className="text-cyan-400">{stats.onlinePlayers}</strong> PLAYERS ONLINE • <strong className="text-purple-400">{stats.activeRooms}</strong> ACTIVE ROOMS
        </span>
      </motion.div>

      {/* Hero Headline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8 sm:mb-12 max-w-2xl"
      >
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 leading-tight">
          PARTY MULTIPLAYER
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-3 font-medium">
          Challenge your friends or jump into a match with word-guessers worldwide in real-time turn-based Hangman.
        </p>
      </motion.div>

      {/* Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full max-w-4xl">
        {/* 1. CREATE ROOM */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.keyTap();
            onCreateRoom();
          }}
          id="btn-create-room-card"
          className="group relative cursor-pointer bg-gradient-to-b from-purple-900/30 via-[#121422] to-[#0d0e17] border border-purple-500/30 hover:border-purple-400 rounded-[32px] p-6 sm:p-8 text-left shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-6 group-hover:scale-110 group-hover:bg-purple-600/50 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Plus className="w-7 h-7 text-purple-300" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase">
              Host Private Game
            </span>
            <h2 className="text-2xl font-black text-white mt-1 group-hover:text-purple-300 transition-colors">
              CREATE ROOM
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Create a custom room, choose category, difficulty, survival rules, and invite 2–8 friends via code.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-mono font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>START HOSTING</span>
            <span>→</span>
          </div>
        </motion.div>

        {/* 2. JOIN ROOM */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.keyTap();
            onJoinRoom();
          }}
          id="btn-join-room-card"
          className="group relative cursor-pointer bg-gradient-to-b from-cyan-950/30 via-[#121422] to-[#0d0e17] border border-cyan-500/30 hover:border-cyan-400 rounded-[32px] p-6 sm:p-8 text-left shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.35)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-6 group-hover:scale-110 group-hover:bg-cyan-500/50 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <LogIn className="w-7 h-7 text-cyan-300" />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              Join With Code
            </span>
            <h2 className="text-2xl font-black text-white mt-1 group-hover:text-cyan-300 transition-colors">
              JOIN ROOM
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Have a 6-character room code like <span className="font-mono text-cyan-400">HX7K92</span>? Jump directly into the friend's lobby.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>ENTER CODE</span>
            <span>→</span>
          </div>
        </motion.div>

        {/* 3. QUICK MATCH */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!isSearchingMatch) {
              sound.win();
              onQuickMatch();
            }
          }}
          id="btn-quick-match-card"
          className={`group relative cursor-pointer bg-gradient-to-b from-amber-950/30 via-[#121422] to-[#0d0e17] border border-amber-500/30 hover:border-amber-400 rounded-[32px] p-6 sm:p-8 text-left shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] ${
            isSearchingMatch ? 'border-amber-400 ring-2 ring-amber-400/50' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-6 group-hover:scale-110 group-hover:bg-amber-500/50 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Zap className={`w-7 h-7 text-amber-300 ${isSearchingMatch ? 'animate-bounce' : ''}`} />
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              Instant Matchmaker
            </span>
            <h2 className="text-2xl font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
              QUICK MATCH
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {isSearchingMatch
                ? 'Finding available room and queuing players...'
                : 'Instantly match with active players in a fast-paced public lobby.'}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-mono font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            {isSearchingMatch ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-amber-400 border-t-transparent" />
                CONNECTING...
              </span>
            ) : (
              <>
                <span>FIND MATCH</span>
                <span>→</span>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl text-left">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <Globe className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-xs font-bold text-white">Synchronized State</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Real-time word revelation & shared Hangman body</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <Flame className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-xs font-bold text-white">Live Turn Timers</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Smooth countdowns with automatic pass on timeout</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <Shield className="w-5 h-5 text-rose-400 mb-2" />
          <p className="text-xs font-bold text-white">Survival Mode</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Player elimination with 3 lives & live spectating</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-xs font-bold text-white">Quick Reactions</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Floating reactions 🔥 😂 😱 👏 💀 GG</p>
        </div>
      </div>
    </div>
  );
};
