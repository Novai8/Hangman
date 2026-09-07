import React from 'react';
import { motion } from 'motion/react';
import { HangmanSoloGameState, HangmanSoloStats } from '../../../types/hangmanSolo';
import { sound } from '../../../utils/audio';
import {
  Trophy,
  Skull,
  Flame,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  Sliders,
  Home,
  Timer,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface HangmanSoloResultsViewProps {
  gameState: HangmanSoloGameState;
  stats: HangmanSoloStats;
  onPlayAgain: () => void;
  onChangeCategory: () => void;
  onChangeDifficulty: () => void;
  onBackToHome: () => void;
}

export const HangmanSoloResultsView: React.FC<HangmanSoloResultsViewProps> = ({
  gameState,
  stats,
  onPlayAgain,
  onChangeCategory,
  onChangeDifficulty,
  onBackToHome
}) => {
  const isWon = gameState.status === 'won';
  const breakdown = gameState.scoreBreakdown;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalGuesses = gameState.guessedLetters.size;
  const incorrectGuesses = gameState.mistakes;
  const correctGuesses = Math.max(0, totalGuesses - incorrectGuesses);
  const accuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Banner / Result Headline */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-3xl p-6 sm:p-8 text-center border relative overflow-hidden shadow-2xl ${
          isWon
            ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-500/10'
            : 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-500/10'
        }`}
      >
        {/* Glow backdrop */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none ${
            isWon ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          }`}
        />

        {/* Icon & Title */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${
              isWon
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            }`}
          >
            {isWon ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
          </div>

          <span
            className={`text-xs font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 ${
              isWon
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {isWon ? 'VICTORY ACHIEVED' : 'CYBER SYSTEM BREACHED'}
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isWon ? 'WORD CRACKED!' : 'OUT OF ATTEMPTS'}
          </h1>

          {/* Secret Word Reveal */}
          <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/10 w-full max-w-md">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
              THE SECRET WORD WAS
            </span>
            <span className="text-2xl sm:text-3xl font-black tracking-wider text-cyan-300">
              {gameState.word}
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {gameState.hint}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Match Metrics Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Score</span>
          <span className="text-xl font-black text-cyan-400">{gameState.score} PTS</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase block flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Streak
          </span>
          <span className="text-xl font-black text-amber-400">
            {stats.currentStreak} <span className="text-xs font-normal text-slate-500">(Best {stats.bestStreak})</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase block flex items-center justify-center gap-1">
            <Timer className="w-3 h-3 text-violet-400" /> Time
          </span>
          <span className="text-xl font-mono font-black text-violet-300">
            {formatTime(gameState.elapsedSeconds)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Accuracy</span>
          <span className="text-xl font-black text-emerald-400">{accuracy}%</span>
        </div>
      </div>

      {/* Score Breakdown Card */}
      {breakdown && (
        <div className="w-full rounded-2xl p-4 sm:p-5 bg-slate-900/70 border border-slate-800 mb-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              SCORE CALCULATION
            </span>
            <span className="text-cyan-400">{gameState.difficulty.toUpperCase()} ({breakdown.difficultyMultiplier}x)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs font-mono">
            {isWon ? (
              <>
                <div>
                  <span className="text-slate-500 block">Base Victory</span>
                  <span className="text-slate-200 font-bold">+{breakdown.basePoints} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Letters Solved</span>
                  <span className="text-slate-200 font-bold">+{breakdown.correctLetterPoints} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Remaining Lives</span>
                  <span className="text-slate-200 font-bold">+{breakdown.remainingAttemptsBonus} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Speed Bonus</span>
                  <span className="text-slate-200 font-bold">+{breakdown.speedBonus} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mistake Penalty</span>
                  <span className="text-rose-400 font-bold">-{breakdown.incorrectPenalty} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Streak Bonus</span>
                  <span className="text-amber-300 font-bold">+{breakdown.streakBonus} pts</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-slate-500 block">Partial Letters</span>
                  <span className="text-slate-200 font-bold">+{breakdown.correctLetterPoints} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mistakes Penalty</span>
                  <span className="text-rose-400 font-bold">-{breakdown.incorrectPenalty} pts</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Outcome</span>
                  <span className="text-rose-300 font-bold">Eliminated</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        {/* PLAY AGAIN */}
        <button
          id="btn-solo-play-again"
          onClick={() => {
            sound.pop();
            onPlayAgain();
          }}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>PLAY AGAIN</span>
        </button>

        {/* CHANGE CATEGORY */}
        <button
          id="btn-solo-change-category"
          onClick={() => {
            sound.keyTap();
            onChangeCategory();
          }}
          className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700"
        >
          <Layers className="w-4 h-4" />
          <span>CATEGORY</span>
        </button>

        {/* CHANGE DIFFICULTY */}
        <button
          id="btn-solo-change-difficulty"
          onClick={() => {
            sound.keyTap();
            onChangeDifficulty();
          }}
          className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700"
        >
          <Sliders className="w-4 h-4" />
          <span>DIFFICULTY</span>
        </button>

        {/* HANGMAN HOME */}
        <button
          id="btn-solo-return-home"
          onClick={() => {
            sound.keyTap();
            onBackToHome();
          }}
          className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-800"
        >
          <Home className="w-4 h-4" />
          <span>HOME</span>
        </button>
      </div>
    </div>
  );
};
