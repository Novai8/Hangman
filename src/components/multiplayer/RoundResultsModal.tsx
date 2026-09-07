import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Player, Room } from '../../types';
import { Trophy, CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

interface RoundResultsModalProps {
  room: Room;
  localPlayer: Player;
  onNextRound: () => void;
  isWon: boolean;
}

export const RoundResultsModal: React.FC<RoundResultsModalProps> = ({
  room,
  localPlayer,
  onNextRound,
  isWon
}) => {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    if (isWon) {
      sound.win();
    } else {
      sound.lose();
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWon, onNextRound]);

  // Sort players by total score
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-[#0e101a] border border-white/10 rounded-[36px] p-6 sm:p-8 shadow-2xl relative text-center overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isWon ? 'bg-cyan-500/20' : 'bg-rose-500/20'
        }`} />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">
            ROUND {room.currentRound} {room.totalRounds > 0 ? `OF ${room.totalRounds}` : ''} COMPLETE
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 uppercase tracking-tight">
          {isWon ? 'WORD DECRYPTED!' : 'GALLOWS BREACHED!'}
        </h2>

        {/* Word reveal card */}
        <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest font-bold">
            THE ANSWER WAS
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-black text-cyan-400 tracking-[0.25em] my-1">
            {room.currentWord}
          </p>
          {room.currentHint && (
            <p className="text-xs text-slate-400 mt-1 font-mono italic">
              Hint: "{room.currentHint}"
            </p>
          )}
        </div>

        {/* Player performance breakdown */}
        <div className="space-y-2 mb-6 text-left">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold px-1">
            Round Performance & Scores
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {sortedPlayers.map((p, idx) => {
              const isLocal = p.id === localPlayer.id;
              const gain = p.roundScore > 0 ? `+${p.roundScore}` : '+0';

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isLocal
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 w-4">
                      #{idx + 1}
                    </span>
                    <span className="text-lg">{p.avatar}</span>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[140px] flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isLocal && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-400">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Total: {p.score.toLocaleString()} pts
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {gain}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Next Round Button & Countdown */}
        <button
          onClick={() => {
            sound.keyTap();
            onNextRound();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-400 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>NEXT ROUND ({countdown}s)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
