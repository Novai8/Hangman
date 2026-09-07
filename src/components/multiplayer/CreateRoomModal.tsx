import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Clock, ShieldAlert, Users, Layers, Award } from 'lucide-react';
import { Category, Difficulty, MultiplayerGameMode, RoomSettings, RoundLimit } from '../../types';
import { sound } from '../../utils/audio';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (settings: RoomSettings) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [mode, setMode] = useState<MultiplayerGameMode>('classic');
  const [category, setCategory] = useState<Category>('Technology');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [roundLimit, setRoundLimit] = useState<RoundLimit>(5);

  if (!isOpen) return null;

  const categories: Category[] = ['Technology', 'Animals', 'Movies', 'Countries', 'Food', 'Sports', 'Random'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const roundOptions: RoundLimit[] = [3, 5, 10, 'unlimited'];

  const handleCreate = () => {
    sound.win();
    onCreate({
      mode,
      category,
      difficulty,
      maxPlayers,
      roundLimit,
      turnDuration: mode === 'timed' ? 10 : 15
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-[#0f111a] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              CREATE ROOM
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Host a private real-time party match
            </p>
          </div>
          <button
            onClick={() => {
              sound.keyTap();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5">
          {/* 1. Game Mode */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.keyTap();
                  setMode('classic');
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  mode === 'classic'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Classic</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">Turn-based party guessing</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.keyTap();
                  setMode('timed');
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  mode === 'timed'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>Timed</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">Fast 10s blitz countdowns</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.keyTap();
                  setMode('survival');
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  mode === 'survival'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Survival</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">3 lives ❤️, last player standing</p>
              </button>
            </div>
          </div>

          {/* 2. Category */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setCategory(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Difficulty */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setDifficulty(diff);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    difficulty === diff
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Players Slider (2–8) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Max Players</span>
              </label>
              <span className="text-sm font-mono font-black text-cyan-400">
                {maxPlayers} PLAYERS
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
              <span>2 Players</span>
              <span>4 Players</span>
              <span>6 Players</span>
              <span>8 Players</span>
            </div>
          </div>

          {/* 5. Round Limit */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
              Round Limit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {roundOptions.map((opt) => (
                <button
                  key={String(opt)}
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setRoundLimit(opt);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    roundLimit === opt
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt === 'unlimited' ? 'Unlimited' : `${opt} Rounds`}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-create-room-submit"
            type="button"
            onClick={handleCreate}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-black text-sm sm:text-base tracking-widest uppercase shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>CREATE ROOM</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
