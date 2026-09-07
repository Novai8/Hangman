import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityEvent, FloatingReaction, Player, ReactionEmoji, Room } from '../../types';
import { HangmanVisual } from '../HangmanVisual';
import { WordDisplay } from '../WordDisplay';
import { Keyboard } from '../Keyboard';
import {
  Users,
  Clock,
  Crown,
  Heart,
  Eye,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Radio,
  Share2,
  ShieldAlert,
  Send
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface MultiplayerGameViewProps {
  room: Room;
  localPlayer: Player;
  onGuessLetter: (letter: string) => void;
  onSendReaction: (emoji: ReactionEmoji) => void;
  reactions: FloatingReaction[];
  activityFeed: ActivityEvent[];
  lastGuessFeedback: { text: string; isCorrect: boolean } | null;
  onOpenInvite: () => void;
}

const REACTION_LIST: ReactionEmoji[] = ['🔥', '😂', '😱', '👏', '💀', 'GG'];

export const MultiplayerGameView: React.FC<MultiplayerGameViewProps> = ({
  room,
  localPlayer,
  onGuessLetter,
  onSendReaction,
  reactions,
  activityFeed,
  lastGuessFeedback,
  onOpenInvite
}) => {
  const [mobileTab, setMobileTab] = useState<'game' | 'scoreboard'>('game');
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Active player in the current turn
  const activePlayer = room.players[room.activePlayerIndex] || room.players[0];
  const isMyTurn = activePlayer?.id === localPlayer.id && !localPlayer.isEliminated;

  // Turn countdown percentage
  const maxTurnTime = room.settings.turnDuration || 15;
  const timeRemaining = room.turnTimeRemaining;
  const timeProgress = Math.max(0, (timeRemaining / maxTurnTime) * 100);

  // Surviving players
  const alivePlayers = room.players.filter((p) => !p.isEliminated);
  const isSurvival = room.settings.mode === 'survival';

  // Sort players by score for scoreboard
  const sortedScoreboard = [...room.players].sort((a, b) => b.score - a.score);

  // Convert guessedLetters array to Set for WordDisplay and Keyboard
  const guessedSet = new Set<string>(room.guessedLetters);

  // Auto-scroll feed on new items
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityFeed]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex flex-col gap-4 relative z-20">
      {/* Top Multiplayer Match Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-lg">
        {/* Left: Round & Mode details */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>
              ROUND {room.currentRound}
              {room.totalRounds > 0 ? ` / ${room.totalRounds}` : ''}
            </span>
          </div>

          <span className="text-xs font-mono text-slate-400 uppercase hidden sm:inline">
            MODE: <strong className="text-white">{room.settings.mode}</strong>
          </span>

          <span className="text-slate-600 font-mono text-xs hidden sm:inline">•</span>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            ROOM: <strong className="text-cyan-400">{room.code}</strong>
          </span>
        </div>

        {/* Center/Right: Active Turn Indicator Badge */}
        <div className="flex items-center gap-3">
          {/* Circular Countdown Ring */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-300 ${
                    timeRemaining <= 3 ? 'text-rose-500' : 'text-cyan-400'
                  }`}
                  strokeDasharray={`${timeProgress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span
                className={`absolute text-[11px] font-mono font-black ${
                  timeRemaining <= 3 ? 'text-rose-400 animate-ping' : 'text-cyan-300'
                }`}
              >
                {timeRemaining}
              </span>
            </div>

            <div className="text-left leading-none">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">
                {isMyTurn ? 'YOUR TIME' : 'TIME LEFT'}
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  timeRemaining <= 3 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {timeRemaining}s
              </span>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={() => {
              sound.keyTap();
              onOpenInvite();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Invite more players"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Mobile Tab Toggle */}
          <div className="flex md:hidden rounded-xl bg-white/5 p-0.5 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setMobileTab('game')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                mobileTab === 'game' ? 'bg-cyan-500 text-black' : 'text-slate-400'
              }`}
            >
              GAME
            </button>
            <button
              onClick={() => setMobileTab('scoreboard')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                mobileTab === 'scoreboard' ? 'bg-cyan-500 text-black' : 'text-slate-400'
              }`}
            >
              PLAYERS ({room.players.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ==================== COLUMN 1 (4 Cols): HANGMAN ILLUSTRATION & HEALTH ==================== */}
        <div className={`lg:col-span-4 flex flex-col gap-4 ${mobileTab === 'scoreboard' ? 'hidden lg:flex' : 'flex'}`}>
          <HangmanVisual
            mistakes={room.mistakes}
            maxMistakes={7}
            isGameOver={room.mistakes >= 7}
            isWon={false}
          />

          {/* Survival Lives Display (if Survival Mode) */}
          {isSurvival && (
            <div className="p-4 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SURVIVAL LIVES</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {localPlayer.isEliminated ? 'ELIMINATED' : `${localPlayer.lives} REMAINING`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-6 h-6 transition-all duration-300 ${
                      heartIndex <= localPlayer.lives
                        ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] scale-100'
                        : 'text-slate-600 fill-transparent scale-90 opacity-40'
                    }`}
                  />
                ))}
              </div>
              {localPlayer.isEliminated && (
                <div className="mt-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>You are spectating {activePlayer?.name || 'the match'}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Reaction Bar */}
          <div className="p-3.5 rounded-[28px] bg-black/40 border border-white/10 backdrop-blur-md flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold px-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>SEND QUICK REACTION</span>
            </span>
            <div className="flex items-center justify-between gap-1">
              {REACTION_LIST.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    sound.keyTap();
                    onSendReaction(emoji);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-lg transition-all active:scale-90"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== COLUMN 2 (5 Cols): WORD & TACTILE KEYBOARD ==================== */}
        <div
          className={`lg:col-span-5 flex flex-col justify-between p-5 sm:p-7 rounded-[36px] bg-white/5 border backdrop-blur-md shadow-2xl transition-all relative ${
            isMyTurn
              ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_35px_rgba(34,211,238,0.25)]'
              : 'border-white/10'
          } ${mobileTab === 'scoreboard' ? 'hidden lg:flex' : 'flex'}`}
        >
          {/* Turn Banner with Strong Glowing Status */}
          <div className="mb-4">
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                isMyTurn
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border border-white/20 shadow-sm"
                  style={{ backgroundColor: `${activePlayer?.color}30` }}
                >
                  {activePlayer?.avatar}
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    {isMyTurn ? 'YOUR TURN' : `${activePlayer?.name.toUpperCase()}'S TURN`}
                  </p>
                  <p className="text-sm sm:text-base font-black text-white">
                    {isMyTurn ? 'GUESS A LETTER NOW!' : `Waiting for ${activePlayer?.name}...`}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                {isMyTurn ? (
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-400 text-black animate-pulse">
                    ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>WAITING</span>
                  </span>
                )}
              </div>
            </div>

            {/* Real-time Guess Feedback Popup Banner */}
            <AnimatePresence>
              {lastGuessFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`mt-2 py-1.5 px-3 rounded-xl text-center text-xs font-mono font-bold border transition-all ${
                    lastGuessFeedback.isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-glitch-shake'
                  }`}
                >
                  {lastGuessFeedback.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Shared Hidden Word Display */}
          <div className="my-2">
            <WordDisplay
              word={room.currentWord}
              guessedLetters={guessedSet}
              category={room.currentCategory}
              streak={localPlayer.currentStreak}
              isGameOver={room.mistakes >= 7}
              activeHintText={room.currentHint}
            />
          </div>

          {/* Tactile Keyboard (Controlled by Active Player) */}
          <div className="relative mt-4">
            <Keyboard
              word={room.currentWord}
              guessedLetters={guessedSet}
              onGuess={(letter) => {
                if (isMyTurn) {
                  onGuessLetter(letter);
                }
              }}
              disabled={!isMyTurn || room.mistakes >= 7}
            />

            {/* Overlay if not user's turn */}
            {!isMyTurn && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-slate-300 shadow-xl flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Waiting for {activePlayer?.name}'s guess...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== COLUMN 3 (3 Cols): SCOREBOARD & ACTIVITY FEED ==================== */}
        <div
          className={`lg:col-span-3 flex flex-col gap-4 ${
            mobileTab === 'game' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Live Scoreboard */}
          <div className="p-5 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>SCOREBOARD</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {room.players.length} Players
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sortedScoreboard.map((p, idx) => {
                const isCurrentActive = p.id === activePlayer?.id;
                const isLocal = p.id === localPlayer.id;

                let medal = `${idx + 1}.`;
                if (idx === 0) medal = '🥇';
                if (idx === 1) medal = '🥈';
                if (idx === 2) medal = '🥉';

                return (
                  <div
                    key={p.id}
                    className={`relative p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrentActive
                        ? 'bg-purple-600/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/40'
                        : isLocal
                        ? 'bg-white/10 border-white/15'
                        : 'bg-white/5 border-white/5'
                    } ${p.isEliminated ? 'opacity-40 grayscale' : ''}`}
                  >
                    {/* Floating Reaction above player avatar */}
                    {reactions
                      .filter((r) => r.playerId === p.id)
                      .map((r) => (
                        <motion.span
                          key={r.id}
                          initial={{ opacity: 1, y: 0, scale: 0.8 }}
                          animate={{ opacity: 0, y: -35, scale: 1.4 }}
                          transition={{ duration: 1.8, ease: 'easeOut' }}
                          className="absolute -top-3 left-7 text-2xl z-30 pointer-events-none drop-shadow-lg"
                        >
                          {r.emoji}
                        </motion.span>
                      ))}

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center">
                        {medal}
                      </span>
                      <div className="relative">
                        <span className="text-xl">{p.avatar}</span>
                        {/* Connection Dot */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                            p.connectionStatus === 'connected'
                              ? 'bg-emerald-400'
                              : p.connectionStatus === 'reconnecting'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-white truncate max-w-[95px] flex items-center gap-1">
                          <span>{p.name}</span>
                          {isLocal && (
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-400">
                              YOU
                            </span>
                          )}
                        </p>
                        {isSurvival && (
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 3 }).map((_, hIdx) => (
                              <span
                                key={hIdx}
                                className={`text-[10px] ${
                                  hIdx < p.lives ? 'text-rose-500' : 'text-slate-700'
                                }`}
                              >
                                ♥
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {p.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="p-4 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-md shadow-xl flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span>ACTIVITY FEED</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-56 text-xs font-mono">
              {activityFeed.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-4 text-center">
                  Waiting for first letter guess...
                </p>
              ) : (
                activityFeed.slice(-12).map((item) => {
                  const isCorrect = item.isCorrect;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-xl text-[11px] border transition-all ${
                        isCorrect === true
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : isCorrect === false
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : item.type === 'reaction'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                    >
                      {item.text}
                    </motion.div>
                  );
                })
              )}
              <div ref={feedEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
