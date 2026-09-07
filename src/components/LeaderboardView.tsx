import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Flame, TrendingUp, Filter, Users, Medal, Star } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { sound } from '../utils/audio';

type LeaderboardFilter = 'daily' | 'weekly' | 'monthly' | 'all_time';

interface LeaderboardViewProps {
  userScore: number;
  userName: string;
  userAvatar: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  userScore,
  userName,
  userAvatar
}) => {
  const [activeFilter, setActiveFilter] = useState<LeaderboardFilter>('weekly');

  const baseLeaderboard: Record<LeaderboardFilter, LeaderboardEntry[]> = {
    daily: [
      { rank: 1, id: 'u1', name: 'Alex', avatar: '⚡', score: 2840, wins: 8, trend: 'up' },
      { rank: 2, id: 'u2', name: 'Sarah', avatar: '🌸', score: 2610, wins: 7, trend: 'up' },
      { rank: 3, id: 'u_user', name: userName, avatar: userAvatar, score: Math.max(1850, userScore % 3000), wins: 5, isUser: true, trend: 'same' },
      { rank: 4, id: 'u3', name: 'Mike', avatar: '🎯', score: 1720, wins: 4, trend: 'down' },
      { rank: 5, id: 'u4', name: 'Elena', avatar: '🦊', score: 1540, wins: 3, trend: 'up' },
      { rank: 6, id: 'u5', name: 'Jordan', avatar: '🚀', score: 1390, wins: 3, trend: 'down' },
      { rank: 7, id: 'u6', name: 'Marcus', avatar: '👑', score: 1210, wins: 2, trend: 'same' },
    ],
    weekly: [
      { rank: 1, id: 'u1', name: 'Alex', avatar: '⚡', score: 12450, wins: 38, trend: 'up' },
      { rank: 2, id: 'u2', name: 'Sarah', avatar: '🌸', score: 11820, wins: 35, trend: 'up' },
      { rank: 3, id: 'u3', name: 'Mike', avatar: '🎯', score: 10940, wins: 31, trend: 'down' },
      { rank: 4, id: 'u_user', name: userName, avatar: userAvatar, score: userScore, wins: 28, isUser: true, trend: 'up' },
      { rank: 5, id: 'u4', name: 'Elena', avatar: '🦊', score: 9240, wins: 24, trend: 'same' },
      { rank: 6, id: 'u5', name: 'Marcus', avatar: '👑', score: 8750, wins: 22, trend: 'up' },
      { rank: 7, id: 'u6', name: 'Chloe', avatar: '💎', score: 7900, wins: 19, trend: 'down' },
      { rank: 8, id: 'u7', name: 'Jordan', avatar: '🚀', score: 6820, wins: 15, trend: 'same' },
    ],
    monthly: [
      { rank: 1, id: 'u1', name: 'Alex', avatar: '⚡', score: 48900, wins: 142, trend: 'same' },
      { rank: 2, id: 'u4', name: 'Elena', avatar: '🦊', score: 45200, wins: 135, trend: 'up' },
      { rank: 3, id: 'u2', name: 'Sarah', avatar: '🌸', score: 42100, wins: 128, trend: 'down' },
      { rank: 4, id: 'u3', name: 'Mike', avatar: '🎯', score: 38900, wins: 115, trend: 'same' },
      { rank: 5, id: 'u_user', name: userName, avatar: userAvatar, score: userScore + 25000, wins: 98, isUser: true, trend: 'up' },
      { rank: 6, id: 'u5', name: 'Marcus', avatar: '👑', score: 32400, wins: 92, trend: 'down' },
    ],
    all_time: [
      { rank: 1, id: 'u5', name: 'Marcus', avatar: '👑', score: 184500, wins: 540, trend: 'same' },
      { rank: 2, id: 'u1', name: 'Alex', avatar: '⚡', score: 172900, wins: 495, trend: 'up' },
      { rank: 3, id: 'u2', name: 'Sarah', avatar: '🌸', score: 164200, wins: 460, trend: 'same' },
      { rank: 4, id: 'u4', name: 'Elena', avatar: '🦊', score: 149800, wins: 410, trend: 'up' },
      { rank: 5, id: 'u3', name: 'Mike', avatar: '🎯', score: 135200, wins: 380, trend: 'down' },
      { rank: 6, id: 'u_user', name: userName, avatar: userAvatar, score: userScore + 85000, wins: 290, isUser: true, trend: 'up' },
    ]
  };

  const list = baseLeaderboard[activeFilter];

  const filterLabels: Array<{ id: LeaderboardFilter; label: string }> = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all_time', label: 'All Time' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6 relative z-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-400 to-cyan-400 tracking-tight uppercase">
              GLOBAL LEADERBOARD
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Top ranked Hangman decipherers and party champions
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-stretch sm:self-auto justify-center">
          {filterLabels.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                sound.keyTap();
                setActiveFilter(f.id);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeFilter === f.id
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Featured Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {list.slice(0, 3).map((item, idx) => {
          let badgeColor = 'border-amber-400/50 bg-amber-500/10 text-amber-300';
          let medalEmoji = '🥇';
          if (idx === 1) {
            badgeColor = 'border-slate-300/50 bg-slate-400/10 text-slate-200';
            medalEmoji = '🥈';
          }
          if (idx === 2) {
            badgeColor = 'border-amber-700/50 bg-amber-700/10 text-amber-600';
            medalEmoji = '🥉';
          }

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-[28px] border backdrop-blur-md relative overflow-hidden transition-all shadow-xl flex flex-col justify-between ${badgeColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{medalEmoji}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-wider">
                  Rank #{idx + 1}
                </span>
              </div>

              <div className="flex items-center gap-3 my-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner border border-white/20">
                  {item.avatar}
                </div>
                <div>
                  <h3 className="font-black text-base text-white truncate max-w-[130px]">
                    {item.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {item.wins} Wins
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Score</span>
                <span className="text-sm font-mono font-black text-cyan-400">
                  {item.score.toLocaleString()} PTS
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Ranking List */}
      <div className="p-4 sm:p-6 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="divide-y divide-white/5 space-y-2">
          {list.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                item.isUser
                  ? 'bg-gradient-to-r from-purple-600/20 to-cyan-500/20 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="w-7 text-center font-mono font-black text-sm text-slate-400">
                  #{item.rank}
                </span>

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                  {item.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-white">
                      {item.name}
                    </span>
                    {item.isUser && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-black font-mono font-black text-[9px]">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {item.wins} multiplayer wins
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base sm:text-lg font-mono font-black text-cyan-400">
                  {item.score.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase">POINTS</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
