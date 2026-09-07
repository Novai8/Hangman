import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Room } from '../../types';
import { Users, Crown, Check, Clock, Copy, Share2, Play, LogOut, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

interface LobbyViewProps {
  room: Room;
  localPlayer: Player;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onOpenInvite: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  localPlayer,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  onOpenInvite
}) => {
  const [copied, setCopied] = useState(false);

  const readyCount = room.players.filter((p) => p.isReady).length;
  const canStart = (room.players.length === 1 && localPlayer.isReady) || (room.players.length >= 2 && readyCount >= 2);
  const isHost = localPlayer.isHost;

  const handleCopyCode = async () => {
    sound.keyTap();
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: Player['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      case 'reconnecting':
        return 'bg-amber-400 animate-pulse';
      case 'disconnected':
        return 'bg-rose-500';
    }
  };

  const getStatusText = (status: Player['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6 relative z-20">
      {/* Top Lobby Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 sm:p-6 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-tight">
              GAME LOBBY
            </h1>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{room.players.length} / {room.settings.maxPlayers} PLAYERS</span>
            </span>
          </div>

          {/* Room Settings Summary Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-purple-300 capitalize">
              Mode: {room.settings.mode}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-cyan-300">
              {room.settings.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-300 uppercase">
              {room.settings.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              {room.settings.roundLimit === 'unlimited' ? 'Unlimited Rounds' : `${room.settings.roundLimit} Rounds`}
            </span>
          </div>
        </div>

        {/* Room Code & Invite Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-end">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono font-bold">ROOM CODE:</span>
            <span className="text-base sm:text-lg font-mono font-black text-cyan-400 tracking-widest">
              {room.code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            title="Copy Room Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          <button
            onClick={() => {
              sound.keyTap();
              onOpenInvite();
            }}
            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SHARE ROOM</span>
          </button>

          <button
            onClick={() => {
              sound.keyTap();
              onLeaveRoom();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400 transition-all"
            title="Leave Lobby"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Grid (2–8 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {room.players.map((player) => {
          const isPlayerHost = player.id === room.hostId || player.isHost;
          const isLocal = player.id === localPlayer.id;

          return (
            <motion.div
              key={player.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-5 rounded-[28px] border backdrop-blur-md relative overflow-hidden transition-all flex flex-col justify-between min-h-[160px] shadow-lg ${
                player.isReady
                  ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'bg-white/5 border-white/10'
              } ${isLocal ? 'ring-2 ring-cyan-400/40' : ''}`}
            >
              {/* Top status badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(player.connectionStatus)}`} />
                  <span className="text-[10px] font-mono text-slate-400">
                    {getStatusText(player.connectionStatus)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isPlayerHost && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-black text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>HOST</span>
                    </span>
                  )}
                  {isLocal && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-400">
                      YOU
                    </span>
                  )}
                </div>
              </div>

              {/* Player Avatar & Name */}
              <div className="flex items-center gap-3 my-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/15"
                  style={{ backgroundColor: `${player.color}20` }}
                >
                  {player.avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-base text-white truncate max-w-[130px]">
                    {player.name}
                  </p>
                  <p className="text-xs font-mono text-slate-400">
                    {player.score.toLocaleString()} PTS
                  </p>
                </div>
              </div>

              {/* Ready Status Banner */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Status:</span>
                {player.isReady ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400/80">
                    <Clock className="w-3.5 h-3.5 text-amber-400/80 animate-spin" />
                    <span>Waiting...</span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Empty Slots */}
        {Array.from({ length: Math.max(0, room.settings.maxPlayers - room.players.length) }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            onClick={() => {
              sound.keyTap();
              onOpenInvite();
            }}
            className="p-5 rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all mb-2">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-slate-400 group-hover:text-cyan-300 font-bold">
              + INVITE FRIEND
            </p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">Slot Available</p>
          </div>
        ))}
      </div>

      {/* Lobby Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[28px] bg-black/40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Toggle Ready Button */}
          <button
            id="btn-lobby-toggle-ready"
            onClick={() => {
              sound.keyTap();
              onToggleReady();
            }}
            className={`flex-1 sm:flex-initial px-6 sm:px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              localPlayer.isReady
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-white/10 text-white hover:bg-white/15 border border-white/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{localPlayer.isReady ? 'READY ✓' : 'SET READY'}</span>
          </button>

          <p className="text-xs font-mono text-slate-400 hidden md:block">
            {readyCount} of {room.players.length} players ready
          </p>
        </div>

        {/* Host Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isHost ? (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
              {!canStart && (
                <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{room.players.length >= 2 ? 'Need at least 2 ready players' : 'Ready up to start game'}</span>
                </span>
              )}
              <button
                id="btn-lobby-start-game"
                disabled={!canStart}
                onClick={() => {
                  sound.win();
                  onStartGame();
                }}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-base tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                  canStart
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.7)] active:scale-95 cursor-pointer'
                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START GAME</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Waiting for Host to start match...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
