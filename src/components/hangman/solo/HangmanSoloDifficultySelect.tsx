import React from 'react';
import { motion } from 'motion/react';
import { HangmanSoloCategory, HangmanSoloDifficulty } from '../../../types/hangmanSolo';
import { sound } from '../../../utils/audio';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Flame,
  Gamepad2,
  CheckCircle2
} from 'lucide-react';

interface HangmanSoloDifficultySelectProps {
  category: HangmanSoloCategory;
  onSelectDifficulty: (difficulty: HangmanSoloDifficulty) => void;
  onBackToCategories: () => void;
}

interface DifficultyOption {
  id: HangmanSoloDifficulty;
  title: string;
  badge: string;
  mistakesAllowed: number;
  multiplier: string;
  description: string;
  features: string[];
  theme: {
    border: string;
    bg: string;
    badgeBg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: 'easy',
    title: 'EASY',
    badge: 'FORGIVING',
    mistakesAllowed: 8,
    multiplier: '1.0x',
    description: 'Shorter words and familiar everyday vocabulary with high mistake tolerance.',
    features: ['8 Maximum Mistakes Allowed', 'Shorter & Familiar Words', '1.0x Base Score Multiplier'],
    theme: {
      border: 'border-emerald-500/40 hover:border-emerald-400',
      bg: 'from-emerald-950/20 via-slate-900 to-slate-950',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      text: 'text-emerald-400',
      icon: ShieldCheck
    }
  },
  {
    id: 'medium',
    title: 'MEDIUM',
    badge: 'RECOMMENDED',
    mistakesAllowed: 6,
    multiplier: '1.5x',
    description: 'Standard hangman rules with moderate word lengths and varied vocabulary.',
    features: ['6 Maximum Mistakes Allowed', 'Moderate Length Vocabulary', '1.5x Score Multiplier'],
    theme: {
      border: 'border-cyan-500/40 hover:border-cyan-400',
      bg: 'from-cyan-950/20 via-slate-900 to-slate-950',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      text: 'text-cyan-400',
      icon: Zap
    }
  },
  {
    id: 'hard',
    title: 'HARD',
    badge: 'EXPERT',
    mistakesAllowed: 5,
    multiplier: '2.0x',
    description: 'Punishing mistake limit with longer, advanced words and high bonus rewards.',
    features: ['5 Maximum Mistakes Allowed', 'Advanced & Compound Words', '2.0x Score Multiplier'],
    theme: {
      border: 'border-rose-500/40 hover:border-rose-400',
      bg: 'from-rose-950/20 via-slate-900 to-slate-950',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      text: 'text-rose-400',
      icon: Flame
    }
  }
];

export const HangmanSoloDifficultySelect: React.FC<HangmanSoloDifficultySelectProps> = ({
  category,
  onSelectDifficulty,
  onBackToCategories
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          id="btn-solo-back-to-categories"
          onClick={() => {
            sound.keyTap();
            onBackToCategories();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>CHANGE CATEGORY</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-full">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>CATEGORY: <strong className="text-white">{category.toUpperCase()}</strong></span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">
          Step 2/2 • Difficulty Mode
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Difficulty
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          Difficulty changes both mistake tolerances and the word selection complexity.
        </p>
      </div>

      {/* 3 Difficulty Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const Icon = opt.theme.icon;

          return (
            <motion.div
              key={opt.id}
              id={`diff-card-${opt.id}`}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.keyTap();
                onSelectDifficulty(opt.id);
              }}
              className={`cursor-pointer rounded-2xl p-6 text-left transition-all relative overflow-hidden flex flex-col justify-between border bg-gradient-to-b ${opt.theme.bg} ${opt.theme.border} shadow-xl`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${opt.theme.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${opt.theme.badgeBg}`}>
                    {opt.badge}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  {opt.title}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs font-mono">
                  <span className={`${opt.theme.text} font-bold`}>{opt.mistakesAllowed} Mistakes</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-bold">{opt.multiplier} Score</span>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {opt.description}
                </p>

                <div className="mt-5 space-y-2 pt-4 border-t border-white/5">
                  {opt.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${opt.theme.text} shrink-0`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  id={`btn-start-${opt.id}`}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <span>START GAME</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
