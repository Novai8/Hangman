import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, RotateCcw, Layers } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  word: string;
  score: number;
  bestScore: number;
  onPlayAgain: () => void;
  onChangeCategory: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  word,
  score,
  bestScore,
  onPlayAgain,
  onChangeCategory
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0f]/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-sm p-6 rounded-3xl bg-[#131623]/95 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Top ambient red glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 p-[2px] shadow-[0_0_25px_rgba(244,63,94,0.4)] mb-4 flex items-center justify-center">
            <Skull className="w-8 h-8 text-rose-400" />
          </div>

          <span className="text-xs font-['Space_Mono'] font-bold text-rose-400 tracking-widest uppercase mb-1">
            ROPE HAS RUN OUT
          </span>

          <h2 className="font-['Sora'] text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-300 to-rose-500 mb-3">
            GAME OVER
          </h2>

          <p className="text-xs text-slate-400 mb-1 font-['Plus_Jakarta_Sans']">
            The secret word was:
          </p>

          <div className="px-4 py-2.5 rounded-xl bg-[#0a0d16] border border-rose-500/30 text-xl font-['Space_Mono'] font-bold text-rose-400 tracking-widest mb-4 shadow-inner">
            {word}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 w-full mb-5 text-center font-['Space_Mono']">
            <div className="flex flex-col p-2 rounded-xl bg-[#161a29] border border-white/6">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Score</span>
              <span className="text-sm font-bold text-[#00f0ff]">{score.toLocaleString()}</span>
            </div>
            <div className="flex flex-col p-2 rounded-xl bg-[#161a29] border border-white/6">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Best</span>
              <span className="text-sm font-bold text-[#fbabff]">{bestScore.toLocaleString()}</span>
            </div>
            <div className="flex flex-col p-2 rounded-xl bg-[#161a29] border border-white/6">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Streak</span>
              <span className="text-sm font-bold text-slate-400">0</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <button
              id="btn-gameover-playagain"
              onClick={onPlayAgain}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-['Space_Mono'] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:opacity-95 active:scale-98 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              id="btn-gameover-changecat"
              onClick={onChangeCategory}
              className="w-full py-2.5 rounded-xl bg-[#181d2e] hover:bg-[#20273d] text-slate-300 font-['Space_Mono'] font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>CHANGE CATEGORY</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
