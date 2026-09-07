import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Player, Room } from '../../types';
import { Trophy, Crown, RotateCcw, Home, LogOut, Sparkles, Award } from 'lucide-react';
import { sound } from '../../utils/audio';

interface MatchResultsModalProps {
  room: Room;
  localPlayer: Player;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
  onLeaveGame: () => void;
}

export const MatchResultsModal: React.FC<MatchResultsModalProps> = ({
  room,
  localPlayer,
  onPlayAgain,
  onReturnToLobby,
  onLeaveGame
}) => {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isWinner = winner?.id === localPlayer.id;

  useEffect(() => {
    sound.win();
    // Confetti burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#22d3ee', '#ec4899', '#fbbf24']
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#22d3ee']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#22d3ee']
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, []);

  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];
  const rest = sortedPlayers.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[#0f111a] border border-white/15 rounded-[40px] p-6 sm:p-10 shadow-2xl relative text-center my-8 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-purple-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 uppercase">MATCH COMPLETE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-400 to-cyan-400 tracking-tight uppercase">
            🏆 WINNER: {winner?.name.toUpperCase()}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-2">
            {isWinner
              ? 'Incredible performance! You dominated the party match.'
              : `${winner?.name} topped the scoreboard after ${room.currentRound} intense rounds.`}
          </p>

          {/* 3D Podium Display (1st, 2nd, 3rd) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end my-8 pt-4 px-2">
            {/* 2nd Place */}
            {second ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border-2 border-slate-300/40 flex items-center justify-center text-3xl shadow-lg">
                    {second.avatar}
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-300 text-black text-[10px] font-black">
                    🥈 2ND
                  </span>
                </div>
                <p className="font-bold text-xs sm:text-sm text-white truncate max-w-full mt-2">
                  {second.name}
                </p>
                <p className="text-xs font-mono font-bold text-slate-300">
                  {second.score.toLocaleString()} pts
                </p>
                <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-500/20 to-slate-400/5 rounded-t-2xl border-t-2 border-slate-400/30 mt-3" />
              </motion.div>
            ) : (
              <div />
            )}

            {/* 1st Place (Champion) */}
            {first && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <Crown className="w-7 h-7 text-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-600/30 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(251,191,36,0.4)]">
                    {first.avatar}
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-black shadow-md">
                    🥇 1ST
                  </span>
                </div>
                <p className="font-black text-sm sm:text-base text-amber-300 truncate max-w-full mt-2">
                  {first.name}
                </p>
                <p className="text-xs sm:text-sm font-mono font-black text-amber-400">
                  {first.score.toLocaleString()} pts
                </p>
                <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-500/30 to-amber-400/10 rounded-t-2xl border-t-2 border-amber-400/50 mt-3 shadow-[0_0_20px_rgba(251,191,36,0.15)]" />
              </motion.div>
            )}

            {/* 3rd Place */}
            {third ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border-2 border-amber-700/50 flex items-center justify-center text-3xl shadow-lg">
                    {third.avatar}
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-black">
                    🥉 3RD
                  </span>
                </div>
                <p className="font-bold text-xs sm:text-sm text-white truncate max-w-full mt-2">
                  {third.name}
                </p>
                <p className="text-xs font-mono font-bold text-amber-600">
                  {third.score.toLocaleString()} pts
                </p>
                <div className="w-full h-18 sm:h-20 bg-gradient-to-t from-amber-700/20 to-amber-700/5 rounded-t-2xl border-t-2 border-amber-700/30 mt-3" />
              </motion.div>
            ) : (
              <div />
            )}
          </div>

          {/* 4th+ Runners Up */}
          {rest.length > 0 && (
            <div className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
              <p className="text-[10px] font-mono text-slate-400 uppercase font-bold px-2 mb-2">
                Other Contestants
              </p>
              <div className="divide-y divide-white/5">
                {rest.map((player, idx) => (
                  <div key={player.id} className="flex items-center justify-between py-2 px-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-slate-500 w-5">#{idx + 4}</span>
                      <span className="text-base">{player.avatar}</span>
                      <span className="text-xs font-bold text-slate-300">{player.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {player.score.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons (Play Again, Return to Lobby, Leave Game) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              id="btn-play-again"
              onClick={() => {
                sound.keyTap();
                onPlayAgain();
              }}
              className="py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              id="btn-return-lobby"
              onClick={() => {
                sound.keyTap();
                onReturnToLobby();
              }}
              className="py-3.5 px-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>RETURN TO LOBBY</span>
            </button>

            <button
              id="btn-leave-game"
              onClick={() => {
                sound.keyTap();
                onLeaveGame();
              }}
              className="py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>LEAVE GAME</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
