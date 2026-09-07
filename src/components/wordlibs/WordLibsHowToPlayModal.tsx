import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Sparkles, Flame, Trophy, Laugh, CheckCircle2 } from 'lucide-react';

interface WordLibsHowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordLibsHowToPlayModal: React.FC<WordLibsHowToPlayModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Answer Secret Prompts',
      desc: "Each player answers funny contextual questions (e.g., 'A terrible excuse for being late', 'An animal that shouldn't fly a plane'). Keep your answers secret!",
      icon: '✍️'
    },
    {
      step: '02',
      title: 'Assemble the Story',
      desc: 'The game seamlessly inserts your words into original, dramatic story templates across School, Work, Space, Fantasy, and Apocalypse topics.',
      icon: '📖'
    },
    {
      step: '03',
      title: 'Dramatic Reveal',
      desc: 'Read through the story paragraph by paragraph with glowing inserted words and sound effects before moving to voting.',
      icon: '🎭'
    },
    {
      step: '04',
      title: 'Anonymous Party Voting',
      desc: "Vote anonymously for Funniest (+3 pts), Most Unexpected (+2 pts), Most Chaotic (+2 pts), and Best Story (+3 pts). You cannot vote for yourself!",
      icon: '😂'
    }
  ];

  const chaosEvents = [
    { name: 'Double Points', desc: 'All vote points are doubled for this round' },
    { name: 'Speed Round', desc: 'Timer drops to 20 seconds of pure adrenaline' },
    { name: 'One Word Only', desc: 'Every answer must be strictly a single word' },
    { name: 'Secret Bonus', desc: 'Surprise bonus points on a mystery prompt' },
    { name: 'Everyone is a Villain', desc: 'Story characters take an evil comedic turn' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">How to Play Word Libs</h3>
              <p className="text-xs font-mono text-slate-400">MULTIPLAYER STORYTELLING PARTY GAME</p>
            </div>
          </div>
          <button
            id="close-wordlibs-howto-modal"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Game Flow & Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="font-mono text-xs text-amber-400/80 font-bold">{s.step}</span>
                  </div>
                  <h5 className="font-bold text-white text-sm mb-1">{s.title}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chaos Modifiers */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20">
          <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Random Chaos Events</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {chaosEvents.map((c) => (
              <div key={c.name} className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 mt-0.5">•</span>
                <div>
                  <span className="font-bold text-white">{c.name}:</span>{' '}
                  <span className="text-slate-400">{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Summary */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Scoring & Bonuses</span>
          </h4>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              😂 Funniest: <b className="text-amber-400">+3 pts</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              ⭐ Best Story: <b className="text-amber-400">+3 pts</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              🤯 Most Unexpected: <b className="text-amber-400">+2 pts</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              🔥 Most Chaotic: <b className="text-amber-400">+2 pts</b>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              ⚡ Chaos Combo (2+ wins): <b className="text-emerald-400">+5 pts</b>
            </span>
          </div>
        </div>

        <button
          id="close-wordlibs-howto-btn"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm uppercase tracking-wide transition-all shadow-lg shadow-amber-500/20"
        >
          Got It, Let's Play!
        </button>
      </motion.div>
    </div>
  );
};
