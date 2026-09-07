import type { Response } from 'express';
import {
  ActivityEvent,
  Category,
  Difficulty,
  FloatingReaction,
  MultiplayerGameMode,
  Player,
  ReactionEmoji,
  Room,
  RoomPhase,
  RoomSettings,
  UserProfile
} from '../src/types';
import { getRandomWord } from '../src/data/words';

export interface ServerRoom extends Room {
  turnTimer?: NodeJS.Timeout;
}

class RoomManager {
  private rooms: Map<string, ServerRoom> = new Map();
  private sseClients: Map<string, Map<string, Response>> = new Map(); // roomCode -> (playerId -> Response)
  private playerHeartbeats: Map<string, number> = new Map(); // playerId -> timestamp
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run periodic cleanup for stale connections and empty rooms every 5 seconds
    this.cleanupInterval = setInterval(() => {
      this.sweepInactiveConnections();
    }, 5000);
  }

  /**
   * Generates a collision-free 6-character room code
   */
  public generateUniqueRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (0, O, 1, I)
    let code = '';
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (this.rooms.has(code) && attempts < 1000);

    return code;
  }

  public hasRoom(code: string): boolean {
    return this.rooms.has(code.toUpperCase());
  }

  /**
   * Returns list of public rooms currently waiting in the lobby with open slots
   */
  public getPublicLobbies(): Array<{ code: string; playerCount: number; maxPlayers: number; category: string; mode: string }> {
    const list: Array<{ code: string; playerCount: number; maxPlayers: number; category: string; mode: string }> = [];
    for (const [code, room] of this.rooms.entries()) {
      if (room.isPublic && room.phase === 'lobby' && room.players.length < room.settings.maxPlayers) {
        list.push({
          code,
          playerCount: room.players.length,
          maxPlayers: room.settings.maxPlayers,
          category: room.settings.category,
          mode: room.settings.mode
        });
      }
    }
    return list;
  }

  /**
   * Get server stats (total players online, total active rooms)
   */
  public getStats(): { onlinePlayers: number; activeRooms: number } {
    let onlineCount = 0;
    for (const room of this.rooms.values()) {
      onlineCount += room.players.filter((p) => p.connectionStatus === 'connected').length;
    }
    return {
      onlinePlayers: Math.max(onlineCount, 1),
      activeRooms: this.rooms.size
    };
  }

  /**
   * Creates a new private or public room with the creator as Host
   */
  public createRoom(
    hostProfile: UserProfile,
    settings: RoomSettings,
    isPublic: boolean = true
  ): { room: Room; player: Player } {
    const code = this.generateUniqueRoomCode();
    const wordInfo = getRandomWord(settings.category, settings.difficulty);

    const hostPlayer: Player = {
      id: hostProfile.id,
      name: hostProfile.name,
      avatar: hostProfile.avatar || '🎮',
      isHost: true,
      isReady: true,
      isLocal: false, // will be evaluated on client
      score: 0,
      roundScore: 0,
      connectionStatus: 'connected',
      lives: settings.mode === 'survival' ? 3 : 1,
      isEliminated: false,
      color: '#22d3ee',
      currentStreak: 0
    };

    const totalRounds = settings.roundLimit === 'unlimited' ? 0 : settings.roundLimit;

    const newRoom: ServerRoom = {
      code,
      hostId: hostPlayer.id,
      settings,
      players: [hostPlayer],
      currentRound: 1,
      totalRounds,
      phase: 'lobby',
      currentWord: wordInfo.word,
      currentHint: wordInfo.hint,
      currentCategory: wordInfo.category,
      guessedLetters: [],
      mistakes: 0,
      activePlayerIndex: 0,
      turnTimeRemaining: settings.turnDuration,
      turnStartedAt: Date.now(),
      isPublic
    };

    this.rooms.set(code, newRoom);
    this.recordHeartbeat(code, hostPlayer.id);

    return { room: this.serializeRoom(newRoom), player: hostPlayer };
  }

  /**
   * Join an existing room with room code and player profile
   */
  public joinRoom(
    code: string,
    playerProfile: UserProfile
  ): { success: boolean; error?: string; room?: Room; player?: Player } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) {
      return { success: false, error: `Room "${code}" not found. Please verify the code and try again.` };
    }

    // Check if player is reconnecting
    const existingPlayer = room.players.find((p) => p.id === playerProfile.id);
    if (existingPlayer) {
      existingPlayer.connectionStatus = 'connected';
      existingPlayer.name = playerProfile.name;
      existingPlayer.avatar = playerProfile.avatar || existingPlayer.avatar;
      this.recordHeartbeat(room.code, existingPlayer.id);
      this.broadcast(room.code, {
        type: 'ACTIVITY',
        event: {
          id: 'ev_rec_' + Date.now(),
          playerId: existingPlayer.id,
          playerName: existingPlayer.name,
          type: 'reconnect',
          text: `${existingPlayer.name} reconnected to the room.`,
          timestamp: Date.now()
        }
      });
      this.broadcastRoom(room.code);
      return { success: true, room: this.serializeRoom(room), player: existingPlayer };
    }

    // Check if room is full
    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: `Room "${code}" is full (maximum ${room.settings.maxPlayers} players).` };
    }

    // Check if game is in progress
    if (room.phase !== 'lobby') {
      return { success: false, error: `Game is already in progress in room "${code}".` };
    }

    // Assign a distinct color
    const playerColors = ['#22d3ee', '#c084fc', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#38bdf8', '#f43f5e'];
    const assignedColor = playerColors[room.players.length % playerColors.length];

    const newPlayer: Player = {
      id: playerProfile.id,
      name: playerProfile.name || `Player ${room.players.length + 1}`,
      avatar: playerProfile.avatar || '👤',
      isHost: false,
      isReady: false,
      isLocal: false,
      score: 0,
      roundScore: 0,
      connectionStatus: 'connected',
      lives: room.settings.mode === 'survival' ? 3 : 1,
      isEliminated: false,
      color: assignedColor,
      currentStreak: 0
    };

    room.players.push(newPlayer);
    this.recordHeartbeat(room.code, newPlayer.id);

    this.broadcast(room.code, {
      type: 'ACTIVITY',
      event: {
        id: 'ev_join_' + Date.now(),
        playerId: newPlayer.id,
        playerName: newPlayer.name,
        type: 'connect',
        text: `${newPlayer.name} joined the lobby.`,
        timestamp: Date.now()
      }
    });

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room), player: newPlayer };
  }

  /**
   * Match into an existing public lobby room, or create a new public one
   */
  public quickMatch(playerProfile: UserProfile): { room: Room; player: Player } {
    for (const [code, room] of this.rooms.entries()) {
      if (room.isPublic && room.phase === 'lobby' && room.players.length < room.settings.maxPlayers) {
        const joinResult = this.joinRoom(code, playerProfile);
        if (joinResult.success && joinResult.room && joinResult.player) {
          return { room: joinResult.room, player: joinResult.player };
        }
      }
    }

    // No open public room available: create a new public one
    const defaultSettings: RoomSettings = {
      mode: 'classic',
      category: 'Technology',
      difficulty: 'medium',
      maxPlayers: 4,
      roundLimit: 5,
      turnDuration: 15
    };
    return this.createRoom(playerProfile, defaultSettings, true);
  }

  /**
   * Reconnect an existing player (e.g. after browser refresh)
   */
  public reconnectPlayer(code: string, playerId: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) {
      return { success: false, error: 'Room does not exist anymore.' };
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found in this room.' };
    }

    player.connectionStatus = 'connected';
    this.recordHeartbeat(room.code, playerId);

    this.broadcast(room.code, {
      type: 'ACTIVITY',
      event: {
        id: 'ev_rec_' + Date.now(),
        playerId: player.id,
        playerName: player.name,
        type: 'reconnect',
        text: `${player.name} reconnected.`,
        timestamp: Date.now()
      }
    });

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Toggle player ready status in lobby
   */
  public toggleReady(code: string, playerId: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not in room.' };

    player.isReady = !player.isReady;
    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Start game match (Host authoritative)
   */
  public startGame(code: string, hostId: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.hostId !== hostId) return { success: false, error: 'Only the room host can start the game.' };
    if (room.players.length < 1) return { success: false, error: 'Cannot start with 0 players.' };

    const wordInfo = getRandomWord(room.settings.category, room.settings.difficulty);

    room.phase = 'playing';
    room.currentWord = wordInfo.word;
    room.currentHint = wordInfo.hint;
    room.currentCategory = wordInfo.category;
    room.guessedLetters = [];
    room.mistakes = 0;
    room.activePlayerIndex = 0;
    room.turnTimeRemaining = room.settings.turnDuration;
    room.turnStartedAt = Date.now();
    room.players = room.players.map((p) => ({
      ...p,
      roundScore: 0,
      isEliminated: false,
      lives: room.settings.mode === 'survival' ? 3 : 1
    }));

    // Start server-authoritative turn loop
    this.startRoomTurnTimer(room);

    this.broadcast(room.code, {
      type: 'ACTIVITY',
      event: {
        id: 'ev_start_' + Date.now(),
        playerId: 'sys',
        playerName: 'System',
        type: 'connect',
        text: `Match started! Round 1 - Category: ${wordInfo.category}`,
        timestamp: Date.now()
      }
    });

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Authoritative letter guess validation and game state update
   */
  public guessLetter(
    code: string,
    playerId: string,
    rawLetter: string
  ): { success: boolean; error?: string; room?: Room; isCorrect?: boolean; feedback?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.phase !== 'playing') return { success: false, error: 'Game is not currently in progress.' };

    const activePlayer = room.players[room.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== playerId) {
      return { success: false, error: "It's not your turn!" };
    }

    if (activePlayer.isEliminated) {
      return { success: false, error: 'You are eliminated in this round.' };
    }

    const letter = rawLetter.toUpperCase();
    if (!/^[A-Z]$/.test(letter)) {
      return { success: false, error: 'Invalid character. Must be A-Z.' };
    }

    if (room.guessedLetters.includes(letter)) {
      return { success: false, error: `Letter "${letter}" has already been guessed.` };
    }

    // Add letter to guessed list
    room.guessedLetters.push(letter);
    const isCorrect = room.currentWord.includes(letter);

    if (isCorrect) {
      // Correct guess: award points and streak
      const letterPoints = 10;
      activePlayer.score += letterPoints;
      activePlayer.roundScore += letterPoints;
      activePlayer.currentStreak += 1;

      this.broadcast(room.code, {
        type: 'ACTIVITY',
        event: {
          id: 'ev_g_' + Date.now(),
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          type: 'guess_correct',
          text: `${activePlayer.name} guessed ${letter} ✓`,
          timestamp: Date.now(),
          isCorrect: true
        }
      });

      // Check if all letters in currentWord have been solved
      const isWordSolved = room.currentWord
        .split('')
        .every((char) => room.guessedLetters.includes(char) || char === ' ');

      if (isWordSolved) {
        // Complete Round!
        const solveBonus = 80;
        activePlayer.score += solveBonus;
        activePlayer.roundScore += solveBonus;

        this.stopRoomTurnTimer(room);

        const isMatchComplete = room.totalRounds > 0 && room.currentRound >= room.totalRounds;
        room.phase = isMatchComplete ? 'match_results' : 'round_results';

        this.broadcast(room.code, {
          type: 'ACTIVITY',
          event: {
            id: 'ev_solve_' + Date.now(),
            playerId: activePlayer.id,
            playerName: activePlayer.name,
            type: 'guess_correct',
            text: `🎉 ${activePlayer.name} solved the word: ${room.currentWord}!`,
            timestamp: Date.now(),
            isCorrect: true
          }
        });

        this.broadcastRoom(room.code);
        return {
          success: true,
          room: this.serializeRoom(room),
          isCorrect: true,
          feedback: `SOLVED! +90 (${letter})`
        };
      }

      // If word not solved, active player keeps turn with refreshed timer!
      room.turnTimeRemaining = room.settings.turnDuration;
      room.turnStartedAt = Date.now();

      this.broadcastRoom(room.code);
      return {
        success: true,
        room: this.serializeRoom(room),
        isCorrect: true,
        feedback: `CORRECT! +10 (${letter})`
      };
    } else {
      // Wrong guess: increment mistakes and deduct streak
      room.mistakes += 1;
      activePlayer.currentStreak = 0;

      this.broadcast(room.code, {
        type: 'ACTIVITY',
        event: {
          id: 'ev_g_' + Date.now(),
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          type: 'guess_wrong',
          text: `${activePlayer.name} guessed ${letter} ✕`,
          timestamp: Date.now(),
          isCorrect: false
        }
      });

      // In survival mode, deduct life
      if (room.settings.mode === 'survival') {
        activePlayer.lives = Math.max(0, activePlayer.lives - 1);
        if (activePlayer.lives === 0) {
          activePlayer.isEliminated = true;
          this.broadcast(room.code, {
            type: 'ACTIVITY',
            event: {
              id: 'ev_elim_' + Date.now(),
              playerId: activePlayer.id,
              playerName: activePlayer.name,
              type: 'eliminated',
              text: `💀 ${activePlayer.name} lost all lives and was ELIMINATED!`,
              timestamp: Date.now()
            }
          });
        }
      }

      // Check if Hangman is hung (7 mistakes) or survival mode has only 0/1 survivors left
      const activeSurvivors = room.players.filter((p) => !p.isEliminated);
      const isGallowsComplete = room.mistakes >= 7;
      const isSurvivalOver = room.settings.mode === 'survival' && activeSurvivors.length <= (room.players.length > 1 ? 1 : 0);

      if (isGallowsComplete || isSurvivalOver) {
        this.stopRoomTurnTimer(room);
        const isMatchComplete = room.totalRounds > 0 && room.currentRound >= room.totalRounds;
        room.phase = isMatchComplete ? 'match_results' : 'round_results';

        this.broadcastRoom(room.code);
        return {
          success: true,
          room: this.serializeRoom(room),
          isCorrect: false,
          feedback: `WRONG: ${letter}`
        };
      }

      // Pass turn to next player
      this.advanceTurn(room, false);
      this.broadcastRoom(room.code);
      return {
        success: true,
        room: this.serializeRoom(room),
        isCorrect: false,
        feedback: `WRONG: ${letter}`
      };
    }
  }

  /**
   * Advance turn to the next non-eliminated player
   */
  private advanceTurn(room: ServerRoom, timeExpired: boolean = false): void {
    const numPlayers = room.players.length;
    if (numPlayers === 0) return;

    let nextIndex = (room.activePlayerIndex + 1) % numPlayers;

    // In survival mode, skip eliminated players
    if (room.settings.mode === 'survival') {
      let attempts = 0;
      while (room.players[nextIndex].isEliminated && attempts < numPlayers) {
        nextIndex = (nextIndex + 1) % numPlayers;
        attempts++;
      }
    }

    const prevPlayer = room.players[room.activePlayerIndex];
    const nextPlayer = room.players[nextIndex];

    room.activePlayerIndex = nextIndex;
    room.turnTimeRemaining = room.settings.turnDuration;
    room.turnStartedAt = Date.now();

    if (timeExpired && prevPlayer) {
      prevPlayer.currentStreak = 0;
      if (room.settings.mode === 'survival') {
        prevPlayer.lives = Math.max(0, prevPlayer.lives - 1);
        if (prevPlayer.lives === 0) {
          prevPlayer.isEliminated = true;
        }
      }
      this.broadcast(room.code, {
        type: 'ACTIVITY',
        event: {
          id: 'ev_to_' + Date.now(),
          playerId: prevPlayer.id,
          playerName: prevPlayer.name,
          type: 'timeout',
          text: `TIME'S UP for ${prevPlayer.name}! Turn passed to ${nextPlayer?.name || 'next player'}.`,
          timestamp: Date.now()
        }
      });
    }
  }

  /**
   * Starts next round in the match
   */
  public nextRound(code: string, hostId: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    const nextWordInfo = getRandomWord(room.settings.category, room.settings.difficulty);

    room.currentRound += 1;
    room.phase = 'playing';
    room.currentWord = nextWordInfo.word;
    room.currentHint = nextWordInfo.hint;
    room.currentCategory = nextWordInfo.category;
    room.guessedLetters = [];
    room.mistakes = 0;
    room.activePlayerIndex = 0;
    room.turnTimeRemaining = room.settings.turnDuration;
    room.turnStartedAt = Date.now();
    room.players = room.players.map((p) => ({
      ...p,
      roundScore: 0,
      isEliminated: false,
      lives: room.settings.mode === 'survival' ? 3 : 1
    }));

    this.startRoomTurnTimer(room);

    this.broadcast(room.code, {
      type: 'ACTIVITY',
      event: {
        id: 'ev_nr_' + Date.now(),
        playerId: 'sys',
        playerName: 'System',
        type: 'connect',
        text: `Starting Round ${room.currentRound}! Category: ${nextWordInfo.category}`,
        timestamp: Date.now()
      }
    });

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Reset match scores and start Round 1 again
   */
  public playAgain(code: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    const firstWordInfo = getRandomWord(room.settings.category, room.settings.difficulty);

    room.currentRound = 1;
    room.phase = 'playing';
    room.currentWord = firstWordInfo.word;
    room.currentHint = firstWordInfo.hint;
    room.currentCategory = firstWordInfo.category;
    room.guessedLetters = [];
    room.mistakes = 0;
    room.activePlayerIndex = 0;
    room.turnTimeRemaining = room.settings.turnDuration;
    room.turnStartedAt = Date.now();
    room.players = room.players.map((p) => ({
      ...p,
      score: 0,
      roundScore: 0,
      isEliminated: false,
      lives: room.settings.mode === 'survival' ? 3 : 1
    }));

    this.startRoomTurnTimer(room);
    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Return room back to lobby
   */
  public returnToLobby(code: string): { success: boolean; room?: Room; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    this.stopRoomTurnTimer(room);
    room.phase = 'lobby';
    room.currentRound = 1;
    room.guessedLetters = [];
    room.mistakes = 0;
    room.players = room.players.map((p) => ({
      ...p,
      roundScore: 0,
      isReady: p.isHost
    }));

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Player leaves room
   */
  public leaveRoom(code: string, playerId: string): { success: boolean; room?: Room | null } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: true, room: null };

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return { success: true, room: this.serializeRoom(room) };

    const leavingPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);

    // Remove SSE connection
    const clientMap = this.sseClients.get(room.code);
    if (clientMap) {
      clientMap.delete(playerId);
    }

    // If no players left, destroy room
    if (room.players.length === 0) {
      this.stopRoomTurnTimer(room);
      this.rooms.delete(room.code);
      this.sseClients.delete(room.code);
      return { success: true, room: null };
    }

    // If host left, promote next connected player to host
    if (leavingPlayer.isHost) {
      const newHost = room.players.find((p) => p.connectionStatus === 'connected') || room.players[0];
      if (newHost) {
        newHost.isHost = true;
        room.hostId = newHost.id;
        this.broadcast(room.code, {
          type: 'ACTIVITY',
          event: {
            id: 'ev_host_' + Date.now(),
            playerId: newHost.id,
            playerName: newHost.name,
            type: 'connect',
            text: `👑 ${newHost.name} is now the room host.`,
            timestamp: Date.now()
          }
        });
      }
    }

    // If leaving player was active in turn, advance turn
    if (room.phase === 'playing' && room.activePlayerIndex >= room.players.length) {
      room.activePlayerIndex = 0;
    }

    this.broadcast(room.code, {
      type: 'ACTIVITY',
      event: {
        id: 'ev_leave_' + Date.now(),
        playerId: leavingPlayer.id,
        playerName: leavingPlayer.name,
        type: 'disconnect',
        text: `${leavingPlayer.name} left the room.`,
        timestamp: Date.now()
      }
    });

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Broadcast quick emoji reaction to everyone in the room
   */
  public sendReaction(code: string, playerId: string, playerName: string, emoji: ReactionEmoji): void {
    const reactionId = 'react_' + Math.random().toString(36).substring(2, 9);
    const reactionPayload: FloatingReaction = {
      id: reactionId,
      playerId,
      playerName,
      emoji,
      timestamp: Date.now()
    };

    this.broadcast(code, {
      type: 'REACTION',
      reaction: reactionPayload
    });

    this.broadcast(code, {
      type: 'ACTIVITY',
      event: {
        id: 'act_react_' + Date.now(),
        playerId,
        playerName,
        type: 'reaction',
        text: `${playerName} reacted with ${emoji}`,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Register SSE response stream for a player
   */
  public registerSseClient(code: string, playerId: string, res: Response): void {
    const normalizedCode = code.toUpperCase();
    if (!this.sseClients.has(normalizedCode)) {
      this.sseClients.set(normalizedCode, new Map());
    }

    const roomClients = this.sseClients.get(normalizedCode)!;
    roomClients.set(playerId, res);

    this.recordHeartbeat(normalizedCode, playerId);

    // Send immediate room snapshot
    const room = this.rooms.get(normalizedCode);
    if (room) {
      const player = room.players.find((p) => p.id === playerId);
      if (player && player.connectionStatus !== 'connected') {
        player.connectionStatus = 'connected';
        this.broadcastRoom(normalizedCode);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'ROOM_SYNC', room: this.serializeRoom(room) })}\n\n`);
      }
    }

    res.on('close', () => {
      roomClients.delete(playerId);
      // Give 10-second grace period before marking disconnected
      setTimeout(() => {
        const stillConnected = roomClients.has(playerId);
        if (!stillConnected) {
          const currentRoom = this.rooms.get(normalizedCode);
          if (currentRoom) {
            const disconnectedPlayer = currentRoom.players.find((p) => p.id === playerId);
            if (disconnectedPlayer && disconnectedPlayer.connectionStatus === 'connected') {
              disconnectedPlayer.connectionStatus = 'disconnected';
              this.broadcast(normalizedCode, {
                type: 'ACTIVITY',
                event: {
                  id: 'ev_dc_' + Date.now(),
                  playerId: disconnectedPlayer.id,
                  playerName: disconnectedPlayer.name,
                  type: 'disconnect',
                  text: `${disconnectedPlayer.name} lost connection.`,
                  timestamp: Date.now()
                }
              });
              this.broadcastRoom(normalizedCode);
            }
          }
        }
      }, 10000);
    });
  }

  /**
   * Keepalive heartbeat ping from client
   */
  public recordHeartbeat(code: string, playerId: string): void {
    this.playerHeartbeats.set(playerId, Date.now());
    const room = this.rooms.get(code.toUpperCase());
    if (room) {
      const p = room.players.find((item) => item.id === playerId);
      if (p && p.connectionStatus !== 'connected') {
        p.connectionStatus = 'connected';
        this.broadcastRoom(room.code);
      }
    }
  }

  /**
   * Start master server-authoritative turn countdown
   */
  private startRoomTurnTimer(room: ServerRoom): void {
    this.stopRoomTurnTimer(room);

    room.turnTimer = setInterval(() => {
      if (room.phase !== 'playing') {
        this.stopRoomTurnTimer(room);
        return;
      }

      room.turnTimeRemaining -= 1;

      // Broadcast room update every second during active play
      if (room.turnTimeRemaining <= 0) {
        // Time expired! Advance turn authoritatively
        this.advanceTurn(room, true);
      }

      this.broadcastRoom(room.code);
    }, 1000);
  }

  /**
   * Stop room turn timer
   */
  private stopRoomTurnTimer(room: ServerRoom): void {
    if (room.turnTimer) {
      clearInterval(room.turnTimer);
      room.turnTimer = undefined;
    }
  }

  /**
   * Periodic sweep for disconnected players and idle rooms
   */
  private sweepInactiveConnections(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      let stateChanged = false;
      const clientMap = this.sseClients.get(code);

      for (const player of room.players) {
        const lastSeen = this.playerHeartbeats.get(player.id) || 0;
        const hasSse = clientMap?.has(player.id);

        if (!hasSse && now - lastSeen > 20000 && player.connectionStatus === 'connected') {
          player.connectionStatus = 'disconnected';
          stateChanged = true;

          // If active turn player disconnected, advance turn after grace
          if (room.phase === 'playing' && room.players[room.activePlayerIndex]?.id === player.id) {
            this.advanceTurn(room, true);
          }

          // If host disconnected, promote another player
          if (player.isHost) {
            const nextActive = room.players.find((p) => p.connectionStatus === 'connected' && p.id !== player.id);
            if (nextActive) {
              player.isHost = false;
              nextActive.isHost = true;
              room.hostId = nextActive.id;
            }
          }
        }
      }

      if (stateChanged) {
        this.broadcastRoom(code);
      }

      // Ping connected SSE sockets to keep NAT/proxy connection warm
      if (clientMap) {
        for (const res of clientMap.values()) {
          try {
            res.write(': ping\n\n');
          } catch {
            // Ignore closed sockets
          }
        }
      }
    }
  }

  /**
   * Broadcast raw event to all connected SSE clients in a room
   */
  private broadcast(code: string, payload: any): void {
    const clients = this.sseClients.get(code.toUpperCase());
    if (!clients) return;

    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const [playerId, res] of clients.entries()) {
      try {
        res.write(data);
      } catch (err) {
        clients.delete(playerId);
      }
    }
  }

  /**
   * Broadcast current room snapshot to all connected SSE clients
   */
  private broadcastRoom(code: string): void {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return;
    this.broadcast(code, {
      type: 'ROOM_SYNC',
      room: this.serializeRoom(room)
    });
  }

  /**
   * Strips internal server fields like timers before sending to clients
   */
  public serializeRoom(room: ServerRoom): Room {
    return {
      code: room.code,
      gameType: 'hangman',
      hostId: room.hostId,
      settings: room.settings,
      players: room.players,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      phase: room.phase,
      currentWord: room.currentWord,
      currentHint: room.currentHint,
      currentCategory: room.currentCategory,
      guessedLetters: room.guessedLetters,
      mistakes: room.mistakes,
      activePlayerIndex: room.activePlayerIndex,
      turnTimeRemaining: room.turnTimeRemaining,
      turnStartedAt: room.turnStartedAt,
      isPublic: room.isPublic
    };
  }
}

export const roomManager = new RoomManager();
