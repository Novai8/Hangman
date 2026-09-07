import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { WordLibsSoloPrompt, WordLibsSoloMode } from '../../../types/wordLibsSolo';
import { sound } from '../../../utils/audio';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  HelpCircle,
  Tag
} from 'lucide-react';

interface WordLibsSoloAnswerViewProps {
  mode: WordLibsSoloMode;
  topic: string;
  difficulty: string;
  prompts: WordLibsSoloPrompt[];
  currentPromptIndex: number;
  answers: Record<string, string>;
  timeRemaining?: number;
  onSubmitAnswer: (answer: string) => void;
  onForfeit?: () => void;
}

export const WordLibsSoloAnswerView: React.FC<WordLibsSoloAnswerViewProps> = ({
  mode,
  topic,
  difficulty,
  prompts,
  currentPromptIndex,
  answers,
  timeRemaining,
  onSubmitAnswer
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPrompt = prompts[currentPromptIndex];
  const progressPercent = Math.round(((currentPromptIndex) / prompts.length) * 100);

  // Auto focus input on each new prompt
  useEffect(() => {
    setCurrentInput('');
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentPromptIndex]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = currentInput.trim();
    if (!trimmed) {
      setValidationError('Please type an answer before continuing.');
      sound.wrong();
      return;
    }

    if (trimmed.length > 50) {
      setValidationError('Answer is too long (max 50 characters). Keep it snappy!');
      sound.wrong();
      return;
    }

    setValidationError(null);
    sound.pop();
    onSubmitAnswer(trimmed);
  };

  if (!currentPrompt) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col justify-center min-h-[70vh]">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
            {topic}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono capitalize">
            {mode.replace('_', ' ')}
          </span>
        </div>

        {/* Speed Mode Timer */}
        {mode === 'speed' && timeRemaining !== undefined && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono text-xs font-black transition-colors ${
              timeRemaining <= 15
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemaining}s LEFT</span>
          </div>
        )}
      </div>

      {/* Progress Bar & Counter */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-slate-400">
            PROMPT <span className="text-white font-bold">{currentPromptIndex + 1}</span> OF{' '}
            <span className="text-white font-bold">{prompts.length}</span>
          </span>
          <span className="text-amber-400 font-bold">{progressPercent}% COMPLETED</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Prompt Card */}
      <motion.div
        key={currentPrompt.id}
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Expected Type Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 font-mono text-xs font-bold mb-4">
          <Tag className="w-3 h-3" />
          <span>TYPE: {currentPrompt.inputType}</span>
        </div>

        {/* Prompt Question */}
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-6">
          {currentPrompt.promptText}
        </h3>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              id="solo-prompt-answer-input"
              type="text"
              value={currentInput}
              maxLength={50}
              onChange={(e) => {
                setCurrentInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={currentPrompt.placeholder || 'Type your funniest answer...'}
              className="w-full px-5 py-4 rounded-2xl bg-slate-950 border-2 border-slate-800 focus:border-amber-500 text-white placeholder-slate-500 text-base sm:text-lg font-medium outline-none transition-all pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
              {currentInput.length}/50
            </span>
          </div>

          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs font-mono text-rose-400"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{validationError}</span>
            </motion.div>
          )}

          <button
            id="solo-submit-prompt-btn"
            type="submit"
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all"
          >
            <span>{currentPromptIndex === prompts.length - 1 ? 'Reveal Story' : 'Next Prompt'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>

      {/* Answer History Preview */}
      {currentPromptIndex > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-900">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
            Completed Prompts ({currentPromptIndex}):
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {prompts.slice(0, currentPromptIndex).map((p, idx) => (
              <span
                key={p.id}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-500">{p.inputType}:</span>
                <span className="text-amber-300 font-semibold truncate max-w-[120px]">
                  {answers[p.key] || '—'}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
