import React from 'react';
import { motion } from 'motion/react';
import { WordLibsPlayer, WordLibsRoom } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import { Trophy, ArrowRight, Flame, Sparkles, Crown, Laugh } from 'lucide-react';

interface WordLibsRoundResultsViewProps {
  room: WordLibsRoom;
  localPlayerId: string;
  onNextRound: () => void;
  isNextLoading: boolean;
}

export const WordLibsRoundResultsView: React.FC<WordLibsRoundResultsViewProps> = ({
  room,
  localPlayerId,
  onNextRound,
  isNextLoading
}) => {
  const isHost = room.hostId === localPlayerId;
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>ROUND {room.currentRound} OF {room.totalRounds} RECAP</span>
        </div>
        <h2 className="text-3xl font-black text-white">Round Winners & Scores</h2>
      </div>

      {/* Category Winners Announcements */}
      {room.roundWinners && room.roundWinners.length > 0 && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {room.roundWinners.map((w, idx) => (
            <motion.div
              key={`win_${idx}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-violet-500/15 border border-amber-500/30 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  {w.category.replace('_', ' ')}
                </span>
                <div className="text-base font-black text-white">{w.winnerPlayerName}</div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black font-mono text-xs">
                  +{w.points} PTS
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard Standings */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8 backdrop-blur-md shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
          Current Standings
        </h3>
        <div className="space-y-2.5">
          {sortedPlayers.map((p, idx) => {
            const isLocal = p.id === localPlayerId;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isLocal
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                    {idx === 0 ? '👑' : `#${idx + 1}`}
                  </div>
                  <span className="text-lg">{p.avatar}</span>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{p.name}</span>
                      {isLocal && (
                        <span className="text-[10px] font-mono text-amber-400 font-normal">
                          (YOU)
                        </span>
                      )}
                    </div>
                    {p.currentStreak > 1 && (
                      <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold">
                        <Flame className="w-3 h-3" />
                        <span>CHAOS STREAK x{p.currentStreak}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-amber-400 text-base">
                    {p.score} pts
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    +{p.roundScore} this round
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm">
        {isHost ? (
          <button
            id="wordlibs-next-round-btn"
            onClick={() => {
              sound.pop();
              onNextRound();
            }}
            disabled={isNextLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25"
          >
            <span>{isNextLoading ? 'Loading...' : room.currentRound < room.totalRounds ? 'Next Round' : 'View Final Results'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xs text-slate-400">
            Waiting for room host to proceed...
          </div>
        )}
      </div>
    </div>
  );
};
