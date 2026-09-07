import React from 'react';
import { motion } from 'motion/react';
import {
  HANGMAN_SOLO_CATEGORIES,
  CategoryInfo
} from '../../../data/hangmanSoloData';
import { HangmanSoloCategory, HangmanSoloStats } from '../../../types/hangmanSolo';
import { sound } from '../../../utils/audio';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Target,
  Gamepad2
} from 'lucide-react';

interface HangmanSoloCategorySelectProps {
  stats: HangmanSoloStats;
  selectedCategory: HangmanSoloCategory | null;
  onSelectCategory: (category: HangmanSoloCategory) => void;
  onBackToHome: () => void;
}

export const HangmanSoloCategorySelect: React.FC<HangmanSoloCategorySelectProps> = ({
  stats,
  selectedCategory,
  onSelectCategory,
  onBackToHome
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Top Controls & Breadcrumbs */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          id="btn-solo-back-to-hangman-home"
          onClick={() => {
            sound.keyTap();
            onBackToHome();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>HANGMAN HOME</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-full">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>SOLO MODE • STEP 1/2</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Word Guessing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Category
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
          Choose from 14 specialized word universes or face the chaotic Random mix.
        </p>
      </div>

      {/* Solo Career Quick Stats */}
      {stats.gamesPlayed > 0 && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Won</p>
              <p className="text-base font-black text-white">
                {stats.gamesWon} <span className="text-xs font-normal text-slate-500">/ {stats.gamesPlayed}</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Best Streak</p>
              <p className="text-base font-black text-amber-400">{stats.bestStreak} WINS</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">High Score</p>
              <p className="text-base font-black text-violet-400">{stats.highestScore.toLocaleString()} PTS</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Win Rate</p>
              <p className="text-base font-black text-emerald-400">{stats.winRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Selection Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {HANGMAN_SOLO_CATEGORIES.map((cat: CategoryInfo) => {
          const isSelected = selectedCategory === cat.id;
          const isRandom = cat.id === 'Random';

          return (
            <motion.div
              key={cat.id}
              id={`cat-card-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.keyTap();
                onSelectCategory(cat.id);
              }}
              className={`cursor-pointer rounded-2xl p-4 sm:p-5 text-left transition-all relative overflow-hidden flex flex-col justify-between border ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20'
                  : isRandom
                  ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Subtle ambient accent glow */}
              <div
                className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
                  isRandom ? 'bg-amber-500/15' : 'bg-cyan-500/10'
                }`}
              />

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl sm:text-3xl" role="img" aria-label={cat.name}>
                    {cat.icon}
                  </span>
                  {isRandom ? (
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      CHAOS MIX
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      SOLO
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 tracking-wider truncate max-w-[200px]">
                  {cat.sample}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  SELECT →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
