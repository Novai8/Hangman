import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Share2, Users, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  currentPlayersCount: number;
  maxPlayers: number;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  currentPlayersCount,
  maxPlayers
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
  const shareText = `Join my live Hangman party game! Room Code: ${roomCode}`;

  const handleCopyCode = async () => {
    sound.keyTap();
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInvite = async () => {
    sound.keyTap();
    await navigator.clipboard.writeText(`${shareText}\n${inviteUrl}`);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleNativeShare = async () => {
    sound.keyTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hangman Multiplayer Party',
          text: shareText,
          url: inviteUrl
        });
      } catch {
        handleCopyInvite();
      }
    } else {
      handleCopyInvite();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0f111a] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative text-center"
      >
        <button
          onClick={() => {
            sound.keyTap();
            onClose();
          }}
          className="absolute right-6 top-6 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-4">
          <Sparkles className="w-6 h-6 text-black" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
          JOIN MY HANGMAN GAME
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1 flex items-center justify-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>PLAYERS: {currentPlayersCount} / {maxPlayers}</span>
        </p>

        {/* Big Room Code Box */}
        <div className="my-6 p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">
            ROOM CODE
          </p>
          <p className="text-3xl sm:text-4xl font-mono font-black text-cyan-400 tracking-[0.2em] my-1">
            {roomCode}
          </p>
          <p className="text-[11px] text-slate-400">Share this code with friends to let them join</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyCode}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
            </button>

            <button
              onClick={handleCopyInvite}
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
              <span>{copiedInvite ? 'COPIED!' : 'COPY INVITE'}</span>
            </button>
          </div>

          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>SHARE ROOM</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
