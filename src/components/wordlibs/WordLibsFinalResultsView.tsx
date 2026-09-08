import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { WordLibsRoom } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import { Trophy, RotateCcw, Home, Sparkles, Crown, Flame, BookOpen } from 'lucide-react';
import { WordLibsStoryReviewSection } from './WordLibsStoryReviewSection';
import { WordLibsStoryReviewModal } from './WordLibsStoryReviewModal';

interface WordLibsFinalResultsViewProps {
  room: WordLibsRoom;
  localPlayerId: string;
  onPlayAgain: () => void;
  onReturnToGameHub: () => void;
}

export const WordLibsFinalResultsView: React.FC<WordLibsFinalResultsViewProps> = ({
  room,
  localPlayerId,
  onPlayAgain,
  onReturnToGameHub
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const isHost = room.hostId === localPlayerId;
  const leaderboard = room.finalLeaderboard || [];
  const champion = leaderboard[0];

  useEffect(() => {
    sound.win();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Champion Banner */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full text-center mb-8"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-rose-500 p-1 mx-auto mb-4 shadow-2xl shadow-amber-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
            🏆
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-bold text-amber-400 mb-2">
          <Crown className="w-3.5 h-3.5" />
          <span>CHAOS CHAMPION CROWNED</span>
        </div>

        <h2 className="text-4xl font-black text-white tracking-tight mb-2">
          {champion?.player.name || 'Anonymous Champion'}
        </h2>
        <p className="text-sm font-mono text-amber-300 font-bold">
          {champion?.title} • {champion?.player.score} Total Points
        </p>
      </motion.div>

      {/* Full Leaderboard & Awarded Titles */}
      <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 mb-8 backdrop-blur-md shadow-2xl shadow-amber-950/20">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
          Final Standings & Titles
        </h3>

        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const isLocal = entry.player.id === localPlayerId;
            return (
              <div
                key={entry.player.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  isLocal
                    ? 'bg-amber-500/15 border-amber-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                      entry.rank === 1
                        ? 'bg-amber-500 text-slate-950'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{entry.rank}
                  </div>

                  <span className="text-xl">{entry.player.avatar}</span>

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{entry.player.name}</span>
                      {isLocal && (
                        <span className="text-[10px] font-mono text-amber-400 font-normal">
                          (YOU)
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-amber-400/90 font-bold">
                      {entry.title}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-lg font-black text-white">{entry.player.score} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Opponent Story & Paragraph Review Section */}
      <WordLibsStoryReviewSection room={room} localPlayerId={localPlayerId} />

      {/* Action Buttons */}
      <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
        <button
          id="wordlibs-return-gamehub-btn"
          onClick={onReturnToGameHub}
          className="flex-1 py-3.5 px-5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Game Hub</span>
        </button>

        {isHost && (
          <button
            id="wordlibs-play-again-btn"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        )}
      </div>

      <WordLibsStoryReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        room={room}
        localPlayerId={localPlayerId}
      />
    </div>
  );
};
