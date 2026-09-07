import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { GameControls } from './components/GameControls';
import { HangmanVisual } from './components/HangmanVisual';
import { WordDisplay } from './components/WordDisplay';
import { Keyboard } from './components/Keyboard';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { CyberBackground } from './components/CyberBackground';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { WelcomeOverlay } from './components/WelcomeOverlay';

// Multiplayer components
import { MultiplayerHome } from './components/multiplayer/MultiplayerHome';
import { CreateRoomModal } from './components/multiplayer/CreateRoomModal';
import { JoinRoomModal } from './components/multiplayer/JoinRoomModal';
import { LobbyView } from './components/multiplayer/LobbyView';
import { MultiplayerGameView } from './components/multiplayer/MultiplayerGameView';
import { RoundResultsModal } from './components/multiplayer/RoundResultsModal';
import { MatchResultsModal } from './components/multiplayer/MatchResultsModal';
import { InviteModal } from './components/multiplayer/InviteModal';

// Game Hub & Word Libs
import { GameHubView } from './components/GameHubView';
import { WordLibsGameContainer } from './components/wordlibs/WordLibsGameContainer';
import { HangmanSoloContainer } from './components/hangman/solo/HangmanSoloContainer';

import { getRandomWord } from './data/words';
import { sound } from './utils/audio';
import {
  ActivityEvent,
  Category,
  Difficulty,
  FloatingReaction,
  GameMode,
  GameStats,
  GameStatus,
  NavigationTab,
  Player,
  ReactionEmoji,
  Room,
  RoomSettings,
  UserProfile
} from './types';
import {
  loadUserProfile,
  saveUserProfile,
  hasSavedUserProfile
} from './utils/userProfile';
import { multiplayerClient } from './services/multiplayerClient';
import { Sparkles, WifiOff } from 'lucide-react';

const MAX_MISTAKES = 7;
const SOLO_TIMED_DURATION = 60;

export default function App() {
  // Game Selection (Game Hub)
  const [activeGame, setActiveGame] = useState<'hub' | 'hangman' | 'wordlibs'>('hub');
  const [wordLibsInitialCode, setWordLibsInitialCode] = useState<string | null>(null);

  // Navigation & User
  const [activeTab, setActiveTab] = useState<NavigationTab>('multiplayer');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => !hasSavedUserProfile());
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => sound.enabled);
  const [fxLevel, setFxLevel] = useState<'high' | 'eco'>('high');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // ==========================================
  // MULTIPLAYER STATE (Real Server Synchronized)
  // ==========================================
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [lastGuessFeedback, setLastGuessFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const unsubscribeStreamRef = useRef<(() => void) | null>(null);
  const prevTimeRemainingRef = useRef<number>(15);

  // ==========================================
  // SOLO MODE STATE (Preserved from original)
  // ==========================================
  const [soloMode, setSoloMode] = useState<GameMode>('classic');
  const [soloDifficulty, setSoloDifficulty] = useState<Difficulty>('medium');
  const [soloCategory, setSoloCategory] = useState<Category>('Technology');
  const [soloWord, setSoloWord] = useState<string>('JAVASCRIPT');
  const [soloActiveCategory, setSoloActiveCategory] = useState<Category>('Technology');
  const [soloHint, setSoloHint] = useState<string | undefined>(undefined);
  const [soloGuessed, setSoloGuessed] = useState<Set<string>>(new Set());
  const [soloMistakes, setSoloMistakes] = useState<number>(0);
  const [soloStatus, setSoloStatus] = useState<GameStatus>('playing');
  const [soloShaking, setSoloShaking] = useState<boolean>(false);
  const [soloScore, setSoloScore] = useState<number>(0);
  const [soloLastGain, setSoloLastGain] = useState<number>(0);
  const [soloTimeRemaining, setSoloTimeRemaining] = useState<number>(SOLO_TIMED_DURATION);
  const soloTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [soloStats, setSoloStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('cyber_hangman_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      currentScore: 0,
      bestScore: 0
    };
  });

  // Save profile & stats
  useEffect(() => {
    if (hasSavedUserProfile() || !isWelcomeOpen) {
      saveUserProfile(userProfile);
    }
  }, [userProfile, isWelcomeOpen]);

  const handleWelcomeComplete = (chosenName: string, chosenAvatar: string) => {
    const updated: UserProfile = {
      ...userProfile,
      name: chosenName,
      avatar: chosenAvatar
    };
    setUserProfile(updated);
    saveUserProfile(updated);
    setIsWelcomeOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('cyber_hangman_stats', JSON.stringify(soloStats));
  }, [soloStats]);

  // Connect to SSE real-time room stream
  const connectToRoomStream = useCallback(
    (code: string, playerId: string) => {
      if (unsubscribeStreamRef.current) {
        unsubscribeStreamRef.current();
      }

      const unsub = multiplayerClient.connectStream(code, playerId, {
        onRoomSync: (syncedRoom) => {
          setCurrentRoom((prev) => {
            if (prev && prev.code === syncedRoom.code) {
              if (syncedRoom.mistakes > prev.mistakes) {
                sound.wrong();
              } else if (
                syncedRoom.guessedLetters.length > prev.guessedLetters.length &&
                syncedRoom.mistakes === prev.mistakes
              ) {
                sound.correct();
              }

              if (prev.phase === 'playing' && (syncedRoom.phase === 'round_results' || syncedRoom.phase === 'match_results')) {
                if (syncedRoom.mistakes < MAX_MISTAKES) {
                  sound.win();
                } else {
                  sound.gameOver();
                }
              }
            }
            return syncedRoom;
          });
        },
        onActivity: (event) => {
          setActivityFeed((prev) => [...prev.slice(-25), event]);
        },
        onReaction: (reaction) => {
          const id = 'react_' + Math.random().toString(36).substring(2, 9);
          setReactions((prev) => [...prev, { id, playerId: reaction.playerId, playerName: reaction.playerName, emoji: reaction.emoji, timestamp: Date.now() }]);
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
          }, 1900);
        },
        onConnectionChange: (status) => {
          if (status === 'disconnected') {
            setConnectionNotice('Reconnecting to room server...');
          } else if (status === 'connected') {
            setConnectionNotice(null);
          }
        }
      });

      unsubscribeStreamRef.current = unsub;
    },
    []
  );

  // Check URL query parameters for ?room=CODE or restore previous active session on refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');

    if (roomParam) {
      const code = roomParam.trim().toUpperCase();
      handleJoinRoom(code);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Auto-reconnect to previous room on refresh if available
    const saved = multiplayerClient.getSavedSession();
    if (saved && saved.code && saved.playerId) {
      multiplayerClient
        .reconnectRoom(saved.code, userProfile.id)
        .then((res) => {
          if (res && res.room) {
            setCurrentRoom(res.room);
            connectToRoomStream(res.room.code, userProfile.id);
            setActivityFeed((prev) => [
              ...prev.slice(-25),
              {
                id: 'ev_rec_' + Date.now(),
                playerId: userProfile.id,
                playerName: userProfile.name,
                type: 'reconnect',
                text: `Reconnected to room ${res.room.code}`,
                timestamp: Date.now()
              }
            ]);
          }
        })
        .catch(() => {
          multiplayerClient.clearSession();
        });
    }
  }, [userProfile.id, userProfile.name, connectToRoomStream]);

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeStreamRef.current) {
        unsubscribeStreamRef.current();
      }
    };
  }, []);

  // Audio tick on countdown when it is the local player's turn
  useEffect(() => {
    if (!currentRoom || currentRoom.phase !== 'playing') return;
    const activePlayer = currentRoom.players[currentRoom.activePlayerIndex];
    const isMyTurn = activePlayer?.id === userProfile.id;
    const time = currentRoom.turnTimeRemaining;

    if (isMyTurn && time <= 3 && time > 0 && time !== prevTimeRemainingRef.current) {
      sound.tick();
    }
    prevTimeRemainingRef.current = time;
  }, [currentRoom?.phase, currentRoom?.activePlayerIndex, currentRoom?.turnTimeRemaining, userProfile.id]);

  // ==========================================
  // MULTIPLAYER: AUTHORITATIVE ACTIONS
  // ==========================================
  const handleCreateRoom = async (settings: RoomSettings) => {
    try {
      const result = await multiplayerClient.createRoom(userProfile, settings, true);
      setCurrentRoom(result.room);
      setIsCreateModalOpen(false);
      connectToRoomStream(result.room.code, userProfile.id);
      setActivityFeed([
        {
          id: 'ev_init_' + Date.now(),
          playerId: userProfile.id,
          playerName: userProfile.name,
          type: 'connect',
          text: `${userProfile.name} created the room ${result.room.code}`,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      console.error('Failed to create room:', err);
    }
  };

  const handleJoinRoom = async (code: string) => {
    setIsJoiningRoom(true);
    setJoinError(null);
    try {
      // Check if this room code belongs to Word Libs
      const clean = code.trim().toUpperCase();
      const infoRes = await fetch(`/api/rooms/${clean}/info`).catch(() => null);
      if (infoRes && infoRes.ok) {
        const info = await infoRes.json();
        if (info.gameType === 'wordlibs') {
          setIsJoinModalOpen(false);
          setWordLibsInitialCode(clean);
          setActiveGame('wordlibs');
          return;
        }
      }

      const result = await multiplayerClient.joinRoom(clean, userProfile);
      setCurrentRoom(result.room);
      setIsJoinModalOpen(false);
      connectToRoomStream(result.room.code, userProfile.id);
      setActivityFeed((prev) => [
        ...prev.slice(-25),
        {
          id: 'ev_join_' + Date.now(),
          playerId: userProfile.id,
          playerName: userProfile.name,
          type: 'connect',
          text: `${userProfile.name} joined room ${result.room.code}`,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join room');
      sound.wrong();
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleQuickMatch = async () => {
    setIsSearchingMatch(true);
    try {
      const result = await multiplayerClient.quickMatch(userProfile);
      setCurrentRoom(result.room);
      connectToRoomStream(result.room.code, userProfile.id);
      setActivityFeed((prev) => [
        ...prev.slice(-25),
        {
          id: 'ev_qm_' + Date.now(),
          playerId: 'sys',
          playerName: 'System',
          type: 'connect',
          text: `Connected to room ${result.room.code}`,
          timestamp: Date.now()
        }
      ]);
    } catch (err: any) {
      console.error('Quick match error:', err);
    } finally {
      setIsSearchingMatch(false);
    }
  };

  const handleToggleReady = async () => {
    if (!currentRoom) return;
    try {
      const updated = await multiplayerClient.toggleReady(currentRoom.code, userProfile.id);
      setCurrentRoom(updated);
    } catch (err: any) {
      console.error('Toggle ready error:', err);
    }
  };

  const handleStartMultiplayerMatch = async () => {
    if (!currentRoom) return;
    try {
      const updated = await multiplayerClient.startGame(currentRoom.code, userProfile.id);
      setCurrentRoom(updated);
    } catch (err: any) {
      console.error('Start game error:', err);
    }
  };

  const handleLeaveRoom = async () => {
    sound.keyTap();
    if (currentRoom) {
      await multiplayerClient.leaveRoom(currentRoom.code, userProfile.id);
    }
    if (unsubscribeStreamRef.current) {
      unsubscribeStreamRef.current();
      unsubscribeStreamRef.current = null;
    }
    multiplayerClient.clearSession();
    setCurrentRoom(null);
    setActivityFeed([]);
    setReactions([]);
  };

  // Helper to add activity feed event
  const addActivityItem = (event: ActivityEvent) => {
    setActivityFeed((prev) => [...prev.slice(-25), event]);
  };

  // Trigger floating reaction
  const triggerReactionDisplay = (playerId: string, playerName: string, emoji: ReactionEmoji) => {
    const id = 'react_' + Math.random().toString(36).substring(2, 9);
    setReactions((prev) => [...prev, { id, playerId, playerName, emoji, timestamp: Date.now() }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1900);
  };

  const handleSendReaction = (emoji: ReactionEmoji) => {
    triggerReactionDisplay(userProfile.id, userProfile.name, emoji);
    if (currentRoom) {
      multiplayerClient.sendReaction(currentRoom.code, userProfile.id, userProfile.name, emoji);
    }
  };



  // Handle Letter Guess in Multiplayer
  const handleMultiplayerGuess = useCallback(
    async (letter: string) => {
      if (!currentRoom || currentRoom.phase !== 'playing') return;
      const upper = letter.toUpperCase();
      if (currentRoom.guessedLetters.includes(upper)) return;

      const activePlayer = currentRoom.players[currentRoom.activePlayerIndex];
      if (activePlayer?.id !== userProfile.id) return; // Not this player's turn

      try {
        const result = await multiplayerClient.guessLetter(currentRoom.code, userProfile.id, upper);
        setCurrentRoom(result.room);

        if (result.isCorrect) {
          sound.correct();
          setLastGuessFeedback({
            text: result.feedback || `CORRECT! +10 (${upper})`,
            isCorrect: true
          });
        } else {
          sound.wrong();
          setLastGuessFeedback({
            text: result.feedback || `WRONG GUESS: ${upper}`,
            isCorrect: false
          });
        }
        setTimeout(() => setLastGuessFeedback(null), 2000);
      } catch (err: any) {
        console.error('Guess error:', err);
      }
    },
    [currentRoom, userProfile.id]
  );

  const handleNextRound = async () => {
    if (!currentRoom) return;
    try {
      const updated = await multiplayerClient.nextRound(currentRoom.code, userProfile.id);
      setCurrentRoom(updated);
    } catch (err: any) {
      console.error('Next round error:', err);
    }
  };

  const handlePlayAgain = async () => {
    if (!currentRoom) return;
    try {
      const updated = await multiplayerClient.playAgain(currentRoom.code);
      setCurrentRoom(updated);
    } catch (err: any) {
      console.error('Play again error:', err);
    }
  };

  const handleReturnToLobby = async () => {
    if (!currentRoom) return;
    try {
      const updated = await multiplayerClient.returnToLobby(currentRoom.code);
      setCurrentRoom(updated);
    } catch (err: any) {
      console.error('Return to lobby error:', err);
    }
  };

  // Physical keyboard listener for multiplayer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'multiplayer' || !currentRoom || currentRoom.phase !== 'playing') return;
      const activePlayer = currentRoom.players[currentRoom.activePlayerIndex];
      if (activePlayer?.id !== userProfile.id) return; // not my turn!

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        handleMultiplayerGuess(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, currentRoom, userProfile.id, handleMultiplayerGuess]);

  // ==========================================
  // SOLO MODE IMPLEMENTATION
  // ==========================================
  const startSoloRound = useCallback(
    (cat: Category = soloCategory, diff: Difficulty = soloDifficulty) => {
      if (soloTimerRef.current) clearInterval(soloTimerRef.current);
      const wordData = getRandomWord(cat, diff);
      setSoloWord(wordData.word);
      setSoloActiveCategory(wordData.category);
      setSoloHint(wordData.hint);
      setSoloGuessed(new Set());
      setSoloMistakes(0);
      setSoloStatus('playing');
      setSoloShaking(false);
      setSoloTimeRemaining(SOLO_TIMED_DURATION);
    },
    [soloCategory, soloDifficulty]
  );

  useEffect(() => {
    if (activeTab === 'play' && soloWord === 'JAVASCRIPT' && soloGuessed.size === 0) {
      startSoloRound();
    }
  }, [activeTab, soloWord, soloGuessed.size, startSoloRound]);

  const handleSoloGuess = (letter: string) => {
    if (soloStatus !== 'playing' || soloGuessed.has(letter)) return;
    const upperLetter = letter.toUpperCase();
    const newGuessed = new Set(soloGuessed);
    newGuessed.add(upperLetter);
    setSoloGuessed(newGuessed);

    if (soloWord.includes(upperLetter)) {
      sound.correct();
      setSoloScore((s) => s + 10);
      const isWon = soloWord.split('').every((c) => newGuessed.has(c) || c === ' ');
      if (isWon) {
        sound.win();
        setSoloStatus('won');
        setSoloLastGain(120);
        setSoloScore((s) => s + 120);
        setSoloStats((prev) => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          currentScore: prev.currentScore + 130,
          bestScore: Math.max(prev.bestScore, prev.currentScore + 130)
        }));
      }
    } else {
      sound.wrong();
      const nextMistakes = soloMistakes + 1;
      setSoloMistakes(nextMistakes);
      setSoloShaking(true);
      setTimeout(() => setSoloShaking(false), 350);
      if (nextMistakes >= MAX_MISTAKES) {
        sound.lose();
        setSoloStatus('lost');
        setSoloStats((prev) => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          currentStreak: 0
        }));
      }
    }
  };

  const handleSoloHint = () => {
    if (soloStatus !== 'playing') return;
    const unrevealed = soloWord.split('').filter((c) => c !== ' ' && !soloGuessed.has(c));
    if (unrevealed.length === 0) return;
    sound.hint();
    setSoloScore((s) => Math.max(0, s - 20));
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    handleSoloGuess(pick);
  };

  // Local player object inside current room
  const localPlayerInRoom = currentRoom?.players.find((p) => p.id === userProfile.id) || {
    id: userProfile.id,
    name: userProfile.name,
    avatar: userProfile.avatar,
    isHost: currentRoom?.hostId === userProfile.id,
    isReady: true,
    isLocal: true,
    score: 0,
    roundScore: 0,
    connectionStatus: 'connected',
    lives: 3,
    isEliminated: false,
    color: '#22d3ee',
    currentStreak: 0
  };

  const handleReturnToHubFromHangman = () => {
    if (currentRoom && ['countdown', 'playing', 'round_results'].includes(currentRoom.phase)) {
      if (!window.confirm('Leave active multiplayer match? Your progress will be lost.')) {
        return;
      }
      handleLeaveRoom();
    }
    setActiveGame('hub');
  };

  const handleHubQuickJoin = async (code: string) => {
    try {
      const res = await fetch(`/api/rooms/${code}/info`);
      const data = await res.json();
      if (data.gameType === 'wordlibs') {
        setWordLibsInitialCode(code);
        setActiveGame('wordlibs');
      } else {
        setActiveGame('hangman');
        setActiveTab('multiplayer');
        handleJoinRoom(code);
      }
    } catch {
      setActiveGame('hangman');
      handleJoinRoom(code);
    }
  };

  // -------------------------------------------------------------
  // GAME HUB SCREEN
  // -------------------------------------------------------------
  if (activeGame === 'hub') {
    return (
      <>
        <GameHubView
          userProfile={userProfile}
          sfxEnabled={sfxEnabled}
          onToggleSfx={() => {
            const isEnabled = sound.toggle();
            setSfxEnabled(isEnabled);
          }}
          onSelectGame={(game) => {
            setWordLibsInitialCode(null);
            setActiveGame(game);
          }}
          onQuickJoinCode={handleHubQuickJoin}
        />
        <WelcomeOverlay
          isOpen={isWelcomeOpen}
          initialAvatar={userProfile.avatar}
          onComplete={handleWelcomeComplete}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // WORD LIBS GAME SCREEN
  // -------------------------------------------------------------
  if (activeGame === 'wordlibs') {
    return (
      <>
        <WordLibsGameContainer
          userProfile={userProfile}
          sfxEnabled={sfxEnabled}
          onToggleSfx={() => {
            const isEnabled = sound.toggle();
            setSfxEnabled(isEnabled);
          }}
          onReturnToGameHub={() => {
            setWordLibsInitialCode(null);
            setActiveGame('hub');
          }}
          initialRoomCode={wordLibsInitialCode}
        />
        <WelcomeOverlay
          isOpen={isWelcomeOpen}
          initialAvatar={userProfile.avatar}
          onComplete={handleWelcomeComplete}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // HANGMAN GAME SCREEN
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col relative z-10 text-[#e3e1e9] font-['Plus_Jakarta_Sans'] selection:bg-[#00f0ff] selection:text-[#00363a]">
      {/* Dynamic Cyber Ambient Background Canvas */}
      <CyberBackground fxLevel={fxLevel} />

      {/* Main Top Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        userProfile={userProfile}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => {
          const isEnabled = sound.toggle();
          setSfxEnabled(isEnabled);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReturnToGameHub={handleReturnToHubFromHangman}
      />

      {/* VIEW 1: MULTIPLAYER PARTY VIEW */}
      {activeTab === 'multiplayer' && (
        <main className="flex-1 flex flex-col justify-center py-2 sm:py-6">
          {!currentRoom ? (
            <MultiplayerHome
              onSelectSolo={() => setActiveTab('play')}
              onCreateRoom={() => setIsCreateModalOpen(true)}
              onJoinRoom={() => setIsJoinModalOpen(true)}
              onQuickMatch={handleQuickMatch}
              isSearchingMatch={isSearchingMatch}
            />
          ) : currentRoom.phase === 'lobby' ? (
            <LobbyView
              room={currentRoom}
              localPlayer={localPlayerInRoom}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartMultiplayerMatch}
              onLeaveRoom={handleLeaveRoom}
              onOpenInvite={() => setIsInviteModalOpen(true)}
            />
          ) : (
            <div className="relative">
              <MultiplayerGameView
                room={currentRoom}
                localPlayer={localPlayerInRoom}
                onGuessLetter={handleMultiplayerGuess}
                onSendReaction={handleSendReaction}
                reactions={reactions}
                activityFeed={activityFeed}
                lastGuessFeedback={lastGuessFeedback}
                onOpenInvite={() => setIsInviteModalOpen(true)}
              />

              {/* Round Results Modal */}
              {currentRoom.phase === 'round_results' && (
                <RoundResultsModal
                  room={currentRoom}
                  localPlayer={localPlayerInRoom}
                  onNextRound={handleNextRound}
                  isWon={currentRoom.mistakes < MAX_MISTAKES}
                />
              )}

              {/* Final Match Results Modal */}
              {currentRoom.phase === 'match_results' && (
                <MatchResultsModal
                  room={currentRoom}
                  localPlayer={localPlayerInRoom}
                  onPlayAgain={handlePlayAgain}
                  onReturnToLobby={handleReturnToLobby}
                  onLeaveGame={handleLeaveRoom}
                />
              )}
            </div>
          )}
        </main>
      )}

      {/* VIEW 2: SOLO PLAY VIEW (Dedicated Hangman Single Player Flow) */}
      {activeTab === 'play' && (
        <main className="flex-1 max-w-7xl mx-auto w-full py-2 pb-6 relative z-20 flex flex-col justify-center">
          <HangmanSoloContainer
            onBackToHangmanHome={() => setActiveTab('multiplayer')}
          />
        </main>
      )}

      {/* VIEW 3: GLOBAL LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <main className="flex-1 py-4">
          <LeaderboardView
            userScore={userProfile.totalPoints}
            userName={userProfile.name}
            userAvatar={userProfile.avatar}
          />
        </main>
      )}

      {/* VIEW 4: PLAYER PROFILE */}
      {activeTab === 'profile' && (
        <main className="flex-1 py-4">
          <ProfileView
            profile={userProfile}
            onUpdateProfile={(updated) => setUserProfile(updated)}
          />
        </main>
      )}

      {/* MODALS */}
      <WelcomeOverlay
        isOpen={isWelcomeOpen}
        initialAvatar={userProfile.avatar}
        onComplete={handleWelcomeComplete}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinRoom}
      />

      {currentRoom && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          roomCode={currentRoom.code}
          currentPlayersCount={currentRoom.players.length}
          maxPlayers={currentRoom.settings.maxPlayers}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => {
          const isEnabled = sound.toggle();
          setSfxEnabled(isEnabled);
        }}
        fxLevel={fxLevel}
        onToggleFx={() => {
          sound.keyTap();
          setFxLevel((prev) => (prev === 'high' ? 'eco' : 'high'));
        }}
        stats={soloStats}
        onResetStats={() => {
          sound.keyTap();
          setSoloStats({
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
            currentScore: 0,
            bestScore: 0
          });
          setSoloScore(0);
          localStorage.removeItem('cyber_hangman_stats');
        }}
      />
    </div>
  );
}
