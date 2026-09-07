import React from 'react';
import { motion } from 'motion/react';
import { WordLibsSoloMode } from '../../../types/wordLibsSolo';
import { sound } from '../../../utils/audio';
import {
  BookOpen,
  Zap,
  Flame,
  Sparkles,
  Infinity,
  ArrowRight,
  Trophy,
  ArrowLeft
} from 'lucide-react';

interface WordLibsSoloModeSelectProps {
  onSelectMode: (mode: WordLibsSoloMode) => void;
  onBackToHome: () => void;
  currentStreak: number;
}

interface ModeCardInfo {
  mode: WordLibsSoloMode;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  borderHover: string;
}

export const WordLibsSoloModeSelect: React.FC<WordLibsSoloModeSelectProps> = ({
  onSelectMode,
  onBackToHome,
  currentStreak
}) => {
  const modes: ModeCardInfo[] = [
    {
      mode: 'classic',
      title: 'Classic Solo',
      tagline: 'The Standard Word Libs Experience',
      description: 'Progress through fun, contextual prompts at your own pace. Discover hilarious stories tailored to your answers.',
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
      badge: 'POPULAR',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderHover: 'hover:border-amber-500/50 hover:shadow-amber-500/10'
    },
    {
      mode: 'speed',
      title: 'Speed Solo',
      tagline: 'Beat the Countdown Timer',
      description: 'Fast-paced adrenaline challenge! Complete all prompts before time runs out. Earn big speed score bonuses.',
      icon: <Zap className="w-6 h-6 text-rose-400" />,
      badge: 'TIMED ⏱️',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderHover: 'hover:border-rose-500/50 hover:shadow-rose-500/10'
    },
    {
      mode: 'random_chaos',
      title: 'Random Chaos',
      tagline: 'Unpredictable Mashups',
      description: 'Mixes wild prompts from completely unrelated topics and categories. Guaranteed unhinged narrative madness.',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      badge: 'CHAOTIC 🔥',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      borderHover: 'hover:border-orange-500/50 hover:shadow-orange-500/10'
    },
    {
      mode: 'one_word',
      title: 'One Word',
      tagline: 'Minimalist & Snappy',
      description: 'Ultra-fast prompts: a person, an animal, a food, a place. Quick answers create surprisingly punchy stories.',
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      badge: 'FAST ⚡',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      borderHover: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10'
    },
    {
      mode: 'endless',
      title: 'Endless Solo',
      tagline: 'Story After Story Streak',
      description: 'Keep generating stories back-to-back! Build massive score streaks and conquer topic after topic until you decide to stop.',
      icon: <Infinity className="w-6 h-6 text-violet-400" />,
      badge: 'STREAK ∞',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      borderHover: 'hover:border-violet-500/50 hover:shadow-violet-500/10'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <button
          id="solo-mode-back-btn"
          onClick={() => {
            sound.pop();
            onBackToHome();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>WORD LIBS HOME</span>
        </button>

        {currentStreak > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{currentStreak} STORY STREAK 🔥</span>
          </div>
        )}
      </div>

      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold mb-3"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOLO STORY ENGINE</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Solo Game Mode
        </h2>
        <p className="text-sm font-mono text-slate-400 mt-2 max-w-xl mx-auto">
          Play independently in your browser. No rooms, no waiting, pure offline-first storytelling fun.
        </p>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((item, index) => (
          <motion.div
            key={item.mode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => {
              sound.pop();
              onSelectMode(item.mode);
            }}
            id={`solo-mode-${item.mode}-card`}
            className={`p-5 rounded-2xl bg-slate-900/80 border border-slate-800 ${item.borderHover} cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg relative overflow-hidden`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs font-mono text-amber-400/80 mb-2 font-semibold">
                {item.tagline}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
              <span>Start {item.title}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
