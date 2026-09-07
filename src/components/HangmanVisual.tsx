import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Zap } from 'lucide-react';

interface HangmanVisualProps {
  mistakes: number;
  maxMistakes: number;
  isGameOver: boolean;
  isWon: boolean;
}

export const HangmanVisual: React.FC<HangmanVisualProps> = ({
  mistakes,
  maxMistakes = 7,
  isGameOver,
  isWon
}) => {
  const remainingGuesses = Math.max(0, maxMistakes - mistakes);
  const healthPct = Math.max(0, (remainingGuesses / maxMistakes) * 100);
  const swayAngle = isGameOver ? 10 : mistakes > 0 ? (mistakes % 2 === 0 ? 1 : -1) * (mistakes * 2.0) : 0;

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 min-h-[340px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Immersive ambient top-down gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

      {/* SVG Canvas Rig */}
      <svg
        width="220"
        height="240"
        viewBox="0 0 200 240"
        className="drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-transform duration-300 relative z-10"
      >
        <defs>
          <filter id="purpleCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Gallows Base and Beam Structure */}
        <path
          d="M20 220 L180 220"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M60 220 L60 35 L140 35 L140 65"
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M60 70 L95 35"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Oscillating Character Rig */}
        <g
          style={{
            transformOrigin: '140px 65px',
            transform: `rotate(${swayAngle}deg)`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Ghost Wireframes for unrevealed parts */}
          <circle cx="140" cy="90" r="18" stroke="white" strokeWidth="4" fill="none" opacity="0.06" />
          <path d="M140 108 L140 165" stroke="white" strokeWidth="4" opacity="0.06" />
          <path d="M140 122 L112 150" stroke="white" strokeWidth="4" opacity="0.06" />
          <path d="M140 122 L168 150" stroke="white" strokeWidth="4" opacity="0.06" />
          <path d="M140 165 L115 200" stroke="white" strokeWidth="4" opacity="0.06" />
          <path d="M140 165 L165 200" stroke="white" strokeWidth="4" opacity="0.06" />

          {/* Part 1: Head (Mistake >= 1) */}
          <circle
            cx="140"
            cy="90"
            r="18"
            stroke={isGameOver ? '#f43f5e' : '#22d3ee'}
            strokeWidth="4"
            fill="none"
            className={`transition-all duration-300 ${mistakes >= 1 ? 'opacity-100' : 'opacity-0'}`}
            filter="url(#purpleCyanGlow)"
          />

          {/* Part 2: Body Torso (Mistake >= 2) */}
          <path
            d="M140 108 L140 165"
            stroke={isGameOver ? '#f43f5e' : '#22d3ee'}
            strokeWidth="4"
            strokeLinecap="round"
            className={`transition-all duration-300 ${mistakes >= 2 ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Part 3: Left Arm (Mistake >= 3) */}
          <path
            d="M140 122 L112 150"
            stroke={isGameOver ? '#f43f5e' : '#22d3ee'}
            strokeWidth="4"
            strokeLinecap="round"
            className={`transition-all duration-300 ${mistakes >= 3 ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Part 4: Right Arm (Mistake >= 4) */}
          <path
            d="M140 122 L168 150"
            stroke={isGameOver ? '#f43f5e' : '#22d3ee'}
            strokeWidth="4"
            strokeLinecap="round"
            className={`transition-all duration-300 ${mistakes >= 4 ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Part 5: Left Leg (Mistake >= 5) */}
          <path
            d="M140 165 L115 200"
            stroke={isGameOver ? '#f43f5e' : '#22d3ee'}
            strokeWidth="4"
            strokeLinecap="round"
            className={`transition-all duration-300 ${mistakes >= 5 ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Part 6: Right Leg (Mistake >= 6) */}
          <path
            d="M140 165 L165 200"
            stroke={isGameOver ? '#f43f5e' : '#22d3ee'}
            strokeWidth="4"
            strokeLinecap="round"
            className={`transition-all duration-300 ${mistakes >= 6 ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Part 7: Failure Glow / Sparks (Mistake >= 7) */}
          {mistakes >= 7 && (
            <g className="animate-pulse">
              <line x1="130" y1="80" x2="122" y2="72" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="150" y1="80" x2="158" y2="72" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        </g>
      </svg>

      {/* Health Bar Section matching Design */}
      <div className="mt-4 sm:mt-5 text-center w-full flex flex-col items-center relative z-10">
        <span className="text-[10px] tracking-[0.2em] text-slate-500 uppercase font-bold">Health</span>
        <div className="w-44 sm:w-48 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-300 ${
              mistakes >= 5
                ? 'bg-gradient-to-r from-rose-500 to-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                : 'bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
            }`}
            style={{ width: `${healthPct}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono tracking-wider">
          {remainingGuesses} / {maxMistakes} GUESSES REMAINING
        </p>
      </div>
    </div>
  );
};
