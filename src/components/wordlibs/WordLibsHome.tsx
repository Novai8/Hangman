import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../../types';
import { wordLibsClient } from '../../services/wordLibsClient';
import { sound } from '../../utils/audio';
import {
  Sparkles,
  Flame,
  PlusCircle,
  LogIn,
  Zap,
  HelpCircle,
  ArrowLeft,
  Users,
  BookOpen,
  Volume2,
  VolumeX,
  RefreshCw,
  Trophy
} from 'lucide-react';

interface WordLibsHomeProps {
  userProfile: UserProfile;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onQuickMatch: () => void;
  onOpenHowToPlay: () => void;
  onReturnToGameHub: () => void;
  onDirectJoinRoom: (code: string) => void;
  isQuickMatching: boolean;
}

export const WordLibsHome: React.FC<WordLibsHomeProps> = ({
  userProfile,
  sfxEnabled,
  onToggleSfx,
  onOpenCreate,
  onOpenJoin,
  onQuickMatch,
  onOpenHowToPlay,
  onReturnToGameHub,
  onDirectJoinRoom,
  isQuickMatching
}) => {
  const [publicLobbies, setPublicLobbies] = useState<
    Array<{
      code: string;
      playerCount: number;
      maxPlayers: number;
      topic: string;
      mode: string;
    }>
  >([]);
  const [isLoadingLobbies, setIsLoadingLobbies] = useState(false);

  const fetchLobbies = async () => {
    setIsLoadingLobbies(true);
    const lobbies = await wordLibsClient.getPublicLobbies();
    setPublicLobbies(lobbies);
    setIsLoadingLobbies(false);
  };

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Warm Party Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="wordlibs-back-to-gamehub-btn"
            onClick={onReturnToGameHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>GAME HUB</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-base tracking-tight hidden sm:inline">
              WORD LIBS
            </span>
          </div>
        </div>

        {/* Profile & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={onToggleSfx}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs">
            <span className="text-base">{userProfile.avatar || '👤'}</span>
            <span className="font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">
              {userProfile.name}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-10 flex flex-col justify-center">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-bold text-amber-400 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>MULTIPLAYER STORYTELLING PARTY GAME</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-3"
          >
            WORD LIBS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-300/90 font-mono text-xs sm:text-sm uppercase tracking-widest font-bold max-w-xl mx-auto mb-8"
          >
            MAKE WORDS. MAKE STORIES. CREATE CHAOS.
          </motion.p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
            <button
              id="wordlibs-home-create-room-btn"
              onClick={() => {
                sound.pop();
                onOpenCreate();
              }}
              className="flex-1 min-w-[160px] py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Room</span>
            </button>

            <button
              id="wordlibs-home-join-room-btn"
              onClick={() => {
                sound.pop();
                onOpenJoin();
              }}
              className="flex-1 min-w-[160px] py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Join Room</span>
            </button>

            <button
              id="wordlibs-home-quick-match-btn"
              onClick={() => {
                sound.pop();
                onQuickMatch();
              }}
              disabled={isQuickMatching}
              className="flex-1 min-w-[160px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-90 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" />
              <span>{isQuickMatching ? 'Finding...' : 'Quick Match'}</span>
            </button>
          </div>
        </div>

        {/* Public Lobbies Section */}
        <div className="w-full max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                Live Public Lobbies
              </h3>
            </div>
            <button
              onClick={fetchLobbies}
              disabled={isLoadingLobbies}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Lobbies"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLobbies ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {publicLobbies.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">
              No open public lobbies right now. Create one and invite your friends!
            </div>
          ) : (
            <div className="space-y-2">
              {publicLobbies.map((lobby) => (
                <div
                  key={lobby.code}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-sm">
                        {lobby.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold">
                        {lobby.topic}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Mode: <span className="capitalize">{lobby.mode.replace('_', ' ')}</span> • {lobby.playerCount}/{lobby.maxPlayers} Players
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.pop();
                      onDirectJoinRoom(lobby.code);
                    }}
                    className="py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        Word Libs Party Storytelling Engine • 100+ Prompts • Chaos Events & Story Battles
      </footer>
    </div>
  );
};
