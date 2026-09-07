import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, LogIn, Clipboard, Users, RefreshCw } from 'lucide-react';
import { sound } from '../../utils/audio';
import { multiplayerClient } from '../../services/multiplayerClient';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  serverError?: string | null;
  isLoading?: boolean;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  serverError,
  isLoading
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [publicRooms, setPublicRooms] = useState<Array<{ code: string; playerCount: number; maxPlayers: number; category: string; mode: string }>>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPublicRooms();
      setError('');
    }
  }, [isOpen]);

  const loadPublicRooms = async () => {
    setLoadingRooms(true);
    const rooms = await multiplayerClient.fetchPublicLobbies();
    setPublicRooms(rooms);
    setLoadingRooms(false);
  };

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      setCode(cleaned);
      setError('');
    } catch {
      // Fallback
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setError('Please enter a valid 6-character room code');
      sound.wrong();
      return;
    }
    sound.win();
    onJoin(cleanCode);
  };

  const displayError = error || serverError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0f111a] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              JOIN ROOM
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Enter the room code shared by your host
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

        <form onSubmit={handleJoin} className="space-y-6 pt-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              ROOM CODE
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  setError('');
                }}
                placeholder="e.g. HX7K92"
                className="w-full bg-white/5 border border-white/15 focus:border-cyan-400 rounded-2xl px-5 py-4 text-center font-mono text-2xl font-black tracking-[0.25em] text-cyan-400 uppercase outline-none transition-all placeholder:text-slate-600 shadow-inner"
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-300 flex items-center gap-1 transition-all"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>PASTE</span>
              </button>
            </div>
            {displayError && (
              <p className="text-xs text-rose-400 mt-2 font-mono bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                {displayError}
              </p>
            )}
          </div>

          {/* Active Public Lobbies Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                ACTIVE PUBLIC LOBBIES:
              </span>
              <button
                type="button"
                onClick={loadPublicRooms}
                className="text-slate-500 hover:text-cyan-400 p-1 rounded-lg transition-colors"
                title="Refresh public rooms"
              >
                <RefreshCw className={`w-3 h-3 ${loadingRooms ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {publicRooms.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {publicRooms.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => {
                      sound.keyTap();
                      setCode(r.code);
                      setError('');
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl border flex items-center justify-between font-mono text-xs transition-all ${
                      code === r.code
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400 tracking-wider">{r.code}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 capitalize">{r.category}</span>
                    </div>
                    <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Users className="w-3 h-3 text-cyan-400" />
                      {r.playerCount}/{r.maxPlayers}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-mono text-slate-500">
                No active public lobbies waiting. Create one or enter a friend's code above!
              </div>
            )}
          </div>

          <button
            id="btn-join-room-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black text-sm sm:text-base tracking-widest uppercase shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>{isLoading ? 'CONNECTING...' : 'ENTER LOBBY'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
