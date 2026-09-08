import React, { useState } from 'react';
import { WordLibsRoom, WordLibsStory } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import { BookOpen, Sparkles, ChevronLeft, ChevronRight, User, Eye } from 'lucide-react';

interface WordLibsStoryReviewSectionProps {
  room: WordLibsRoom;
  localPlayerId: string;
}

export const WordLibsStoryReviewSection: React.FC<WordLibsStoryReviewSectionProps> = ({
  room,
  localPlayerId
}) => {
  // Pool of stories for review
  const storiesPool: WordLibsStory[] = (
    room.revealedStories && room.revealedStories.length > 0
      ? room.revealedStories
      : (room.allMatchStories || [])
  );

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

  if (storiesWithAuthor.length === 0) {
    return null;
  }

  const activeStory = storiesWithAuthor.find((s) => s.id === selectedStoryId) || storiesWithAuthor[0];
  const activeIndex = storiesWithAuthor.findIndex((s) => s.id === (activeStory?.id || ''));

  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-md mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Full Opponent Paragraph Review</h3>
            <p className="text-xs font-mono text-slate-400">
              Read complete, non-truncated stories from every player
            </p>
          </div>
        </div>

        {/* Carousel pagination if multiple */}
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
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title="Previous player"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-400">
              {activeIndex + 1} of {storiesWithAuthor.length}
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
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title="Next player"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Player Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {storiesWithAuthor.map((story) => {
          const isSelected = story.id === activeStory?.id;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => {
                sound.keyTap();
                setSelectedStoryId(story.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-white/5'
              }`}
            >
              <span>{story.resolvedAuthorAvatar}</span>
              <span>PLAYER: {story.resolvedAuthorName}</span>
              {story.isLocal && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-medium">
                  (You)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Story Content */}
      {activeStory && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                PLAYER: {activeStory.resolvedAuthorName} {activeStory.isLocal ? '(YOUR STORY)' : ''}
              </span>
              <h4 className="text-xl font-black text-white">{activeStory.title}</h4>
            </div>
            <span className="text-2xl">{activeStory.resolvedAuthorAvatar}</span>
          </div>

          {/* Full Paragraph Text */}
          <div className="space-y-3 text-slate-100 text-base sm:text-lg leading-relaxed font-serif">
            {activeStory.paragraphs.map((para, idx) => (
              <p key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                {para}
              </p>
            ))}
          </div>

          {/* Contributed Words */}
          {activeStory.insertedWords && Object.keys(activeStory.insertedWords).length > 0 && (
            <div className="pt-3 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-2">
                Words Submitted by {activeStory.resolvedAuthorName}:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeStory.insertedWords).map(([key, item]) => (
                  <span
                    key={key}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold"
                  >
                    <span className="text-slate-400 font-normal">{key.replace(/_/g, ' ')}:</span>{' '}
                    {item.word.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
