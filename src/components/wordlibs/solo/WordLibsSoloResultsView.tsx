import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WordLibsSoloMode, WordLibsSoloStats } from '../../../types/wordLibsSolo';
import { sound } from '../../../utils/audio';
import {
  Trophy,
  Flame,
  Clock,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Home,
  BarChart3,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface WordLibsSoloResultsViewProps {
  score: number;
  scoreBreakdown: {
    basePoints: number;
    speedBonus: number;
    creativityBonus: number;
    difficultyMultiplier: number;
    streakBonus: number;
    chaosLevel: string;
  };
  storyTitle: string;
  promptsCount: number;
  durationSeconds: number;
  streak: number;
  mode: WordLibsSoloMode;
  topic: string;
  stats: WordLibsSoloStats;
  isExpiredTimer?: boolean;
  onPlayAgain: () => void;
  onNewTopic: () => void;
  onChangeMode: () => void;
  onBackToHome: () => void;
  onNextEndlessStory?: () => void;
}

export const WordLibsSoloResultsView: React.FC<WordLibsSoloResultsViewProps> = ({
  score,
  scoreBreakdown,
  storyTitle,
  promptsCount,
  durationSeconds,
  streak,
  mode,
  topic,
  stats,
  isExpiredTimer,
  onPlayAgain,
  onNewTopic,
  onChangeMode,
  onBackToHome,
  onNextEndlessStory
}) => {
  const [showStatsModal, setShowStatsModal] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10"
        >
          <Trophy className="w-8 h-8" />
        </motion.div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isExpiredTimer ? 'Time Expired!' : 'Story Completed!'}
        </h2>
        <p className="text-sm font-mono text-slate-400 mt-1">
          "{storyTitle}" • <span className="text-amber-400 font-bold">{topic}</span>
        </p>

        {/* Streak Badge */}
        {streak > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 mt-3 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-xs font-black shadow-lg"
          >
            <Flame className="w-4 h-4" />
            <span>{streak} STORY STREAK ACTIVE!</span>
          </motion.div>
        )}
      </div>

      {/* Main Scorecard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-6">
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
            FINAL SCORE
          </div>
          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
            {score.toLocaleString()}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
            <span>Chaos Rating:</span>
            <span className="text-amber-400 font-bold">{scoreBreakdown.chaosLevel}</span>
          </div>
        </div>

        {/* Score Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-center">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Prompts</div>
            <div className="text-base font-bold text-white mt-0.5">
              {promptsCount} <span className="text-xs text-slate-400">answered</span>
            </div>
            <div className="text-[10px] font-mono text-amber-400">+{scoreBreakdown.basePoints} pts</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Duration</div>
            <div className="text-base font-bold text-white mt-0.5">{durationSeconds}s</div>
            <div className="text-[10px] font-mono text-emerald-400">+{scoreBreakdown.speedBonus} speed</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Creativity</div>
            <div className="text-base font-bold text-white mt-0.5">+{scoreBreakdown.creativityBonus}</div>
            <div className="text-[10px] font-mono text-slate-400">word variety</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Multiplier</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {scoreBreakdown.difficultyMultiplier}x
            </div>
            <div className="text-[10px] font-mono text-slate-400">difficulty</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {mode === 'endless' && onNextEndlessStory && (
          <button
            id="solo-next-endless-btn"
            onClick={() => {
              sound.pop();
              onNextEndlessStory();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-90 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>CONTINUE ENDLESS STREAK (STORY #{stats.totalStoriesCompleted + 1})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="solo-play-again-btn"
            onClick={() => {
              sound.pop();
              onPlayAgain();
            }}
            className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>

          <button
            id="solo-new-topic-btn"
            onClick={() => {
              sound.pop();
              onNewTopic();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>New Topic</span>
          </button>

          <button
            id="solo-change-mode-btn"
            onClick={() => {
              sound.pop();
              onChangeMode();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Mode</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            id="solo-view-stats-btn"
            onClick={() => {
              sound.pop();
              setShowStatsModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-800"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>My Solo Career Stats</span>
          </button>

          <button
            id="solo-return-home-btn"
            onClick={() => {
              sound.pop();
              onBackToHome();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-800"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Word Libs Home</span>
          </button>
        </div>
      </div>

      {/* Lifetime Career Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Your Solo Statistics</h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Stories Completed</div>
                <div className="text-xl font-black text-white mt-1">{stats.totalStoriesCompleted}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">High Score</div>
                <div className="text-xl font-black text-amber-400 mt-1">{stats.highestScore.toLocaleString()}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Average Score</div>
                <div className="text-xl font-black text-white mt-1">{stats.averageScore.toLocaleString()}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Best Streak</div>
                <div className="text-xl font-black text-orange-400 mt-1">{stats.longestStreak} 🔥</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Favorite Topic</div>
                <div className="text-sm font-bold text-white mt-1 truncate">{stats.favoriteTopic}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Fastest Story</div>
                <div className="text-sm font-bold text-white mt-1">
                  {stats.fastestCompletion !== null ? `${stats.fastestCompletion}s` : '—'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div>Total Prompts Answered: <span className="text-white font-bold">{stats.totalPromptsAnswered}</span></div>
              <div>Total Words Entered: <span className="text-white font-bold">{stats.totalWordsEntered}</span></div>
            </div>

            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase font-mono transition-colors"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
