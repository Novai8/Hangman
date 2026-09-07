import React from 'react';
import { NavigationTab, UserProfile } from '../types';
import { Gamepad2, Users, Trophy, User, Settings, Volume2, VolumeX, Sparkles, ArrowLeft } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userProfile: UserProfile;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onOpenSettings: () => void;
  onReturnToGameHub?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  sfxEnabled,
  onToggleSfx,
  onOpenSettings,
  onReturnToGameHub
}) => {
  const tabs: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    { id: 'play', label: 'SINGLE PLAYER', icon: Gamepad2 },
    { id: 'multiplayer', label: 'MULTIPLAYER', icon: Users, badge: 'LIVE' },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { id: 'profile', label: 'PROFILE', icon: User }
  ];

  return (
    <nav className="w-full max-w-7xl mx-auto pt-4 sm:pt-6 px-4 sm:px-6 relative z-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start px-2">
          {onReturnToGameHub && (
            <button
              id="nav-game-hub-back-btn"
              onClick={() => {
                sound.keyTap();
                onReturnToGameHub();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-cyan-400 text-xs font-mono font-bold transition-colors"
              title="Return to Game Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>GAME HUB</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('multiplayer')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              H
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 leading-none">
                  HANGMAN
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                PARTY MULTIPLAYER
              </p>
            </div>
          </div>

          {/* Mobile Profile Pill */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-400"
            >
              <span>{userProfile.avatar}</span>
              <span className="font-bold">{userProfile.totalPoints}</span>
            </button>
          </div>
        </div>

        {/* Center Navigation Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-full md:w-auto justify-center overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isMultiplayer = tab.id === 'multiplayer';

            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => {
                  sound.keyTap();
                  onSelectTab(tab.id);
                }}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 select-none whitespace-nowrap ${
                  isActive
                    ? isMultiplayer
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-white/20'
                      : 'bg-white/15 text-cyan-400 shadow-md border border-white/15'
                    : isMultiplayer
                    ? 'text-purple-300 hover:text-white hover:bg-white/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isActive ? (isMultiplayer ? 'text-cyan-300' : 'text-cyan-400') : ''}`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-widest ${
                    isActive ? 'bg-cyan-400 text-black' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Tools & User Info */}
        <div className="hidden md:flex items-center gap-3">
          {/* User Points Badge */}
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-colors"
            title="View Profile"
          >
            <span className="text-base">{userProfile.avatar}</span>
            <div className="text-left leading-tight">
              <p className="text-[10px] text-slate-400 font-mono">LVL {userProfile.level} • {userProfile.name}</p>
              <p className="text-xs font-mono font-bold text-cyan-400">{userProfile.totalPoints.toLocaleString()} PTS</p>
            </div>
          </div>

          {/* SFX Quick Toggle */}
          <button
            onClick={() => {
              sound.keyTap();
              onToggleSfx();
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors"
            title={sfxEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Settings */}
          <button
            id="nav-settings-btn"
            onClick={() => {
              sound.keyTap();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Settings & How to Play"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
