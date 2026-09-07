import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WordLibsPlayer, WordLibsRoom, WordLibsSettings } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import {
  Copy,
  Check,
  Crown,
  Play,
  LogOut,
  Users,
  BookOpen,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  Hourglass,
  Settings
} from 'lucide-react';

interface WordLibsLobbyViewProps {
  room: WordLibsRoom;
  localPlayerId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isStarting: boolean;
  onUpdateSettings?: (settings: Partial<WordLibsSettings>) => void;
}

export const WordLibsLobbyView: React.FC<WordLibsLobbyViewProps> = ({
  room,
  localPlayerId,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  isStarting,
  onUpdateSettings
}) => {
  const [copied, setCopied] = useState(false);

  const isHost = room.hostId === localPlayerId;
  const localPlayer = room.players.find((p) => p.id === localPlayerId);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    sound.pop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const connectedPlayers = room.players.filter((p) => p.connectionStatus === 'connected');
  const allReady = connectedPlayers.length > 0 && connectedPlayers.every((p) => p.isReady || p.isHost);

  const timerLabel =
    room.settings.timerDuration === 0
      ? '∞ Unlimited'
      : room.settings.timerDuration >= 60
      ? `${room.settings.timerDuration / 60}m Timer`
      : `${room.settings.timerDuration}s Timer`;

  const TIMER_OPTIONS = [
    { val: 15, label: '15s' },
    { val: 30, label: '30s' },
    { val: 45, label: '45s' },
    { val: 60, label: '60s' },
    { val: 90, label: '90s' },
    { val: 120, label: '2m' },
    { val: 300, label: '5m' },
    { val: 600, label: '10m' },
    { val: 0, label: '∞ Unlimited' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Lobby Header Card */}
      <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-amber-950/20 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WORD LIBS PARTY LOBBY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {room.settings.topic === 'Random' ? '🎲 Random Chaos' : `${room.settings.topic} Topic`}
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Mode: <strong className="text-amber-400 capitalize">{room.settings.mode.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>{room.totalRounds} Rounds</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                {timerLabel}
              </span>
            </p>
          </div>

          {/* Room Code Badge */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2 px-4">
            <div>
              <div className="text-[10px] font-mono text-slate-400 tracking-wider">ROOM CODE</div>
              <div className="text-2xl font-black tracking-widest font-mono text-amber-400">
                {room.code}
              </div>
            </div>
            <button
              id="copy-wordlibs-room-code-btn"
              onClick={handleCopyCode}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Host Settings Bar (Timer Selection in Lobby) */}
        {isHost && onUpdateSettings && (
          <div className="py-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Host Answer Timer Setting:</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {room.settings.timerDuration === 0
                  ? 'Unlimited: wait for all players to lock in answers'
                  : `Players have ${room.settings.timerDuration >= 60 ? `${room.settings.timerDuration / 60}m` : `${room.settings.timerDuration}s`} to answer`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {TIMER_OPTIONS.map((t) => {
                const isSelected = room.settings.timerDuration === t.val;
                return (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => {
                      sound.keyTap();
                      onUpdateSettings({ timerDuration: t.val });
                    }}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Players List Grid */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Players in Lobby ({connectedPlayers.length}/{room.settings.maxPlayers})</span>
            </h3>
            {copied && (
              <span className="text-xs font-mono text-emerald-400 animate-pulse">
                ✓ Code copied to clipboard! Share with friends
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {room.players.map((p) => {
              const isLocal = p.id === localPlayerId;
              const isDisconnected = p.connectionStatus === 'disconnected';

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isLocal
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800'
                  } ${isDisconnected ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border"
                      style={{
                        backgroundColor: `${p.color}20`,
                        borderColor: p.color
                      }}
                    >
                      {p.avatar || '✍️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <span>{p.name}</span>
                        {isLocal && (
                          <span className="text-[10px] font-mono text-amber-400 font-normal">
                            (YOU)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        {p.isHost ? (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <Crown className="w-3 h-3" /> Host
                          </span>
                        ) : p.isReady ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Hourglass className="w-3 h-3" /> Waiting...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ready Indicator Dot */}
                  <div
                    className={`w-3 h-3 rounded-full ${
                      p.isHost || p.isReady ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-700'
                    }`}
                  />
                </div>
              );
            })}

            {/* Empty slots placeholders */}
            {Array.from({ length: Math.max(0, room.settings.maxPlayers - room.players.length) }).map(
              (_, i) => (
                <div
                  key={`empty_${i}`}
                  className="p-4 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 font-mono text-xs"
                >
                  Open Slot (Waiting)
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Lobby Controls */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3">
        <button
          id="wordlibs-leave-lobby-btn"
          onClick={onLeaveRoom}
          className="flex-1 py-3.5 px-6 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        {!isHost && (
          <button
            id="wordlibs-ready-btn"
            onClick={() => {
              sound.pop();
              onToggleReady();
            }}
            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              localPlayer?.isReady
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{localPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}</span>
          </button>
        )}

        {isHost && (
          <button
            id="wordlibs-start-game-btn"
            onClick={() => {
              sound.fanfare();
              onStartGame();
            }}
            disabled={isStarting || connectedPlayers.length === 0}
            className="flex-1 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{isStarting ? 'Starting Match...' : 'Start Game'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
