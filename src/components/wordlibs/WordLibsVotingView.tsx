import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WordLibsRoom, WordLibsVoteCategory } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import { Trophy, Flame, Laugh, Sparkles, Check, ThumbsUp, Users, FastForward } from 'lucide-react';

interface WordLibsVotingViewProps {
  room: WordLibsRoom;
  localPlayerId: string;
  onSubmitVote: (category: WordLibsVoteCategory, targetStoryId: string) => void;
  onForceFinalizeVoting?: () => void;
}

const CATEGORIES: Array<{
  category: WordLibsVoteCategory;
  label: string;
  points: number;
  icon: string;
  desc: string;
}> = [
  { category: 'funniest', label: 'Funniest', points: 3, icon: '😂', desc: 'Made everyone laugh out loud' },
  { category: 'most_unexpected', label: 'Most Unexpected', points: 2, icon: '🤯', desc: 'Caught you completely off guard' },
  { category: 'most_chaotic', label: 'Most Chaotic', points: 2, icon: '🔥', desc: 'Absolute unhinged madness' },
  { category: 'best_story', label: 'Best Story', points: 3, icon: '⭐', desc: 'Peak narrative excellence' }
];

export const WordLibsVotingView: React.FC<WordLibsVotingViewProps> = ({
  room,
  localPlayerId,
  onSubmitVote,
  onForceFinalizeVoting
}) => {
  // Local state tracking which category is active and cast votes
  const [selectedCategory, setSelectedCategory] = useState<WordLibsVoteCategory>('funniest');
  const [myVotes, setMyVotes] = useState<Partial<Record<WordLibsVoteCategory, string>>>({});

  const isHost = room.hostId === localPlayerId;
  const connectedPlayers = room.players.filter((p) => p.connectionStatus === 'connected');
  const totalVoters = Math.max(1, connectedPlayers.length);
  const votedCount = (room.votedPlayerIds || []).length;

  const handleVote = (targetId: string) => {
    sound.pop();
    setMyVotes((prev) => ({ ...prev, [selectedCategory]: targetId }));
    onSubmitVote(selectedCategory, targetId);
  };

  const stories = room.revealedStories.length > 0 ? room.revealedStories : [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Voting Header */}
      <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 mb-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 mb-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>ROUND VOTING PHASE</span>
            </div>
            <h2 className="text-2xl font-black text-white">Cast Your Votes</h2>
            <p className="text-xs text-slate-400 font-mono">
              Pick a category and choose the best story. Self-voting is not allowed!
            </p>
          </div>

          {/* Voting Progress Tracker (replaces timer countdown) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold shadow-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{votedCount} / {totalVoters} PLAYERS VOTED</span>
            </div>

            {/* Host force finalize button */}
            {isHost && onForceFinalizeVoting && (
              <button
                type="button"
                onClick={() => {
                  sound.pop();
                  onForceFinalizeVoting();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs flex items-center gap-1.5 transition-colors"
                title="Host: Force end voting and tally scores"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>End Voting</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
          {CATEGORIES.map((cat) => {
            const hasVoted = Boolean(myVotes[cat.category]);
            const isSelected = selectedCategory === cat.category;

            return (
              <button
                key={cat.category}
                id={`vote-cat-tab-${cat.category}`}
                type="button"
                onClick={() => {
                  sound.keyTap();
                  setSelectedCategory(cat.category);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    +{cat.points} PTS
                  </span>
                </div>
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{cat.label}</span>
                  {hasVoted && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Stories Grid */}
      <div className="w-full space-y-4">
        <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
          Vote for &quot;{CATEGORIES.find((c) => c.category === selectedCategory)?.label}&quot;:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story) => {
            const isOwnStory = story.authorPlayerId === localPlayerId;
            const isVotedForThis = myVotes[selectedCategory] === story.id;

            return (
              <motion.div
                key={story.id}
                whileHover={!isOwnStory ? { y: -2 } : {}}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isVotedForThis
                    ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-slate-200">
                      {story.authorAnonymousLabel}
                    </span>
                    {isOwnStory && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-300 font-semibold">
                        Your Story (No Self-Voting)
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-base mb-2">{story.title}</h4>

                  {/* Snippet of the story */}
                  <div className="text-slate-300 text-xs leading-relaxed line-clamp-4 font-serif bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 mb-4">
                    {story.paragraphs.join(' ')}
                  </div>
                </div>

                <motion.button
                  id={`vote-story-btn-${story.id}`}
                  whileHover={!isOwnStory ? { scale: 1.02 } : {}}
                  whileTap={!isOwnStory ? { scale: 0.98 } : {}}
                  disabled={isOwnStory}
                  onClick={() => handleVote(story.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isVotedForThis
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : isOwnStory
                      ? 'bg-slate-800/40 text-slate-500 border border-slate-800/50 cursor-not-allowed opacity-60'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isVotedForThis ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Vote Cast ✓</span>
                    </>
                  ) : isOwnStory ? (
                    <span>Self-voting disabled</span>
                  ) : (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Vote for this story</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
