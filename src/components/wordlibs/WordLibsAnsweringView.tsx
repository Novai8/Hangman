import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WordLibsPlayer, WordLibsPrompt, WordLibsRoom } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import { getRandomFunnyWord, FunnyWordCategory } from '../../data/randomFunnyWords';
import {
  Clock,
  CheckCircle2,
  Hourglass,
  Sparkles,
  Flame,
  Send,
  Zap,
  HelpCircle,
  Dices,
  Shuffle
} from 'lucide-react';

interface WordLibsAnsweringViewProps {
  room: WordLibsRoom;
  localPlayerId: string;
  onSubmitAnswers: (answers: Record<string, string>) => void;
  isSubmitting: boolean;
}

export const WordLibsAnsweringView: React.FC<WordLibsAnsweringViewProps> = ({
  room,
  localPlayerId,
  onSubmitAnswers,
  isSubmitting
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const localPlayer = room.players.find((p) => p.id === localPlayerId);
  const hasSubmitted = localPlayer?.hasSubmitted || room.submittedPlayerIds.includes(localPlayerId);

  // Sound ticking when timer is low
  useEffect(() => {
    if (room.timeRemaining <= 5 && room.timeRemaining > 0 && !hasSubmitted) {
      sound.tick();
    }
  }, [room.timeRemaining, hasSubmitted]);

  const handleInputChange = (key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleRandomWordForPrompt = (key: string, category: FunnyWordCategory = 'any') => {
    sound.pop();
    const word = getRandomFunnyWord(category);
    setAnswers((prev) => ({ ...prev, [key]: word }));
  };

  const handleAutoFillRemaining = () => {
    sound.pop();
    setAnswers((prev) => {
      const next = { ...prev };
      room.currentPrompts.forEach((p) => {
        if (!next[p.key] || next[p.key].trim() === '') {
          next[p.key] = getRandomFunnyWord('any');
        }
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.pop();
    onSubmitAnswers(answers);
  };

  const isOneWordMode = room.activeChaosEvent === 'one_word_only' || room.settings.mode === 'one_word';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Round & Chaos Event Header */}
      <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 mb-6 backdrop-blur-md shadow-xl shadow-amber-950/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              ROUND {room.currentRound} OF {room.totalRounds}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs">
              {room.storyTitle}
            </span>
          </div>

          {/* Countdown Timer or Unlimited */}
          {room.settings.timerDuration === 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Unlimited Time</span>
            </div>
          ) : room.timeRemaining > 0 ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
                room.timeRemaining <= 10
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-slate-950 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{room.timeRemaining}s REMAINING</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border bg-slate-950 border-slate-700 text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Time Expired</span>
            </div>
          )}
        </div>

        {/* Chaos Event Notice */}
        {room.activeChaosEvent !== 'none' && (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300 uppercase">
                CHAOS MODIFIER: {room.activeChaosEvent.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-slate-300 text-[11px] hidden sm:inline">
              {room.activeChaosEvent === 'double_points' && 'All vote points are doubled!'}
              {room.activeChaosEvent === 'speed_round' && 'High-speed timer active!'}
              {room.activeChaosEvent === 'one_word_only' && 'Keep answers to single words!'}
              {room.activeChaosEvent === 'secret_bonus' && 'A mystery prompt yields +5 bonus pts!'}
              {room.activeChaosEvent === 'everyone_is_a_villain' && 'Make your words evil and unhinged!'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Main Answering Section */}
      {!hasSubmitted ? (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Fill in the Blanks
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Your words will make a hilarious unexpected story!
              </p>
            </div>

            {/* Quick Auto-Fill Button */}
            <motion.button
              type="button"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAutoFillRemaining}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all shadow-sm"
              title="Auto-fill empty fields with random hilarious words"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Fill Empty Blanks</span>
            </motion.button>
          </div>

          <div className="space-y-3">
            {room.currentPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span>{prompt.inputType.replace(/_/g, ' ')}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Random word pills */}
                    <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleRandomWordForPrompt(prompt.key, 'any')}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1"
                        title="Random word from any funny category"
                      >
                        <Dices className="w-3 h-3" />
                        <span>Random</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRandomWordForPrompt(prompt.key, 'brainrot')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono hover:bg-violet-500/20 text-violet-300 transition-colors"
                        title="Brainrot term (Skibidi, Rizzler, Sigma...)"
                      >
                        🧠 Brainrot
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRandomWordForPrompt(prompt.key, 'absurd')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono hover:bg-rose-500/20 text-rose-300 transition-colors hidden sm:inline-block"
                        title="Absurd hilarious phrase"
                      >
                        🤪 Absurd
                      </button>
                    </div>

                    {isOneWordMode && (
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        1 WORD ONLY
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-200 mb-2.5">
                  {prompt.promptText}
                </p>

                <input
                  id={`prompt-input-${prompt.key}`}
                  type="text"
                  maxLength={isOneWordMode ? 20 : 50}
                  value={answers[prompt.key] || ''}
                  onChange={(e) => handleInputChange(prompt.key, e.target.value)}
                  placeholder={prompt.placeholder || 'Type your funniest answer...'}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all font-medium shadow-inner"
                />
              </div>
            ))}
          </div>

          <motion.button
            id="wordlibs-submit-answers-btn"
            type="submit"
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all mt-6 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Locking in Answers...' : 'Lock In All Answers'}</span>
          </motion.button>
        </form>
      ) : (
        /* Submitted Waiting State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-8 text-center backdrop-blur-md shadow-2xl shadow-emerald-950/20"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            Answers Locked In!
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            Your words are secret. Waiting for the rest of the group to finish so the story can be revealed...
          </p>

          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        </motion.div>
      )}

      {/* Real-time Submissions Tracker */}
      <div className="w-full max-w-xl mt-8 pt-6 border-t border-slate-800">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
          Storyteller Submissions ({room.submittedPlayerIds.length}/{room.players.length})
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {room.players.map((p) => {
            const hasSubmitted = room.submittedPlayerIds.includes(p.id);
            return (
              <div
                key={p.id}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
                  hasSubmitted
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                {hasSubmitted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Hourglass className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
