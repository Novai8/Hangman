import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordLibsRoom, WordLibsStory, WordLibsPlayer } from '../../types/wordLibs';
import { BookOpen, X, User, Sparkles, Check, ChevronLeft, ChevronRight, Eye, LayoutGrid, List } from 'lucide-react';
import { sound } from '../../utils/audio';

interface WordLibsStoryReviewModalProps {
  room: WordLibsRoom;
  localPlayerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WordLibsStoryReviewModal: React.FC<WordLibsStoryReviewModalProps> = ({
  room,
  localPlayerId,
  isOpen,
  onClose
}) => {
  // Collect all completed stories available for review
  // Prioritize current round stories, fallback to allMatchStories
  const storiesPool: WordLibsStory[] = (
    room.revealedStories && room.revealedStories.length > 0
      ? room.revealedStories
      : (room.allMatchStories || [])
  );

  // Map each story to a player if possible
  const storiesWithAuthor = storiesPool.map((story) => {
    const matchedPlayer = room.players.find((p) => p.id === story.authorPlayerId);
    const authorName = story.authorRealName || matchedPlayer?.name || story.authorAnonymousLabel || 'Player';
    const authorAvatar = matchedPlayer?.avatar || '✍️';
    const isLocal = story.authorPlayerId === localPlayerId;

    return {
      ...story,
      resolvedAuthorName: authorName,
      resolvedAuthorAvatar: authorAvatar,
      isLocal
    };
  });

  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    storiesWithAuthor[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');

  // Currently active story in single-view
  const activeStory = storiesWithAuthor.find((s) => s.id === selectedStoryId) || storiesWithAuthor[0];
  const activeIndex = storiesWithAuthor.findIndex((s) => s.id === (activeStory?.id || ''));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar Header */}
          <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Full Story & Opponent Paragraph Review</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Read complete non-truncated stories and see every player&apos;s submissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle view mode: single tab vs all side-by-side */}
              <div className="hidden sm:flex rounded-xl bg-slate-800 p-1 border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setViewMode('single');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'single'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Focus View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setViewMode('all');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    viewMode === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Players
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.pop();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                title="Close review"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Player Selection Navigation Tabs */}
          {storiesWithAuthor.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-slate-950/40 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold whitespace-nowrap mr-1">
                Select Player:
              </span>
              {storiesWithAuthor.map((story) => {
                const isSelected = story.id === activeStory?.id && viewMode === 'single';
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => {
                      sound.keyTap();
                      setSelectedStoryId(story.id);
                      setViewMode('single');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-white/5'
                    }`}
                  >
                    <span>{story.resolvedAuthorAvatar}</span>
                    <span>PLAYER: {story.resolvedAuthorName}</span>
                    {story.isLocal && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-medium">
                        (You)
                      </span>
                    )}
                  </button>
                );
              })}

              {storiesWithAuthor.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    sound.keyTap();
                    setViewMode('all');
                  }}
                  className={`sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap ${
                    viewMode === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Show All</span>
                </button>
              )}
            </div>
          )}

          {/* Main Review Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {storiesWithAuthor.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-mono text-sm">No completed stories available for review yet.</p>
              </div>
            ) : viewMode === 'all' ? (
              /* All Players Side-by-Side / Stacked View */
              <div className="space-y-6">
                {storiesWithAuthor.map((story, sIdx) => (
                  <div
                    key={story.id}
                    className={`p-5 sm:p-7 rounded-2xl border transition-all ${
                      story.isLocal
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    {/* Story Header */}
                    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg">
                          {story.resolvedAuthorAvatar}
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                            PLAYER: {story.resolvedAuthorName} {story.isLocal ? '(YOUR STORY)' : ''}
                          </div>
                          <h4 className="text-lg font-black text-white">{story.title}</h4>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                        Story #{sIdx + 1}
                      </span>
                    </div>

                    {/* Full Paragraph Text */}
                    <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed font-serif">
                      {story.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Word Submissions Legend */}
                    {story.insertedWords && Object.keys(story.insertedWords).length > 0 && (
                      <div className="mt-5 pt-4 border-t border-white/10">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Words Contributed by {story.resolvedAuthorName}:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(story.insertedWords).map(([key, item]) => (
                            <span
                              key={key}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold"
                            >
                              {item.word.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Focused Single Story View */
              activeStory && (
                <div className="space-y-6">
                  {/* Story Card */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-amber-500/30 relative overflow-hidden shadow-xl">
                    {/* Author Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                          {activeStory.resolvedAuthorAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-amber-400 tracking-wider uppercase">
                              PLAYER: {activeStory.resolvedAuthorName}
                            </span>
                            {activeStory.isLocal && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                                YOUR SUBMISSION
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                            {activeStory.title}
                          </h3>
                        </div>
                      </div>

                      {/* Pagination Controls between stories */}
                      {storiesWithAuthor.length > 1 && (
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <button
                            type="button"
                            disabled={activeIndex <= 0}
                            onClick={() => {
                              sound.keyTap();
                              if (activeIndex > 0) {
                                setSelectedStoryId(storiesWithAuthor[activeIndex - 1].id);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                            title="Previous story"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="px-2.5 py-1 text-slate-400">
                            {activeIndex + 1} / {storiesWithAuthor.length}
                          </span>
                          <button
                            type="button"
                            disabled={activeIndex >= storiesWithAuthor.length - 1}
                            onClick={() => {
                              sound.keyTap();
                              if (activeIndex < storiesWithAuthor.length - 1) {
                                setSelectedStoryId(storiesWithAuthor[activeIndex + 1].id);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
                            title="Next story"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Full Non-truncated Paragraphs */}
                    <div className="space-y-5 text-slate-100 text-lg sm:text-xl leading-relaxed sm:leading-loose font-serif">
                      {activeStory.paragraphs.map((para, pIdx) => (
                        <div
                          key={pIdx}
                          className="bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-white/5 shadow-inner"
                        >
                          <p>{para}</p>
                        </div>
                      ))}
                    </div>

                    {/* Submissions & Words Filled In */}
                    {activeStory.insertedWords && Object.keys(activeStory.insertedWords).length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Submitted Words & Author Answers</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {Object.entries(activeStory.insertedWords).map(([key, item]) => (
                            <div
                              key={key}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                            >
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm font-bold font-mono text-amber-300 mt-1">
                                {item.word.toUpperCase()}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 mt-1">
                                Submitter: {item.submitterName || activeStory.resolvedAuthorName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Viewing complete player paragraphs with author attribution
            </span>

            <button
              type="button"
              onClick={() => {
                sound.pop();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ml-auto"
            >
              Close Review
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
