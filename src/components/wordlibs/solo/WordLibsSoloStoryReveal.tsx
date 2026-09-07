import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WordLibsSoloStoryTemplate } from '../../../types/wordLibsSolo';
import { sound } from '../../../utils/audio';
import { Sparkles, Trophy, ArrowRight, Share2, Copy, Check } from 'lucide-react';

interface WordLibsSoloStoryRevealProps {
  storyTemplate: WordLibsSoloStoryTemplate;
  answers: Record<string, string>;
  topic: string;
  onProceedToResults: () => void;
}

export const WordLibsSoloStoryReveal: React.FC<WordLibsSoloStoryRevealProps> = ({
  storyTemplate,
  answers,
  topic,
  onProceedToResults
}) => {
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    sound.fanfare();
  }, []);

  // Helper to replace {key} with highlighted answers safely
  const renderParagraphWithHighlights = (paragraph: string) => {
    const parts = paragraph.split(/(\{[a-zA-Z0-9_]+\})/g);
    return parts.map((part, i) => {
      const match = part.match(/^\{([a-zA-Z0-9_]+)\}$/);
      if (match) {
        const key = match[1];
        const val = answers[key] || `[${key}]`;
        return (
          <span
            key={i}
            className="inline-block px-2 py-0.5 mx-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm"
          >
            {val}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Plaintext version for copying
  const getPlainTextStory = () => {
    let full = `${storyTemplate.title.toUpperCase()}\n\n`;
    storyTemplate.paragraphs.forEach((p) => {
      let resolved = p;
      for (const [k, v] of Object.entries(answers)) {
        resolved = resolved.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
      full += `${resolved}\n\n`;
    });
    return full.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPlainTextStory());
    setCopied(true);
    sound.pop();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevealNext = () => {
    sound.pop();
    if (revealedIndex < storyTemplate.paragraphs.length - 1) {
      setRevealedIndex((prev) => prev + 1);
    } else {
      onProceedToResults();
    }
  };

  const handleRevealAll = () => {
    sound.pop();
    setRevealedIndex(storyTemplate.paragraphs.length - 1);
  };

  const isAllRevealed = revealedIndex >= storyTemplate.paragraphs.length - 1;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-bold text-amber-400 mb-3"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>STORY GENERATION COMPLETE</span>
        </motion.div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {storyTemplate.title}
        </h2>
        <p className="text-xs font-mono text-amber-400/80 uppercase tracking-widest mt-2 font-bold">
          Theme: {topic}
        </p>
      </div>

      {/* Story Document Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative mb-8">
        {/* Paragraphs with animated reveals */}
        <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-200">
          {storyTemplate.paragraphs.slice(0, revealedIndex + 1).map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-medium"
            >
              {renderParagraphWithHighlights(paragraph)}
            </motion.p>
          ))}
        </div>

        {/* Copy Button */}
        {isAllRevealed && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Story!' : 'Copy Story'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {!isAllRevealed ? (
          <>
            <button
              id="solo-reveal-next-btn"
              onClick={handleRevealNext}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>Continue Story</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="solo-reveal-all-btn"
              onClick={handleRevealAll}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Reveal Entire Story</span>
            </button>
          </>
        ) : (
          <button
            id="solo-proceed-to-results-btn"
            onClick={() => {
              sound.fanfare();
              onProceedToResults();
            }}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>See Score & Statistics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
