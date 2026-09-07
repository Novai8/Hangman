import React from 'react';
import { motion } from 'motion/react';
import { WordLibsSoloDifficulty, WordLibsSoloMode } from '../../../types/wordLibsSolo';
import { sound } from '../../../utils/audio';
import { ArrowLeft, Shield, Sparkles, Award, Zap } from 'lucide-react';

interface WordLibsSoloDifficultySelectProps {
  mode: WordLibsSoloMode;
  topic: string;
  onSelectDifficulty: (difficulty: WordLibsSoloDifficulty) => void;
  onBack: () => void;
}

export const WordLibsSoloDifficultySelect: React.FC<WordLibsSoloDifficultySelectProps> = ({
  mode,
  topic,
  onSelectDifficulty,
  onBack
}) => {
  const options: Array<{
    difficulty: WordLibsSoloDifficulty;
    name: string;
    promptsCount: string;
    multiplier: string;
    description: string;
    color: string;
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      difficulty: 'easy',
      name: 'Easy',
      promptsCount: '3 – 5 Prompts',
      multiplier: '1.0x Score',
      description: 'Quick & punchy. Familiar everyday categories, shorter story arcs, and relaxed pacing.',
      color: 'border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5',
      badge: 'CASUAL',
      icon: <Shield className="w-5 h-5 text-emerald-400" />
    },
    {
      difficulty: 'medium',
      name: 'Medium',
      promptsCount: '6 – 8 Prompts',
      multiplier: '1.5x Score',
      description: 'Balanced challenge. More varied situations, nuanced character prompts, and richer narratives.',
      color: 'border-amber-500/40 hover:border-amber-500 bg-amber-500/5',
      badge: 'RECOMMENDED',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />
    },
    {
      difficulty: 'hard',
      name: 'Hard',
      promptsCount: '9 – 12 Prompts',
      multiplier: '2.0x Score',
      description: 'Deep narrative madness. Challenging combinations, unexpected twists, and maximum score potential.',
      color: 'border-rose-500/40 hover:border-rose-500 bg-rose-500/5',
      badge: 'CHALLENGING',
      icon: <Award className="w-5 h-5 text-rose-400" />
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <button
          id="solo-diff-back-btn"
          onClick={() => {
            sound.pop();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CHANGE TOPIC</span>
        </button>

        <div className="text-xs font-mono text-slate-400">
          TOPIC: <span className="text-amber-400 font-bold">{topic}</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>STEP 3: STORY COMPLEXITY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Difficulty
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 mt-2 max-w-lg mx-auto">
          Difficulty determines the number of prompts, narrative depth, and bonus score multipliers.
        </p>
      </div>

      {/* Difficulty Cards */}
      <div className="space-y-4">
        {options.map((opt, i) => (
          <motion.div
            key={opt.difficulty}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => {
              sound.pop();
              onSelectDifficulty(opt.difficulty);
            }}
            id={`solo-diff-${opt.difficulty}-btn`}
            className={`p-5 rounded-2xl border ${opt.color} cursor-pointer transition-all duration-150 group shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-105 transition-transform">
                {opt.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {opt.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
              <span className="text-xs font-mono font-bold text-white">
                {opt.promptsCount}
              </span>
              <span className="text-xs font-mono font-black text-amber-400">
                {opt.multiplier}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
