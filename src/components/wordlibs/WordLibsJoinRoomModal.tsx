import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Users, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';

interface WordLibsJoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (code: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const WordLibsJoinRoomModal: React.FC<WordLibsJoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  isLoading,
  error
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    sound.pop();
    onJoinRoom(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Join Word Libs</h3>
              <p className="text-xs font-mono text-slate-400">ENTER 6-DIGIT ROOM CODE</p>
            </div>
          </div>
          <button
            id="close-wordlibs-join-modal"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Room Code
            </label>
            <input
              id="wordlibs-room-code-input"
              type="text"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 font-mono text-center text-xl tracking-widest text-white uppercase placeholder:text-slate-600 outline-none transition-all"
            />
            {error && (
              <p className="mt-2.5 text-xs text-rose-400 font-mono text-center">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-wordlibs-join-btn"
              type="submit"
              disabled={isLoading || code.trim().length < 3}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>{isLoading ? 'Joining...' : 'Enter Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
