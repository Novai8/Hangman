import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordLibsRoom, WordLibsStory } from '../../types/wordLibs';
import { sound } from '../../utils/audio';
import { BookOpen, Sparkles, ArrowRight, FastForward, Laugh } from 'lucide-react';

interface WordLibsStoryRevealViewProps {
  room: WordLibsRoom;
  localPlayerId: string;
  onAdvanceReveal: () => void;
  onSkipReveal: () => void;
}

export const WordLibsStoryRevealView: React.FC<WordLibsStoryRevealViewProps> = ({
  room,
  localPlayerId,
  onAdvanceReveal,
  onSkipReveal
}) => {
  const isHost = room.hostId === localPlayerId;
  
  // In battle mode, default to a story from ANOTHER player to prevent seeing one's own answers
  const initialStoryIndex = Math.max(
    0,
    room.revealedStories.findIndex((s) => s.authorPlayerId && s.authorPlayerId !== localPlayerId)
  );
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(initialStoryIndex);

  const currentStory = room.revealedStories[selectedStoryIndex] || room.revealedStories[0];

  useEffect(() => {
    sound.revealWord();
  }, [room.currentRevealParagraph]);

  if (!currentStory) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-mono text-sm">Compiling story...</p>
      </div>
    );
  }

  const isLastParagraph = room.currentRevealParagraph >= room.totalParagraphs;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>STORY REVEAL • PARAGRAPH {room.currentRevealParagraph} OF {room.totalParagraphs}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {currentStory.title}
        </h2>
        {room.settings.mode === 'battle' && (
          <p className="text-xs font-mono text-amber-300/80 mt-1">
            Anonymous Story Battle • Viewing: {currentStory.authorAnonymousLabel}
          </p>
        )}

        {/* Multi-story switcher tabs in Battle mode */}
        {room.revealedStories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {room.revealedStories
              .filter((s) => room.settings.mode !== 'battle' || s.authorPlayerId !== localPlayerId)
              .map((story) => {
                const isSelected = story.id === currentStory?.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => {
                      sound.keyTap();
                      const realIdx = room.revealedStories.findIndex((st) => st.id === story.id);
                      setSelectedStoryIndex(realIdx);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{story.authorAnonymousLabel}</span>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Story Parchment Card */}
      <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-amber-950/40 relative overflow-hidden mb-8">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/50 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400/50 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400/50 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/50 rounded-br-2xl" />

        <div className="space-y-6 text-slate-100 text-base sm:text-lg leading-relaxed sm:leading-loose font-serif">
          {currentStory.paragraphs
            .slice(0, room.currentRevealParagraph)
            .map((para, pIdx) => {
              return (
                <motion.p
                  key={`p_${pIdx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  {/* Parse inserted words in caps */}
                  {para.split(/([A-Z0-9\s-_'"]{3,})/).map((segment, sIdx) => {
                    const isCapitalizedWord =
                      segment.length >= 3 &&
                      segment === segment.toUpperCase() &&
                      /[A-Z]/.test(segment);

                    if (isCapitalizedWord) {
                      return (
                        <span
                          key={`word_${sIdx}`}
                          className="inline-block mx-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/60 font-sans font-black text-amber-300 shadow-sm shadow-amber-500/20 animate-pulse tracking-wide"
                        >
                          {segment}
                        </span>
                      );
                    }
                    return <span key={`text_${sIdx}`}>{segment}</span>;
                  })}
                </motion.p>
              );
            })}
        </div>
      </div>

      {/* Reveal Action Controls */}
      <div className="w-full max-w-md flex gap-3">
        {!isLastParagraph && (
          <button
            id="wordlibs-skip-reveal-btn"
            onClick={() => {
              sound.pop();
              onSkipReveal();
            }}
            className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FastForward className="w-4 h-4" />
            <span>Skip to Voting</span>
          </button>
        )}

        <button
          id="wordlibs-advance-reveal-btn"
          onClick={() => {
            sound.pop();
            onAdvanceReveal();
          }}
          className="flex-1 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25"
        >
          <span>{isLastParagraph ? 'Proceed to Voting' : 'Next Paragraph'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
