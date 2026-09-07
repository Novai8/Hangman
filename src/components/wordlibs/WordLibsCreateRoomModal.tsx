import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Flame, Clock, Users, BookOpen, ShieldCheck } from 'lucide-react';
import { WordLibsGameMode, WordLibsSettings, WordLibsTopic } from '../../types/wordLibs';
import { WORD_LIBS_TOPICS } from '../../data/wordLibsData';
import { sound } from '../../utils/audio';

interface WordLibsCreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (settings: WordLibsSettings, isPublic: boolean) => void;
  isLoading: boolean;
}

const MODES: Array<{ mode: WordLibsGameMode; label: string; desc: string; icon: string }> = [
  { mode: 'classic', label: 'Classic Libs', desc: 'Collaborative story creation with party voting', icon: '📖' },
  { mode: 'battle', label: 'Story Battle', desc: 'Each player generates an anonymous competing story', icon: '⚔️' },
  { mode: 'random_chaos', label: 'Random Chaos', desc: 'Unpredictable modifiers like Double Points & Villains', icon: '🌀' },
  { mode: 'speed', label: 'Speed Round', desc: 'Rapid 15s-20s answering frenzy', icon: '⚡' },
  { mode: 'secret', label: 'Secret Bonus', desc: 'Hidden bonus points on surprise prompt categories', icon: '🕵️' },
  { mode: 'one_word', label: 'One Word Only', desc: 'Extreme challenge: all answers must be one word', icon: '🎯' },
  { mode: 'team_chaos', label: 'Team Chaos', desc: 'Collaborative chaos with scrambled answer slots', icon: '🤝' }
];

export const WordLibsCreateRoomModal: React.FC<WordLibsCreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  isLoading
}) => {
  const [mode, setMode] = useState<WordLibsGameMode>('classic');
  const [topic, setTopic] = useState<WordLibsTopic>('Random');
  const [maxPlayers, setMaxPlayers] = useState<number>(6);
  const [rounds, setRounds] = useState<number>(5);
  const [timerDuration, setTimerDuration] = useState<number>(45);
  const [isPublic, setIsPublic] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.pop();
    onCreateRoom(
      {
        mode,
        topic,
        maxPlayers,
        rounds,
        timerDuration
      },
      isPublic
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Create Word Libs Room</h3>
              <p className="text-xs font-mono text-slate-400">CONFIGURE YOUR STORYTELLING LOBBY</p>
            </div>
          </div>
          <button
            id="close-wordlibs-create-modal"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Game Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.mode}
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setMode(m.mode);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === m.mode
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <span>{m.icon}</span>
                    <span className={mode === m.mode ? 'text-amber-400' : 'text-slate-200'}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Select */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Story Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as WordLibsTopic)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 font-medium text-white text-sm outline-none transition-colors"
            >
              {WORD_LIBS_TOPICS.map((top) => (
                <option key={top} value={top}>
                  {top === 'Random' ? '🎲 Random (Any Topic)' : top}
                </option>
              ))}
            </select>
          </div>

          {/* Players & Rounds Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Max Players */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Max Players (2-8)</span>
              </label>
              <div className="flex items-center gap-2">
                {[2, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setMaxPlayers(count)}
                    className={`flex-1 py-2 rounded-lg font-mono text-sm border transition-all ${
                      maxPlayers === count
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Rounds</span>
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 7, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRounds(r)}
                    className={`flex-1 py-2 rounded-lg font-mono text-sm border transition-all ${
                      rounds === r
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timer Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Answer Timer Duration</span>
              </label>
              <span className="text-[11px] font-mono text-amber-400">
                {timerDuration === 0 ? '∞ Unlimited (Wait for all players)' : `${timerDuration >= 60 ? `${timerDuration / 60} min` : `${timerDuration}s`}`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 15, label: '15s' },
                { val: 30, label: '30s' },
                { val: 45, label: '45s' },
                { val: 60, label: '60s' },
                { val: 90, label: '90s' },
                { val: 120, label: '2m' },
                { val: 180, label: '3m' },
                { val: 300, label: '5m' },
                { val: 600, label: '10m' },
                { val: 0, label: '∞ Unlimited' }
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setTimerDuration(t.val);
                  }}
                  className={`py-2 rounded-lg font-mono text-xs border text-center transition-all ${
                    timerDuration === t.val
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {timerDuration === 0
                ? 'Unlimited mode: no automatic transitions. The round moves forward only when everyone submits their answers.'
                : `Players have ${timerDuration >= 60 ? `${timerDuration / 60} minute(s)` : `${timerDuration} seconds`} to fill in their blanks before answers lock in.`}
            </p>
          </div>

          {/* Public Lobby Visibility */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Public Lobby</div>
                <div className="text-[11px] text-slate-400">Allow players in the Game Hub to find and join this room</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isPublic ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow-sm" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-wordlibs-create-btn"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-amber-500/20"
            >
              {isLoading ? 'Creating Room...' : 'Create Chaos Room'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
