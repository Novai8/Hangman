import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, ArrowRight, Play, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  word: string;
  pointsEarned: number;
  streak: number;
  isEndless: boolean;
  onNextWord: () => void;
  onKeepPlaying: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  word,
  pointsEarned,
  streak,
  isEndless,
  onNextWord,
  onKeepPlaying
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire stylish cyber confetti with cyan & magenta tones
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#fbabff', '#ffffff', '#8b5cf6', '#10b981']
        });
      } catch {
        // Fallback silently if confetti encounters issue
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0f]/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-sm p-6 rounded-3xl bg-[#121624]/95 border border-[#00f0ff]/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Top ambient glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#00f0ff]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f0ff] to-[#d946ef] p-[2px] shadow-[0_0_25px_rgba(0,240,255,0.5)] mb-4">
            <div className="w-full h-full bg-[#0c101a] rounded-[14px] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-[#00f0ff]" />
            </div>
          </div>

          <span className="text-xs font-['Space_Mono'] font-bold text-[#00f0ff] tracking-widest uppercase mb-1">
            CIPHER OVERRIDDEN
          </span>

          <h2 className="font-['Sora'] text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f0ff] to-[#fbabff] mb-3">
            YOU GOT IT!
          </h2>

          <p className="text-xs text-slate-400 mb-1 font-['Plus_Jakarta_Sans']">
            Decrypted word:
          </p>

          <div className="px-4 py-2.5 rounded-xl bg-[#090c15] border border-white/10 text-xl font-['Space_Mono'] font-bold text-[#00f0ff] tracking-widest mb-4 shadow-inner">
            {word}
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
            <div className="flex flex-col p-2.5 rounded-xl bg-[#161a29] border border-white/6">
              <span className="text-[10px] font-['Space_Mono'] text-slate-400 font-bold uppercase">
                Score Gain
              </span>
              <span className="text-base font-['Space_Mono'] font-bold text-[#00f0ff]">
                +{pointsEarned} PTS
              </span>
            </div>

            <div className="flex flex-col p-2.5 rounded-xl bg-[#161a29] border border-white/6">
              <span className="text-[10px] font-['Space_Mono'] text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
                Streak <Flame className="w-3 h-3 text-amber-400" />
              </span>
              <span className="text-base font-['Space_Mono'] font-bold text-[#fbabff]">
                🔥 {streak}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <button
              id="btn-victory-next"
              onClick={onNextWord}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#00c2ff] text-[#090a0f] font-['Space_Mono'] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:opacity-95 active:scale-98 transition-all"
            >
              <span>NEXT WORD</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-victory-keep-playing"
              onClick={onKeepPlaying}
              className="w-full py-2.5 rounded-xl bg-[#181d2e] hover:bg-[#20273d] text-slate-300 font-['Space_Mono'] font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
            >
              <Play className="w-3.5 h-3.5 text-[#fbabff]" />
              <span>{isEndless ? 'CONTINUE ENDLESS RUN' : 'KEEP PLAYING'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
