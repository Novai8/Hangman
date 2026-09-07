import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, AlertCircle, Shield, Check } from 'lucide-react';
import { AVATAR_OPTIONS } from '../utils/userProfile';
import { sound } from '../utils/audio';

interface WelcomeOverlayProps {
  isOpen: boolean;
  initialAvatar?: string;
  onComplete: (name: string, avatar: string) => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({
  isOpen,
  initialAvatar = '🎮',
  onComplete
}) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateName = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Please enter your codename.';
    }
    if (trimmed.length < 2) {
      return 'Codename must be at least 2 characters.';
    }
    if (trimmed.length > 15) {
      return 'Codename cannot exceed 15 characters.';
    }
    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (error) {
      const err = validateName(val);
      setError(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateName(name);

    if (validationError) {
      setError(validationError);
      sound.wrong();
      return;
    }

    setIsSubmitting(true);
    sound.win();
    onComplete(name.trim(), selectedAvatar);
  };

  const handleAvatarSelect = (avatar: string) => {
    sound.keyTap();
    setSelectedAvatar(avatar);
  };

  const trimmedLength = name.trim().length;
  const isValid = trimmedLength >= 2 && trimmedLength <= 15;

  return (
    <AnimatePresence>
      <div
        id="welcome-overlay-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0f]/90 backdrop-blur-xl selection:bg-[#00f0ff] selection:text-[#00363a]"
      >
        <motion.div
          id="welcome-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-lg p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-[#131726] to-[#0d101a] border border-cyan-500/20 shadow-[0_0_60px_rgba(0,240,255,0.15)] relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-['Space_Mono'] text-xs uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              SYSTEM PROTOCOL INITIALIZED
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="font-['Sora'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to <span className="text-cyan-400">Remix Hangman</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Create your operative profile to jump straight into real-time multiplayer party rooms or challenge solo missions.
            </p>
          </div>

          {/* Avatar Selector Section */}
          <div className="mb-6">
            <label className="block text-xs font-['Space_Mono'] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center sm:text-left">
              Select Operative Avatar
            </label>
            <div
              id="welcome-avatar-grid"
              className="grid grid-cols-6 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/5"
            >
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = selectedAvatar === avatar;
                return (
                  <button
                    key={avatar}
                    id={`welcome-avatar-${avatar}`}
                    type="button"
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all transform active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105'
                        : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                    title={`Select ${avatar}`}
                  >
                    {avatar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="welcome-name-input"
                  className="text-xs font-['Space_Mono'] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Operative Codename
                </label>
                <span
                  className={`text-[11px] font-['Space_Mono'] ${
                    name.length > 15
                      ? 'text-red-400 font-bold'
                      : name.length >= 2
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                >
                  {name.length}/15
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xl">
                  {selectedAvatar}
                </div>
                <input
                  id="welcome-name-input"
                  type="text"
                  autoFocus
                  maxLength={15}
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Enter your player name..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-black/50 border text-white font-medium placeholder-slate-500 text-sm sm:text-base outline-none transition-all ${
                    error
                      ? 'border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                      : 'border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-1.5 text-red-400 text-xs font-['Space_Mono']"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="welcome-submit-btn"
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full mt-2 py-3.5 px-6 rounded-xl font-['Sora'] font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                isValid && !isSubmitting
                  ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] shadow-cyan-500/25 hover:shadow-cyan-400/40 cursor-pointer'
                  : 'bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <span>CONFIRM & ENTER GAME</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security / Persistence reassurance footer */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-['Space_Mono']">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile stored locally in your browser</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
