import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SOLO_TOPICS, TopicInfo } from '../../../data/wordLibsSoloData';
import { WordLibsSoloMode } from '../../../types/wordLibsSolo';
import { sound } from '../../../utils/audio';
import {
  ArrowLeft,
  Sparkles,
  Shuffle,
  Search,
  BookOpen
} from 'lucide-react';

interface WordLibsSoloTopicSelectProps {
  mode: WordLibsSoloMode;
  onSelectTopic: (topicName: string) => void;
  onBack: () => void;
}

export const WordLibsSoloTopicSelect: React.FC<WordLibsSoloTopicSelectProps> = ({
  mode,
  onSelectTopic,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = SOLO_TOPICS.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRandomPick = () => {
    sound.pop();
    const random = SOLO_TOPICS[Math.floor(Math.random() * SOLO_TOPICS.length)];
    onSelectTopic(random.name);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <button
          id="solo-topic-back-btn"
          onClick={() => {
            sound.pop();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CHANGE MODE</span>
        </button>

        <div className="text-xs font-mono text-slate-400">
          MODE: <span className="text-amber-400 font-bold uppercase">{mode.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Header & Search */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>STEP 2: CHOOSE YOUR STORY UNIVERSE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select a Topic
        </h2>
        <p className="text-xs sm:text-sm font-mono text-slate-400 mt-2 max-w-xl mx-auto">
          Choose from 20 rich narrative themes, each with dedicated prompts and multiple story scenarios.
        </p>

        {/* Action Controls: Search & Random Pick */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. Pirates, Space)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500/50 text-white placeholder-slate-500 text-xs font-mono outline-none transition-colors"
            />
          </div>

          <button
            id="solo-random-topic-btn"
            onClick={handleRandomPick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Pick</span>
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredTopics.map((topic, idx) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            onClick={() => {
              sound.pop();
              onSelectTopic(topic.name);
            }}
            id={`solo-topic-${topic.id.toLowerCase().replace(/\s+/g, '-')}`}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80 cursor-pointer transition-all duration-150 group flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {topic.emoji}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                    {topic.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Theme
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {topic.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 group-hover:text-amber-400">
              <span>Select Theme</span>
              <span>→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 text-slate-500 font-mono text-xs">
          No topics matched "{searchQuery}". Try another keyword or hit Random Pick!
        </div>
      )}
    </div>
  );
};
