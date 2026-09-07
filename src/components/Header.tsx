import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Gamepad2 } from 'lucide-react';

interface HeaderProps {
  score: number;
  bestScore: number;
  streak: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  bestScore,
  streak,
  onOpenSettings
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto pt-6 pb-2 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-20">
      {/* Title & Tagline */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 leading-none">
          HANGMAN
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-medium">
          Guess the word before the rope runs out
        </p>
      </div>

      {/* Telemetry Stats & Settings */}
      <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Score</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={score}
              initial={{ scale: 1.15, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 tabular-nums"
            >
              {score.toLocaleString()}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Best Streak</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={streak}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="text-xl sm:text-2xl font-mono font-bold text-purple-400 tabular-nums flex items-center justify-end gap-1"
            >
              <span>🔥</span>
              <span>{streak}</span>
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
          aria-label="Game Settings and Rules"
          title="Settings & Rules"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
