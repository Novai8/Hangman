import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  Trash2, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { GameStats } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  fxLevel: 'high' | 'eco';
  onToggleFx: () => void;
  stats: GameStats;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sfxEnabled,
  onToggleSfx,
  fxLevel,
  onToggleFx,
  stats,
  onResetStats
}) => {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0f]/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-[#121623]/95 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00f0ff]" />
              <h2 className="font-['Sora'] text-lg font-bold text-white">
                SETTINGS & GUIDE
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#1a1f30] hover:bg-[#252c44] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preferences Row */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-['Space_Mono'] font-bold text-slate-400 uppercase tracking-wider">
              System Preferences
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* SFX Toggle */}
              <button
                id="btn-toggle-sfx"
                onClick={onToggleSfx}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  sfxEnabled
                    ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-white'
                    : 'bg-[#161a29] border-white/6 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-['Space_Mono'] font-bold">
                  {sfxEnabled ? <Volume2 className="w-4 h-4 text-[#00f0ff]" /> : <VolumeX className="w-4 h-4" />}
                  <span>SFX: {sfxEnabled ? 'ON' : 'OFF'}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${sfxEnabled ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-slate-600'}`} />
              </button>

              {/* FX Particles Toggle */}
              <button
                id="btn-toggle-fx"
                onClick={onToggleFx}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  fxLevel === 'high'
                    ? 'bg-[#fbabff]/10 border-[#fbabff]/40 text-white'
                    : 'bg-[#161a29] border-white/6 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-['Space_Mono'] font-bold">
                  <Sparkles className={`w-4 h-4 ${fxLevel === 'high' ? 'text-[#fbabff]' : ''}`} />
                  <span>FX: {fxLevel.toUpperCase()}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${fxLevel === 'high' ? 'bg-[#fbabff] shadow-[0_0_8px_#fbabff]' : 'bg-slate-600'}`} />
              </button>
            </div>
          </div>

          {/* Player Statistics */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-['Space_Mono'] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#00f0ff]" />
              Career Telemetry
            </span>
            <div className="grid grid-cols-4 gap-2 text-center font-['Space_Mono']">
              <div className="p-2.5 rounded-xl bg-[#0e121d] border border-white/6 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Played</span>
                <span className="text-sm font-bold text-white">{stats.gamesPlayed}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e121d] border border-white/6 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Won</span>
                <span className="text-sm font-bold text-emerald-400">{stats.gamesWon}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e121d] border border-white/6 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Win Rate</span>
                <span className="text-sm font-bold text-[#00f0ff]">{winRate}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e121d] border border-white/6 flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Best 🔥</span>
                <span className="text-sm font-bold text-[#fbabff]">{stats.bestStreak}</span>
              </div>
            </div>
          </div>

          {/* Game Rules Recap */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-['Space_Mono'] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#fbabff]" />
              How to Play & Scoring
            </span>
            <div className="p-3.5 rounded-2xl bg-[#0b0e17] border border-white/6 text-xs text-slate-300 font-['Plus_Jakarta_Sans'] flex flex-col gap-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                <span><strong>Correct Letter:</strong> +10 points. Complete word gives +50 bonus + streak multipliers!</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Wrong Guess:</strong> -5 points and constructs 1 of 7 cyber gallows parts.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Hint:</strong> Reveals 1 unrevealed letter at a cost of -20 points.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#fbabff] shrink-0 mt-0.5" />
                <span><strong>Modes:</strong> Classic (7 mistakes), Timed (60s speed challenge), Endless (continuous progression).</span>
              </div>
            </div>
          </div>

          {/* Reset Career Stats Button */}
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <button
              onClick={onResetStats}
              className="text-xs font-['Space_Mono'] text-rose-400/80 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Career Records</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#00f0ff] text-[#090a0f] text-xs font-['Space_Mono'] font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)] active:scale-95 transition-all"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
