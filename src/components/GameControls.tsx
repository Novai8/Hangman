import React from 'react';
import { motion } from 'motion/react';
import { 
  Timer, 
  Infinity as InfinityIcon, 
  ShieldAlert, 
  Lightbulb, 
  RotateCcw, 
  Shuffle, 
  Cpu, 
  PawPrint, 
  Film, 
  Globe2, 
  UtensilsCrossed, 
  Trophy, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Category, Difficulty, GameMode } from '../types';

interface ControlsProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  category: Category;
  onSelectCategory: (cat: Category) => void;
  onNewWord: () => void;
  onHint: () => void;
  onReset: () => void;
  timedRemaining?: number;
  timedDuration?: number;
  hintDisabled?: boolean;
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  Technology: Cpu,
  Animals: PawPrint,
  Movies: Film,
  Countries: Globe2,
  Food: UtensilsCrossed,
  Sports: Trophy,
  Random: Sparkles
};

export const GameControls: React.FC<ControlsProps> = ({
  mode,
  onSelectMode,
  difficulty,
  onSelectDifficulty,
  category,
  onSelectCategory,
  onNewWord,
  onHint,
  onReset,
  timedRemaining = 60,
  timedDuration = 60,
  hintDisabled = false
}) => {
  const categories: Category[] = [
    'Technology',
    'Animals',
    'Movies',
    'Countries',
    'Food',
    'Sports',
    'Random'
  ];

  const timerPct = Math.max(0, Math.min(100, (timedRemaining / timedDuration) * 100));
  const isTimeCritical = timedRemaining <= 15;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-3 relative z-20">
      {/* Centered Mode & Difficulty Selector Row */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {/* Mode Selector Pill Group */}
        <div className="flex bg-black/40 p-1 rounded-full border border-white/5 shadow-inner">
          <button
            id="mode-classic-btn"
            onClick={() => onSelectMode('classic')}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              mode === 'classic'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CLASSIC
          </button>

          <button
            id="mode-timed-btn"
            onClick={() => onSelectMode('timed')}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              mode === 'timed'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TIMED
          </button>

          <button
            id="mode-endless-btn"
            onClick={() => onSelectMode('endless')}
            className={`px-4 sm:px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              mode === 'endless'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ENDLESS
          </button>
        </div>

        {/* Difficulty Selector Pill Group */}
        <div className="flex bg-black/40 p-1 rounded-full border border-white/5 shadow-inner">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              id={`diff-${diff}-btn`}
              onClick={() => onSelectDifficulty(diff)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-150 ${
                difficulty === diff
                  ? 'text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar py-0.5">
        <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-full border border-white/5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat] || Layers;
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase()}-btn`}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600/40 to-cyan-500/30 border border-cyan-400/40 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <IconComp className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{cat.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timed Mode Progress Decay Bar if in Timed Mode */}
      {mode === 'timed' && (
        <div className="flex flex-col gap-1.5 max-w-md mx-auto w-full pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={`flex items-center gap-1.5 font-bold ${isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
              <Timer className="w-3.5 h-3.5" />
              TIMED DECAY:
            </span>
            <span className={`font-bold tabular-nums ${isTimeCritical ? 'text-rose-400 font-extrabold text-sm' : 'text-cyan-400'}`}>
              {timedRemaining.toFixed(1)}s
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className={`h-full rounded-full transition-all duration-150 ${
                isTimeCritical
                  ? 'bg-gradient-to-r from-rose-500 to-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
              }`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
