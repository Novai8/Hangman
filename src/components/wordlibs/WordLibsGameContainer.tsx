import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';
import {
  WordLibsPlayer,
  WordLibsRoom,
  WordLibsSettings,
  WordLibsVoteCategory
} from '../../types/wordLibs';
import { wordLibsClient } from '../../services/wordLibsClient';
import { sound } from '../../utils/audio';

import { WordLibsHome } from './WordLibsHome';
import { WordLibsCreateRoomModal } from './WordLibsCreateRoomModal';
import { WordLibsJoinRoomModal } from './WordLibsJoinRoomModal';
import { WordLibsHowToPlayModal } from './WordLibsHowToPlayModal';
import { WordLibsLeaveConfirmationModal } from './WordLibsLeaveConfirmationModal';
import { WordLibsLobbyView } from './WordLibsLobbyView';
import { WordLibsAnsweringView } from './WordLibsAnsweringView';
import { WordLibsStoryRevealView } from './WordLibsStoryRevealView';
import { WordLibsVotingView } from './WordLibsVotingView';
import { WordLibsRoundResultsView } from './WordLibsRoundResultsView';
import { WordLibsFinalResultsView } from './WordLibsFinalResultsView';
import { ArrowLeft, Copy, Check, Flame } from 'lucide-react';

interface WordLibsGameContainerProps {
  userProfile: UserProfile;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onReturnToGameHub: () => void;
  initialRoomCode?: string | null;
}

export const WordLibsGameContainer: React.FC<WordLibsGameContainerProps> = ({
  userProfile,
  sfxEnabled,
  onToggleSfx,
  onReturnToGameHub,
  initialRoomCode
}) => {
  const [currentRoom, setCurrentRoom] = useState<WordLibsRoom | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Loading flags
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isQuickMatching, setIsQuickMatching] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);

  // Floating reactions
  const [reactions, setReactions] = useState<
    Array<{ id: string; emoji: string; playerName: string; x: number }>
  >([]);

  const unsubscribeStreamRef = useRef<(() => void) | null>(null);

  // Synchronize room via SSE stream
  const connectToRoomStream = useCallback((code: string, playerId: string) => {
    if (unsubscribeStreamRef.current) {
      unsubscribeStreamRef.current();
      unsubscribeStreamRef.current = null;
    }

    unsubscribeStreamRef.current = wordLibsClient.subscribeToRoom(
      code,
      playerId,
      (updatedRoom) => {
        setCurrentRoom(updatedRoom);
      },
      (reaction) => {
        const id = `${Date.now()}_${Math.random()}`;
        const x = Math.floor(Math.random() * 60) + 20;
        setReactions((prev) => [...prev, { id, emoji: reaction.emoji, playerName: reaction.playerName, x }]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 3000);
      }
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeStreamRef.current) {
        unsubscribeStreamRef.current();
        unsubscribeStreamRef.current = null;
      }
    };
  }, []);

  // If passed initialRoomCode from GameHub
  useEffect(() => {
    if (initialRoomCode) {
      handleJoinRoom(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Create Room
  const handleCreateRoom = async (settings: WordLibsSettings, isPublic: boolean) => {
    setIsCreating(true);
    try {
      const { room, player } = await wordLibsClient.createRoom(userProfile, settings, isPublic);
      setCurrentRoom(room);
      setLocalPlayerId(player.id);
      setIsCreateOpen(false);
      connectToRoomStream(room.code, player.id);
      sound.fanfare();
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  // Join Room
  const handleJoinRoom = async (code: string) => {
    setIsJoining(true);
    setJoinError(null);
    try {
      const { room, player } = await wordLibsClient.joinRoom(code, userProfile);
      setCurrentRoom(room);
      setLocalPlayerId(player.id);
      setIsJoinOpen(false);
      connectToRoomStream(room.code, player.id);
      sound.pop();
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join room');
      sound.wrong();
    } finally {
      setIsJoining(false);
    }
  };

  // Quick Match
  const handleQuickMatch = async () => {
    setIsQuickMatching(true);
    try {
      const { room, player } = await wordLibsClient.quickMatch(userProfile);
      setCurrentRoom(room);
      setLocalPlayerId(player.id);
      connectToRoomStream(room.code, player.id);
      sound.pop();
    } catch (err: any) {
      alert(err.message || 'Quick match failed');
    } finally {
      setIsQuickMatching(false);
    }
  };

  // Toggle Ready
  const handleToggleReady = async () => {
    if (!currentRoom || !localPlayerId) return;
    try {
      const room = await wordLibsClient.toggleReady(currentRoom.code, localPlayerId);
      setCurrentRoom(room);
    } catch (err) {
      console.error(err);
    }
  };

  // Start Game (Host)
  const handleStartGame = async () => {
    if (!currentRoom || !localPlayerId) return;
    setIsStarting(true);
    try {
      const room = await wordLibsClient.startGame(currentRoom.code, localPlayerId);
      setCurrentRoom(room);
    } catch (err: any) {
      alert(err.message || 'Could not start game');
    } finally {
      setIsStarting(false);
    }
  };

  // Submit Answers
  const handleSubmitAnswers = async (answers: Record<string, string>) => {
    if (!currentRoom || !localPlayerId) return;
    setIsSubmitting(true);
    try {
      const room = await wordLibsClient.submitAnswers(currentRoom.code, localPlayerId, answers);
      setCurrentRoom(room);
    } catch (err: any) {
      alert(err.message || 'Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advance Reveal
  const handleAdvanceReveal = async () => {
    if (!currentRoom) return;
    try {
      const room = await wordLibsClient.advanceReveal(currentRoom.code);
      setCurrentRoom(room);
    } catch (err) {
      console.error(err);
    }
  };

  // Skip Reveal
  const handleSkipReveal = async () => {
    if (!currentRoom) return;
    try {
      const room = await wordLibsClient.skipReveal(currentRoom.code);
      setCurrentRoom(room);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Vote
  const handleSubmitVote = async (category: WordLibsVoteCategory, targetStoryId: string) => {
    if (!currentRoom || !localPlayerId) return;
    try {
      const room = await wordLibsClient.submitVote(currentRoom.code, localPlayerId, category, targetStoryId);
      setCurrentRoom(room);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Next Round
  const handleNextRound = async () => {
    if (!currentRoom || !localPlayerId) return;
    setIsNextLoading(true);
    try {
      const room = await wordLibsClient.nextRound(currentRoom.code, localPlayerId);
      setCurrentRoom(room);
    } catch (err: any) {
      alert(err.message || 'Could not advance to next round');
    } finally {
      setIsNextLoading(false);
    }
  };

  // Play Again
  const handlePlayAgain = async () => {
    if (!currentRoom) return;
    try {
      const room = await wordLibsClient.playAgain(currentRoom.code);
      setCurrentRoom(room);
      sound.fanfare();
    } catch (err) {
      console.error(err);
    }
  };

  // Leave Room action
  const handleLeaveRoom = async () => {
    if (currentRoom && localPlayerId) {
      await wordLibsClient.leaveRoom(currentRoom.code, localPlayerId);
    }
    if (unsubscribeStreamRef.current) {
      unsubscribeStreamRef.current();
      unsubscribeStreamRef.current = null;
    }
    setCurrentRoom(null);
    setLocalPlayerId(null);
    setIsLeaveConfirmOpen(false);
  };

  // Top Nav Back click
  const handleHeaderBack = () => {
    if (!currentRoom || currentRoom.status === 'waiting' || currentRoom.status === 'finished') {
      handleLeaveRoom();
      onReturnToGameHub();
    } else {
      // In active match, require confirmation!
      setIsLeaveConfirmOpen(true);
    }
  };

  // Send Reaction
  const handleSendReaction = (emoji: string) => {
    if (!currentRoom || !localPlayerId) return;
    sound.pop();
    wordLibsClient.sendReaction(currentRoom.code, localPlayerId, userProfile.name, emoji);
  };

  // ==========================================
  // VIEW ROUTING
  // ==========================================
  if (!currentRoom) {
    return (
      <>
        <WordLibsHome
          userProfile={userProfile}
          sfxEnabled={sfxEnabled}
          onToggleSfx={onToggleSfx}
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenJoin={() => {
            setJoinError(null);
            setIsJoinOpen(true);
          }}
          onQuickMatch={handleQuickMatch}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onReturnToGameHub={onReturnToGameHub}
          onDirectJoinRoom={handleJoinRoom}
          isQuickMatching={isQuickMatching}
        />

        <WordLibsCreateRoomModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreateRoom={handleCreateRoom}
          isLoading={isCreating}
        />

        <WordLibsJoinRoomModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onJoinRoom={handleJoinRoom}
          isLoading={isJoining}
          error={joinError}
        />

        <WordLibsHowToPlayModal
          isOpen={isHowToPlayOpen}
          onClose={() => setIsHowToPlayOpen(false)}
        />
      </>
    );
  }

  // Active in-room view with dedicated top bar
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Warm Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: -180, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              style={{ left: `${r.x}%`, bottom: '20%' }}
              className="absolute flex flex-col items-center"
            >
              <span className="text-4xl filter drop-shadow-lg">{r.emoji}</span>
              <span className="text-[10px] font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded text-amber-300 border border-amber-500/30 mt-1">
                {r.playerName}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* In-Room Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="wordlibs-room-header-back-btn"
            onClick={handleHeaderBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>GAME HUB</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono text-xs text-slate-300 hidden sm:inline">
              ROOM: <b className="text-amber-400 font-black">{currentRoom.code}</b>
            </span>
          </div>
        </div>

        {/* Emoji Reactions Bar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {['😂', '🔥', '🤯', '💀', '👏', '💩'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-base hover:scale-125 transition-transform"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </header>

      {/* Main Game Screen depending on Room status */}
      <main className="flex-1 flex flex-col justify-center">
        {currentRoom.status === 'waiting' && (
          <WordLibsLobbyView
            room={currentRoom}
            localPlayerId={localPlayerId || ''}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onLeaveRoom={handleHeaderBack}
            isStarting={isStarting}
          />
        )}

        {currentRoom.status === 'answering' && (
          <WordLibsAnsweringView
            room={currentRoom}
            localPlayerId={localPlayerId || ''}
            onSubmitAnswers={handleSubmitAnswers}
            isSubmitting={isSubmitting}
          />
        )}

        {currentRoom.status === 'revealing' && (
          <WordLibsStoryRevealView
            room={currentRoom}
            localPlayerId={localPlayerId || ''}
            onAdvanceReveal={handleAdvanceReveal}
            onSkipReveal={handleSkipReveal}
          />
        )}

        {currentRoom.status === 'voting' && (
          <WordLibsVotingView
            room={currentRoom}
            localPlayerId={localPlayerId || ''}
            onSubmitVote={handleSubmitVote}
          />
        )}

        {currentRoom.status === 'round_results' && (
          <WordLibsRoundResultsView
            room={currentRoom}
            localPlayerId={localPlayerId || ''}
            onNextRound={handleNextRound}
            isNextLoading={isNextLoading}
          />
        )}

        {currentRoom.status === 'finished' && (
          <WordLibsFinalResultsView
            room={currentRoom}
            localPlayerId={localPlayerId || ''}
            onPlayAgain={handlePlayAgain}
            onReturnToGameHub={onReturnToGameHub}
          />
        )}
      </main>

      {/* Leave Confirmation Modal */}
      <WordLibsLeaveConfirmationModal
        isOpen={isLeaveConfirmOpen}
        onStay={() => setIsLeaveConfirmOpen(false)}
        onLeave={() => {
          handleLeaveRoom();
          onReturnToGameHub();
        }}
      />
    </div>
  );
};
