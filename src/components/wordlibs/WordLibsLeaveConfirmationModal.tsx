import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface WordLibsLeaveConfirmationModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const WordLibsLeaveConfirmationModal: React.FC<WordLibsLeaveConfirmationModalProps> = ({
  isOpen,
  onStay,
  onLeave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-white mb-2">Leave Match?</h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Your current game progress, submitted words, and active points will be lost.
        </p>

        <div className="flex gap-3">
          <button
            id="stay-in-match-btn"
            onClick={onStay}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors"
          >
            Stay in Match
          </button>
          <button
            id="confirm-leave-match-btn"
            onClick={onLeave}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-colors shadow-lg shadow-rose-500/25"
          >
            Leave Match
          </button>
        </div>
      </motion.div>
    </div>
  );
};
