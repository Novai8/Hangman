import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface KeyboardProps {
  word: string;
  guessedLetters: Set<string>;
  onGuess: (letter: string) => void;
  disabled: boolean;
  mistakes: number;
  maxMistakes: number;
}

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const Keyboard: React.FC<KeyboardProps> = ({
  word,
  guessedLetters,
  onGuess,
  disabled
}) => {
  return (
    <div className="w-full mt-4 sm:mt-6 space-y-2">
      {KEY_ROWS.map((row, rowIdx) => {
        // Stagger offsets matching design (row 0: ml-0, row 1: ml-2 sm:ml-4, row 2: ml-4 sm:ml-8)
        const rowMargin = rowIdx === 1 ? 'ml-2 sm:ml-4' : rowIdx === 2 ? 'ml-4 sm:ml-8' : '';

        return (
          <div key={rowIdx} className={`flex gap-1.5 sm:gap-2 justify-start ${rowMargin}`}>
            {row.map((letter) => {
              const hasBeenGuessed = guessedLetters.has(letter);
              const isCorrect = hasBeenGuessed && word.includes(letter);
              const isWrong = hasBeenGuessed && !word.includes(letter);

              let keyStyle =
                'bg-white/5 border border-white/10 text-slate-300 shadow-sm hover:bg-white/10 hover:border-white/20 active:scale-95';

              if (isCorrect) {
                keyStyle =
                  'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)] font-bold cursor-not-allowed';
              } else if (isWrong) {
                keyStyle =
                  'bg-red-500/20 border border-red-500/50 text-red-500 font-bold opacity-50 cursor-not-allowed';
              }

              return (
                <motion.button
                  key={letter}
                  id={`key-${letter}`}
                  whileHover={!disabled && !hasBeenGuessed ? { y: -2, scale: 1.06 } : {}}
                  whileTap={!disabled && !hasBeenGuessed ? { scale: 0.92 } : {}}
                  onClick={() => onGuess(letter)}
                  disabled={disabled || hasBeenGuessed}
                  className={`w-8 sm:w-11 md:w-12 h-11 sm:h-14 rounded-xl flex items-center justify-center font-bold text-xs sm:text-base select-none transition-all duration-150 ${keyStyle}`}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
