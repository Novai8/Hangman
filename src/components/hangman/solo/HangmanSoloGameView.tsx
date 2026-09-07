import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { HangmanSoloGameState } from '../../../types/hangmanSolo';
import { HangmanVisual } from '../../HangmanVisual';
import { sound } from '../../../utils/audio';
import {
  ArrowLeft,
  Flame,
  Zap,
  Timer,
  Heart,
  HelpCircle,
  Trophy,
  RotateCcw
} from 'lucide-react';

interface HangmanSoloGameViewProps {
  gameState: HangmanSoloGameState;
  streak: number;
  onGuessLetter: (letter: string) => void;
  onGiveUp: () => void;
  onRestartCurrentWord: () => void;
  onBackToHome: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const HangmanSoloGameView: React.FC<HangmanSoloGameViewProps> = ({
  gameState,
  streak,
  onGuessLetter,
  onGiveUp,
  onRestartCurrentWord,
  onBackToHome
}) => {
  const [showHint, setShowHint] = React.useState(false);
  const [lastFeedback, setLastFeedback] = React.useState<{ text: string; isPositive: boolean } | null>(null);
  const prevGuessedCountRef = React.useRef(gameState.guessedLetters.size);

  // Provide momentary feedback on guesses
  useEffect(() => {
    if (gameState.guessedLetters.size > prevGuessedCountRef.current) {
      // Find newly guessed letter
      const arr = Array.from(gameState.guessedLetters);
      const latestLetter = arr[arr.length - 1];
      if (latestLetter) {
        const isHit = gameState.word.includes(latestLetter);
        setLastFeedback({
          text: isHit ? `Great pick! "${latestLetter}" is in the word.` : `Oops! "${latestLetter}" is not in the word.`,
          isPositive: isHit
        });
        const timer = setTimeout(() => setLastFeedback(null), 2200);
        return () => clearTimeout(timer);
      }
    }
    prevGuessedCountRef.current = gameState.guessedLetters.size;
  }, [gameState.guessedLetters, gameState.word]);

  // Format timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Keyboard handler for physical keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && gameState.status === 'playing') {
        if (!gameState.guessedLetters.has(key)) {
          onGuessLetter(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, gameState.guessedLetters, onGuessLetter]);

  // Scaled mistakes for HangmanVisual (which expects 0-7)
  const normalizedMistakesForVisual = Math.min(
    7,
    Math.round((gameState.mistakes / gameState.maxMistakes) * 7)
  );

  // Split word into words for display to avoid ugly line wrapping
  const wordTokens = gameState.word.split(' ');

  // Incorrect guessed letters
  const incorrectLetters = Array.from(gameState.guessedLetters).filter(
    (ch) => !gameState.word.includes(ch)
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-4">
        <motion.button
          id="btn-solo-leave-game"
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sound.keyTap();
            onBackToHome();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Game</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {/* Category Chip */}
          <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wide shadow-sm">
            {gameState.resolvedCategory}
          </div>

          {/* Difficulty Chip */}
          <div
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold uppercase border shadow-sm ${
              gameState.difficulty === 'hard'
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                : gameState.difficulty === 'medium'
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {gameState.difficulty}
          </div>
        </div>

        {/* Give up / Restart */}
        <div className="flex items-center gap-1.5">
          <motion.button
            id="btn-solo-restart-word"
            whileHover={{ y: -1, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.keyTap();
              onRestartCurrentWord();
            }}
            title="Try this word again"
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            id="btn-solo-give-up"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.keyTap();
              onGiveUp();
            }}
            className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold transition-all shadow-sm"
          >
            Give up
          </motion.button>
        </div>
      </div>

      {/* Realtime Stats Ribbon */}
      <div className="w-full grid grid-cols-4 gap-2 mb-4">
        {/* Score */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Score</span>
          <span className="text-sm sm:text-base font-black text-cyan-400">
            {gameState.score}
          </span>
        </div>

        {/* Lives / Attempts Left */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block flex items-center justify-center gap-1">
            <Heart className="w-2.5 h-2.5 text-rose-400" />
            Lives left
          </span>
          <span
            className={`text-sm sm:text-base font-black ${
              gameState.remainingAttempts <= 2 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {gameState.remainingAttempts} / {gameState.maxMistakes}
          </span>
        </div>

        {/* Streak */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block flex items-center justify-center gap-1">
            <Flame className="w-2.5 h-2.5 text-amber-400" />
            Streak
          </span>
          <span className="text-sm sm:text-base font-black text-amber-400">
            {streak} {streak === 1 ? 'win' : 'wins'}
          </span>
        </div>

        {/* Timer */}
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center shadow-sm">
          <span className="text-[10px] font-mono text-slate-400 uppercase block flex items-center justify-center gap-1">
            <Timer className="w-2.5 h-2.5 text-violet-400" />
            Time
          </span>
          <span className="text-sm sm:text-base font-mono font-bold text-violet-300">
            {formatTime(gameState.elapsedSeconds)}
          </span>
        </div>
      </div>

      {/* Momentary Guess Feedback Toast */}
      {lastFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className={`w-full py-1.5 px-4 mb-3 rounded-xl border text-xs font-mono font-bold text-center transition-all ${
            lastFeedback.isPositive
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/10'
          }`}
        >
          {lastFeedback.text}
        </motion.div>
      )}

      {/* Main Game Stage */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 mb-5 items-stretch">
        {/* Hangman Rig Graphic */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <HangmanVisual
            mistakes={normalizedMistakesForVisual}
            maxMistakes={7}
            isGameOver={gameState.status === 'lost'}
            isWon={gameState.status === 'won'}
          />
        </div>

        {/* Secret Word & Clues Area */}
        <div className="md:col-span-7 flex flex-col justify-between p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          {/* Category & Hint Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                Category
              </span>
              <span className="text-sm font-black text-white">
                {gameState.resolvedCategory}
              </span>
            </div>

            <motion.button
              id="btn-solo-toggle-hint"
              whileHover={{ y: -1, scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sound.keyTap();
                setShowHint(!showHint);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-colors shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide hint' : 'Need a hint?'}</span>
            </motion.button>
          </div>

          {/* Hint disclosure */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="my-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-mono leading-relaxed"
            >
              💡 <strong>Hint:</strong> {gameState.hint}
            </motion.div>
          )}

          {/* Word Slots Display */}
          <div className="my-6 sm:my-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {wordTokens.map((token, wordIdx) => (
              <div key={wordIdx} className="flex items-center gap-1.5 sm:gap-2">
                {token.split('').map((char, charIdx) => {
                  const isHyphen = char === '-';
                  const isLetter = /^[A-Z]$/.test(char);
                  const isRevealed = !isLetter || gameState.guessedLetters.has(char);

                  return (
                    <motion.div
                      key={charIdx}
                      initial={false}
                      animate={isRevealed && isLetter ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`w-9 h-12 sm:w-11 sm:h-14 rounded-xl flex items-center justify-center font-black text-lg sm:text-2xl transition-all ${
                        isHyphen
                          ? 'border-b-2 border-slate-600 text-slate-400'
                          : isRevealed
                          ? 'bg-cyan-500/10 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                          : 'bg-white/5 border-b-4 border-white/20 text-transparent'
                      }`}
                    >
                      {isHyphen ? '-' : isRevealed ? char : ''}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Incorrect Guesses Tray */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Misses:</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {incorrectLetters.length === 0 ? (
                <span className="text-slate-600">None yet</span>
              ) : (
                incorrectLetters.map((letter) => (
                  <motion.span
                    key={letter}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-6 h-6 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center justify-center font-bold text-xs"
                  >
                    {letter}
                  </motion.span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* On-Screen Virtual Keyboard */}
      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2.5 px-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Pick a letter or use your keyboard
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {gameState.guessedLetters.size} guessed
          </span>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((letter) => {
                const isGuessed = gameState.guessedLetters.has(letter);
                const isInWord = gameState.word.includes(letter);
                const isCorrect = isGuessed && isInWord;
                const isWrong = isGuessed && !isInWord;

                return (
                  <motion.button
                    key={letter}
                    id={`btn-key-${letter}`}
                    whileHover={!isGuessed && gameState.status === 'playing' ? { y: -2, scale: 1.06 } : {}}
                    whileTap={!isGuessed ? { scale: 0.92 } : {}}
                    disabled={isGuessed || gameState.status !== 'playing'}
                    onClick={() => {
                      if (!isGuessed && gameState.status === 'playing') {
                        onGuessLetter(letter);
                      }
                    }}
                    className={`h-10 sm:h-12 rounded-lg font-black text-xs sm:text-sm font-mono transition-all flex items-center justify-center select-none shadow-sm ${
                      row.length === 10
                        ? 'flex-1 max-w-[48px]'
                        : row.length === 9
                        ? 'flex-1 max-w-[52px]'
                        : 'flex-1 max-w-[56px]'
                    } ${
                      isCorrect
                        ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] opacity-80 cursor-not-allowed'
                        : isWrong
                        ? 'bg-rose-950/40 border border-rose-500/20 text-rose-500 line-through opacity-40 cursor-not-allowed'
                        : 'bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-white hover:border-cyan-400/50 hover:text-cyan-300'
                    }`}
                  >
                    {letter}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
