import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Lightbulb } from 'lucide-react';
import { Category } from '../types';

interface WordDisplayProps {
  word: string;
  guessedLetters: Set<string>;
  category: Category;
  streak: number;
  isGameOver: boolean;
  activeHintText?: string | null;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  guessedLetters,
  category,
  streak,
  isGameOver,
  activeHintText
}) => {
  const letters = word.split('');
  const multiplier = Math.min(3.0, 1.0 + streak * 0.2).toFixed(1);

  return (
    <div className="flex flex-col justify-center w-full">
      {/* Category header & Multiplier row */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] text-cyan-400 font-bold uppercase">
          CATEGORY: {category}
        </p>

        {/* Streak Multiplier Badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-purple-400 shadow-sm">
          <Zap className="w-3 h-3 text-purple-400" />
          <span className="font-bold">{multiplier}x PTS</span>
        </div>
      </div>

      {/* Target Word Letter Slots */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2">
        {letters.map((char, index) => {
          const isGuessed = guessedLetters.has(char);
          const isSpace = char === ' ';

          if (isSpace) {
            return <div key={index} className="w-3 sm:w-5" />;
          }

          const isRevealed = isGuessed || isGameOver;

          return (
            <div
              key={`${char}-${index}`}
              className={`w-10 sm:w-14 md:w-16 h-14 sm:h-18 md:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-black shadow-lg transition-all duration-200 select-none ${
                isGameOver && !isGuessed
                  ? 'bg-rose-500/10 border-b-4 border-rose-500/60 text-rose-400'
                  : isGuessed
                  ? 'bg-white/5 border-b-4 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'bg-white/5 border-b-4 border-white/20 text-white/10'
              }`}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.span
                    key={isGuessed ? 'revealed' : 'gameover'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  >
                    {char}
                  </motion.span>
                ) : (
                  <span className="text-white/15">_</span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Word Length Telemetry Label */}
      <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-widest">
        Word Length: {word.replace(/ /g, '').length} Letters
      </p>

      {/* Active Hint Clue Banner */}
      {activeHintText && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 shrink-0 text-purple-400" />
          <span className="truncate"><strong>Clue:</strong> {activeHintText}</span>
        </motion.div>
      )}
    </div>
  );
};
