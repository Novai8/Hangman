import type { Response } from 'express';
import {
  WordLibsChaosEvent,
  WordLibsGameMode,
  WordLibsPlayer,
  WordLibsPrompt,
  WordLibsRoom,
  WordLibsSettings,
  WordLibsStory,
  WordLibsStoryTemplate,
  WordLibsTopic,
  WordLibsVoteCategory
} from '../src/types/wordLibs';
import { UserProfile } from '../src/types';
import {
  WORD_LIBS_PROMPTS,
  WORD_LIBS_STORIES,
  getRandomChaosEvent
} from '../src/data/wordLibsData';

export interface ServerWordLibsRoom extends WordLibsRoom {
  turnTimer?: NodeJS.Timeout;
  storyTemplate?: WordLibsStoryTemplate;
  // Raw player submissions: playerId -> { [promptKey]: sanitizedWord }
  rawSubmissions: Record<string, Record<string, string>>;
  // Raw votes: voterPlayerId -> { [category]: targetStoryId }
  rawVotes: Record<string, Partial<Record<WordLibsVoteCategory, string>>>;
}

const FUNNY_TITLES = [
  'CHAOS KING 👑',
  'WORD WIZARD 🧙',
  'MASTER OF BAD IDEAS 🤡',
  'PROFESSIONAL MENACE 😈',
  'PLOT TWIST MACHINE ⚡',
  'UNEXPECTED GENIUS 🧠',
  'UNHINGED STORYTELLER 🎭',
  'COMEDY ARCHITECT 🏛️'
];

class WordLibsRoomManager {
  private rooms: Map<string, ServerWordLibsRoom> = new Map();
  private sseClients: Map<string, Map<string, Response>> = new Map(); // roomCode -> (playerId -> Response)
  private playerHeartbeats: Map<string, number> = new Map(); // playerId -> timestamp
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.sweepInactiveConnections();
    }, 5000);
  }

  public hasRoom(code: string): boolean {
    return this.rooms.has(code.toUpperCase());
  }

  public generateUniqueRoomCode(existingChecker?: (code: string) => boolean): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
    } while (
      (this.rooms.has(code) || (existingChecker && existingChecker(code))) &&
      attempts < 1000
    );
    return code;
  }

  public getPublicLobbies(): Array<{
    code: string;
    playerCount: number;
    maxPlayers: number;
    topic: string;
    mode: string;
  }> {
    const list: Array<{
      code: string;
      playerCount: number;
      maxPlayers: number;
      topic: string;
      mode: string;
    }> = [];
    for (const [code, room] of this.rooms.entries()) {
      if (room.isPublic && room.phase === 'lobby' && room.players.length < room.settings.maxPlayers) {
        list.push({
          code,
          playerCount: room.players.length,
          maxPlayers: room.settings.maxPlayers,
          topic: room.settings.topic,
          mode: room.settings.mode
        });
      }
    }
    return list;
  }

  public createRoom(
    hostProfile: UserProfile,
    settings: WordLibsSettings,
    isPublic: boolean = true,
    codeOverride?: string
  ): { room: WordLibsRoom; player: WordLibsPlayer } {
    const code = codeOverride || this.generateUniqueRoomCode();

    const hostPlayer: WordLibsPlayer = {
      id: hostProfile.id,
      name: hostProfile.name,
      avatar: hostProfile.avatar || '🎮',
      isHost: true,
      isReady: true,
      isLocal: false,
      score: 0,
      roundScore: 0,
      connectionStatus: 'connected',
      color: '#f59e0b', // Warm golden tone for Word Libs
      currentStreak: 0,
      hasSubmitted: false
    };

    const newRoom: ServerWordLibsRoom = {
      code,
      gameType: 'wordlibs',
      hostId: hostPlayer.id,
      settings,
      players: [hostPlayer],
      currentRound: 1,
      totalRounds: settings.rounds,
      phase: 'lobby',
      activeChaosEvent: 'none',
      storyTitle: 'Story Lobby',
      currentPrompts: [],
      currentPromptIndex: 0,
      timeRemaining: settings.timerDuration !== undefined ? settings.timerDuration : 45,
      timerStartedAt: Date.now(),
      submittedPlayerIds: [],
      revealedStories: [],
      allMatchStories: [],
      currentRevealParagraph: 0,
      totalParagraphs: 0,
      votesReceived: {
        funniest: {},
        most_unexpected: {},
        most_chaotic: {},
        best_story: {},
        most_unhinged: {},
        best_plot_twist: {},
        most_questionable: {}
      },
      rawSubmissions: {},
      rawVotes: {},
      isPublic
    };

    this.rooms.set(code, newRoom);
    this.recordHeartbeat(code, hostPlayer.id);

    return { room: this.serializeRoom(newRoom), player: hostPlayer };
  }

  public joinRoom(
    code: string,
    playerProfile: UserProfile
  ): { success: boolean; error?: string; room?: WordLibsRoom; player?: WordLibsPlayer } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) {
      return { success: false, error: `Word Libs room "${code}" not found.` };
    }

    const existingPlayer = room.players.find((p) => p.id === playerProfile.id);
    if (existingPlayer) {
      existingPlayer.connectionStatus = 'connected';
      existingPlayer.name = playerProfile.name;
      existingPlayer.avatar = playerProfile.avatar || existingPlayer.avatar;
      this.recordHeartbeat(room.code, existingPlayer.id);
      this.broadcastRoom(room.code);
      return { success: true, room: this.serializeRoom(room), player: existingPlayer };
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: `Room "${code}" is full (${room.settings.maxPlayers} players).` };
    }

    if (room.phase !== 'lobby') {
      return { success: false, error: `Match in room "${code}" has already started.` };
    }

    const playerColors = ['#f59e0b', '#ec4899', '#a855f7', '#38bdf8', '#10b981', '#f97316', '#e11d48', '#8b5cf6'];
    const assignedColor = playerColors[room.players.length % playerColors.length];

    const newPlayer: WordLibsPlayer = {
      id: playerProfile.id,
      name: playerProfile.name || `Story Teller ${room.players.length + 1}`,
      avatar: playerProfile.avatar || '✍️',
      isHost: false,
      isReady: false,
      isLocal: false,
      score: 0,
      roundScore: 0,
      connectionStatus: 'connected',
      color: assignedColor,
      currentStreak: 0,
      hasSubmitted: false
    };

    room.players.push(newPlayer);
    this.recordHeartbeat(room.code, newPlayer.id);
    this.broadcastRoom(room.code);

    return { success: true, room: this.serializeRoom(room), player: newPlayer };
  }

  public quickMatch(playerProfile: UserProfile): { room: WordLibsRoom; player: WordLibsPlayer } {
    for (const [code, room] of this.rooms.entries()) {
      if (room.isPublic && room.phase === 'lobby' && room.players.length < room.settings.maxPlayers) {
        const joinRes = this.joinRoom(code, playerProfile);
        if (joinRes.success && joinRes.room && joinRes.player) {
          return { room: joinRes.room, player: joinRes.player };
        }
      }
    }

    // Create default public room
    const defaultSettings: WordLibsSettings = {
      mode: 'classic',
      topic: 'Random',
      maxPlayers: 6,
      rounds: 5,
      timerDuration: 45
    };
    return this.createRoom(playerProfile, defaultSettings, true);
  }

  public reconnectPlayer(code: string, playerId: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room does not exist anymore.' };

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found in room.' };

    player.connectionStatus = 'connected';
    this.recordHeartbeat(room.code, playerId);
    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  public toggleReady(code: string, playerId: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not in room.' };

    player.isReady = !player.isReady;
    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Allow Host to update room settings (e.g. timerDuration, topic, rounds) from the lobby
   */
  public updateRoomSettings(
    code: string,
    hostId: string,
    settingsUpdate: Partial<WordLibsSettings>
  ): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.hostId !== hostId) return { success: false, error: 'Only the host can adjust room settings.' };
    if (room.phase !== 'lobby') return { success: false, error: 'Settings can only be changed before the game begins.' };

    room.settings = {
      ...room.settings,
      ...settingsUpdate
    };

    if (settingsUpdate.rounds !== undefined) {
      room.totalRounds = settingsUpdate.rounds;
    }
    if (settingsUpdate.timerDuration !== undefined) {
      room.timeRemaining = settingsUpdate.timerDuration;
    }

    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Helper to pick story template and corresponding prompts
   */
  private setupRoundContent(room: ServerWordLibsRoom): void {
    let eligibleStories = WORD_LIBS_STORIES;
    if (room.settings.topic !== 'Random') {
      const topicMatches = WORD_LIBS_STORIES.filter(
        (s) => s.topic.toLowerCase() === room.settings.topic.toLowerCase()
      );
      if (topicMatches.length > 0) {
        eligibleStories = topicMatches;
      }
    }

    const template = eligibleStories[Math.floor(Math.random() * eligibleStories.length)] || WORD_LIBS_STORIES[0];
    room.storyTemplate = template;
    room.storyTitle = template.title;

    // Pick prompts corresponding to the template's required keys
    const prompts: WordLibsPrompt[] = [];
    for (const key of template.requiredPromptKeys) {
      const found = WORD_LIBS_PROMPTS.find((p) => p.key === key);
      if (found) {
        prompts.push(found);
      } else {
        // Fallback generic creative prompt
        prompts.push({
          id: `p_${key}`,
          key,
          promptText: `Enter an unexpected, hilarious word or phrase for: ${key.replace(/_/g, ' ')}`,
          inputType: 'random_object'
        });
      }
    }

    // In 'one_word' mode or random chaos, limit prompt count or modify
    room.currentPrompts = prompts;
    room.totalParagraphs = template.paragraphs.length;
    room.currentRevealParagraph = 0;
    room.revealedStories = [];
    room.submittedPlayerIds = [];
    room.rawSubmissions = {};
    room.rawVotes = {};
    room.votesReceived = {
      funniest: {},
      most_unexpected: {},
      most_chaotic: {},
      best_story: {},
      most_unhinged: {},
      best_plot_twist: {},
      most_questionable: {}
    };

    // Determine chaos modifier
    if (room.settings.mode === 'random_chaos') {
      room.activeChaosEvent = getRandomChaosEvent() as WordLibsChaosEvent;
    } else if (room.settings.mode === 'one_word') {
      room.activeChaosEvent = 'one_word_only';
    } else if (room.settings.mode === 'speed') {
      room.activeChaosEvent = 'speed_round';
    } else if (room.settings.mode === 'secret') {
      room.activeChaosEvent = 'secret_bonus';
    } else {
      // 25% chance of random chaos event in classic
      room.activeChaosEvent = Math.random() < 0.25 ? (getRandomChaosEvent() as WordLibsChaosEvent) : 'none';
    }

    // Reset player round status
    for (const p of room.players) {
      p.hasSubmitted = false;
      p.roundScore = 0;
    }

    let timerDuration = room.settings.timerDuration !== undefined ? room.settings.timerDuration : 45;
    if (timerDuration > 0) {
      if (room.activeChaosEvent === 'speed_round') {
        timerDuration = 20;
      } else if (room.activeChaosEvent === 'last_second') {
        timerDuration = 15;
      }
    }
    room.timeRemaining = timerDuration;
    room.timerStartedAt = Date.now();
  }

  public startGame(code: string, hostId: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.hostId !== hostId) return { success: false, error: 'Only the host can start the match.' };

    room.currentRound = 1;
    room.phase = 'answering';
    for (const p of room.players) {
      p.score = 0;
      p.currentStreak = 0;
    }

    this.setupRoundContent(room);
    this.startRoundTimer(room);
    this.broadcastRoom(room.code);

    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Submit secret answers from a player
   */
  public submitAnswers(
    code: string,
    playerId: string,
    answers: Record<string, string>
  ): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.phase !== 'answering') return { success: false, error: 'Not in answering phase.' };

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found in room.' };

    // Sanitize user inputs (limit length to 60 characters, strip HTML tags)
    const sanitized: Record<string, string> = {};
    for (const [k, val] of Object.entries(answers)) {
      if (typeof val === 'string') {
        const clean = val.replace(/<[^>]*>?/gm, '').trim().substring(0, 60);
        sanitized[k] = clean || 'Mystery Object';
      }
    }

    room.rawSubmissions[playerId] = sanitized;
    player.hasSubmitted = true;
    if (!room.submittedPlayerIds.includes(playerId)) {
      room.submittedPlayerIds.push(playerId);
    }

    // Check if all connected players have submitted
    const connectedPlayers = room.players.filter((p) => p.connectionStatus === 'connected');
    const allSubmitted = connectedPlayers.every((p) => room.submittedPlayerIds.includes(p.id));

    if (allSubmitted && connectedPlayers.length > 0) {
      this.compileStoriesAndReveal(room);
    } else {
      this.broadcastRoom(room.code);
    }

    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Compile stories from submitted answers and transition to reveal phase
   */
  private compileStoriesAndReveal(room: ServerWordLibsRoom): void {
    this.stopTimer(room);

    const template = room.storyTemplate || WORD_LIBS_STORIES[0];
    const playerList = room.players.filter((p) => p.connectionStatus === 'connected');

    const generatedStories: WordLibsStory[] = [];

    if (room.settings.mode === 'battle') {
      // In Battle mode: Generate each player's story constructed directly from THEIR OWN submitted answers.
      // Every player's story accurately represents what they submitted.
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      playerList.forEach((p, idx) => {
        const pAnswers = room.rawSubmissions[p.id] || {};
        const insertedMap: Record<string, { word: string; submitterName?: string; submitterId?: string }> = {};

        // Fill template paragraphs using p's own answers
        const filledParagraphs = template.paragraphs.map((para) => {
          let text = para;
          template.requiredPromptKeys.forEach((key) => {
            const word = (pAnswers[key] || 'something strange').trim();
            insertedMap[key] = { word, submitterName: p.name, submitterId: p.id };
            text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), word.toUpperCase());
          });
          return text;
        });

        generatedStories.push({
          id: `story_${p.id}`,
          authorPlayerId: p.id,
          authorAnonymousLabel: `Story ${letters[idx] || (idx + 1)} (Anonymous)`,
          authorRealName: p.name,
          title: template.title,
          paragraphs: filledParagraphs,
          insertedWords: insertedMap
        });
      });
    } else {
      // Classic / Team / Shared mode: Collaborative collective story
      // Blend answers from across all players
      const insertedMap: Record<string, { word: string; submitterName?: string; submitterId?: string }> = {};
      const keys = template.requiredPromptKeys;

      keys.forEach((key, kIdx) => {
        // Pick answer from available players in round-robin fashion
        const contributingPlayer = playerList[kIdx % playerList.length];
        const word = (contributingPlayer && room.rawSubmissions[contributingPlayer.id]?.[key]) || 'Mysterious Object';
        insertedMap[key] = {
          word,
          submitterName: contributingPlayer ? contributingPlayer.name : 'Unknown',
          submitterId: contributingPlayer ? contributingPlayer.id : undefined
        };
      });

      const filledParagraphs = template.paragraphs.map((para) => {
        let text = para;
        for (const key of keys) {
          const item = insertedMap[key];
          if (item) {
            text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), item.word.toUpperCase());
          }
        }
        return text;
      });

      generatedStories.push({
        id: `story_collab_${room.currentRound}`,
        authorAnonymousLabel: 'Collective Tale',
        title: template.title,
        paragraphs: filledParagraphs,
        insertedWords: insertedMap
      });

      // Also construct each individual player's story using their own answers for review
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      playerList.forEach((p, idx) => {
        const pAnswers = room.rawSubmissions[p.id] || {};
        const pInsertedMap: Record<string, { word: string; submitterName?: string; submitterId?: string }> = {};

        const pParagraphs = template.paragraphs.map((para) => {
          let text = para;
          template.requiredPromptKeys.forEach((key) => {
            const word = (pAnswers[key] || 'something strange').trim();
            pInsertedMap[key] = { word, submitterName: p.name, submitterId: p.id };
            text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), word.toUpperCase());
          });
          return text;
        });

        if (!room.allMatchStories) room.allMatchStories = [];
        room.allMatchStories.push({
          id: `story_player_${p.id}_r${room.currentRound}`,
          authorPlayerId: p.id,
          authorAnonymousLabel: `Story ${letters[idx] || (idx + 1)}`,
          authorRealName: p.name,
          title: template.title,
          paragraphs: pParagraphs,
          insertedWords: pInsertedMap
        });
      });
    }

    room.revealedStories = generatedStories;
    if (!room.allMatchStories) room.allMatchStories = [];
    for (const st of generatedStories) {
      if (!room.allMatchStories.some((existing) => existing.id === st.id)) {
        room.allMatchStories.push(st);
      }
    }
    room.currentRevealParagraph = 1;
    room.totalParagraphs = template.paragraphs.length;
    room.phase = 'story_reveal';

    this.broadcastRoom(room.code);
  }

  /**
   * Advance reveal paragraph or move to voting when done
   */
  public advanceReveal(code: string): { success: boolean; room?: WordLibsRoom } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false };

    if (room.currentRevealParagraph < room.totalParagraphs) {
      room.currentRevealParagraph += 1;
      this.broadcastRoom(room.code);
      return { success: true, room: this.serializeRoom(room) };
    }

    // Completed story reveal! Advance to voting phase
    this.stopTimer(room);
    room.phase = 'voting';
    room.timeRemaining = 0; // No countdown timer; voting concludes when all players cast their votes
    room.timerStartedAt = Date.now();
    this.broadcastRoom(room.code);

    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Skip entire reveal directly to voting
   */
  public skipReveal(code: string): { success: boolean; room?: WordLibsRoom } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false };

    this.stopTimer(room);
    room.currentRevealParagraph = room.totalParagraphs;
    room.phase = 'voting';
    room.timeRemaining = 0;
    room.timerStartedAt = Date.now();
    this.broadcastRoom(room.code);

    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Submit vote for a specific category
   */
  public submitVote(
    code: string,
    voterId: string,
    category: WordLibsVoteCategory,
    targetStoryOrPlayerId: string
  ): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.phase !== 'voting') return { success: false, error: 'Not in voting phase.' };

    // Prevent self-voting
    const targetStory = room.revealedStories.find((s) => s.id === targetStoryOrPlayerId);
    if (targetStory && targetStory.authorPlayerId === voterId) {
      return { success: false, error: 'You cannot vote for your own story!' };
    }
    if (targetStoryOrPlayerId === `story_${voterId}` || targetStoryOrPlayerId === voterId) {
      return { success: false, error: 'You cannot vote for yourself!' };
    }

    if (!room.rawVotes[voterId]) {
      room.rawVotes[voterId] = {};
    }

    room.rawVotes[voterId][category] = targetStoryOrPlayerId;

    // Tally votes into public votesReceived
    const newTally: Record<WordLibsVoteCategory, Record<string, number>> = {
      funniest: {},
      most_unexpected: {},
      most_chaotic: {},
      best_story: {},
      most_unhinged: {},
      best_plot_twist: {},
      most_questionable: {}
    };

    for (const vMap of Object.values(room.rawVotes)) {
      for (const [cat, target] of Object.entries(vMap) as [WordLibsVoteCategory, string][]) {
        if (!newTally[cat]) newTally[cat] = {};
        newTally[cat][target] = (newTally[cat][target] || 0) + 1;
      }
    }
    room.votesReceived = newTally;

    // Check if all connected players have cast at least 1 vote
    const connectedPlayers = room.players.filter((p) => p.connectionStatus === 'connected');
    const votedPlayerIds = Object.keys(room.rawVotes).filter((pid) => {
      const pVotes = room.rawVotes[pid];
      return pVotes && Object.keys(pVotes).length > 0;
    });

    const allVoted = connectedPlayers.length > 0 && connectedPlayers.every((p) => votedPlayerIds.includes(p.id));

    if (allVoted) {
      this.finalizeRoundScores(room);
    } else {
      this.broadcastRoom(room.code);
    }

    return { success: true, room: this.serializeRoom(room) };
  }

  public forceFinalizeVoting(code: string, hostId: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };
    if (room.hostId !== hostId) return { success: false, error: 'Only the host can finalize voting.' };
    if (room.phase !== 'voting') return { success: false, error: 'Not in voting phase.' };

    this.finalizeRoundScores(room);
    return { success: true, room: this.serializeRoom(room) };
  }

  /**
   * Tally points, calculate streaks, chaos combos, and transition to round_results
   */
  private finalizeRoundScores(room: ServerWordLibsRoom): void {
    this.stopTimer(room);

    const isDoublePoints = room.activeChaosEvent === 'double_points';
    const multiplier = isDoublePoints ? 2 : 1;

    // Base category point definitions
    const categoryWeights: Record<WordLibsVoteCategory, number> = {
      funniest: 3,
      most_unexpected: 2,
      most_chaotic: 2,
      best_story: 3,
      most_unhinged: 3,
      best_plot_twist: 2,
      most_questionable: 2
    };

    const winners: Array<{
      category: WordLibsVoteCategory;
      winnerStoryId: string;
      winnerPlayerName: string;
      points: number;
    }> = [];

    const playerCategoryWins: Record<string, number> = {};

    // Award points based on votes
    for (const [catStr, targetCounts] of Object.entries(room.votesReceived)) {
      const cat = catStr as WordLibsVoteCategory;
      let topCount = 0;
      let topTarget = '';

      for (const [target, count] of Object.entries(targetCounts)) {
        if (count > topCount) {
          topCount = count;
          topTarget = target;
        }
      }

      if (topCount > 0 && topTarget) {
        // Resolve target to player
        let winnerPlayer: WordLibsPlayer | undefined;
        if (room.settings.mode === 'battle') {
          winnerPlayer = room.players.find((p) => `story_${p.id}` === topTarget);
        } else {
          // Collaborative mode: pick contributor or top voted
          winnerPlayer = room.players[Math.floor(Math.random() * room.players.length)];
        }

        const pts = (categoryWeights[cat] || 2) * multiplier * topCount;
        if (winnerPlayer) {
          winnerPlayer.roundScore += pts;
          winnerPlayer.score += pts;
          playerCategoryWins[winnerPlayer.id] = (playerCategoryWins[winnerPlayer.id] || 0) + 1;

          winners.push({
            category: cat,
            winnerStoryId: topTarget,
            winnerPlayerName: winnerPlayer.name,
            points: pts
          });
        }
      }
    }

    // Participation points (+1 for everyone who submitted)
    for (const p of room.players) {
      if (p.hasSubmitted) {
        p.roundScore += 1;
        p.score += 1;
      }
      // Chaos Combo (+5) for winning 2+ categories
      if ((playerCategoryWins[p.id] || 0) >= 2) {
        p.roundScore += 5;
        p.score += 5;
        p.currentStreak += 1;
      } else if (p.roundScore > 3) {
        p.currentStreak += 1;
      } else {
        p.currentStreak = 0;
      }
    }

    room.roundWinners = winners;
    room.phase = 'round_results';

    this.broadcastRoom(room.code);
  }

  /**
   * Advance to next round or final results
   */
  public nextRound(code: string, hostId: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    if (room.currentRound < room.totalRounds) {
      room.currentRound += 1;
      room.phase = 'answering';
      this.setupRoundContent(room);
      this.startRoundTimer(room);
      this.broadcastRoom(room.code);
      return { success: true, room: this.serializeRoom(room) };
    }

    // Match Completed! Generate Final Results & Funny Titles
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    const leaderboard = sorted.map((p, idx) => {
      const title = FUNNY_TITLES[idx % FUNNY_TITLES.length];
      p.awardedTitle = title;
      return {
        rank: idx + 1,
        player: p,
        title
      };
    });

    room.finalLeaderboard = leaderboard;
    room.phase = 'final_results';
    this.broadcastRoom(room.code);

    return { success: true, room: this.serializeRoom(room) };
  }

  public playAgain(code: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    room.currentRound = 1;
    for (const p of room.players) {
      p.score = 0;
      p.roundScore = 0;
      p.currentStreak = 0;
      p.hasSubmitted = false;
      p.isReady = p.isHost;
    }
    room.phase = 'lobby';
    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  public returnToLobby(code: string): { success: boolean; room?: WordLibsRoom; error?: string } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: false, error: 'Room not found.' };

    this.stopTimer(room);
    room.phase = 'lobby';
    for (const p of room.players) {
      p.hasSubmitted = false;
      p.roundScore = 0;
    }
    this.broadcastRoom(room.code);
    return { success: true, room: this.serializeRoom(room) };
  }

  public leaveRoom(code: string, playerId: string): { success: boolean } {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { success: true };

    room.players = room.players.filter((p) => p.id !== playerId);
    this.playerHeartbeats.delete(playerId);

    const clientMap = this.sseClients.get(code.toUpperCase());
    if (clientMap) {
      clientMap.delete(playerId);
    }

    if (room.players.length === 0) {
      this.stopTimer(room);
      this.rooms.delete(code.toUpperCase());
      return { success: true };
    }

    // Reassign host if host left
    if (room.hostId === playerId) {
      const nextHost = room.players[0];
      nextHost.isHost = true;
      room.hostId = nextHost.id;
    }

    this.broadcastRoom(room.code);
    return { success: true };
  }

  public sendReaction(code: string, playerId: string, playerName: string, emoji: string): void {
    this.broadcast(code, {
      type: 'REACTION',
      reaction: { playerId, playerName, emoji }
    });
  }

  public registerSseClient(code: string, playerId: string, res: Response): void {
    const normalizedCode = code.toUpperCase();
    if (!this.sseClients.has(normalizedCode)) {
      this.sseClients.set(normalizedCode, new Map());
    }

    const roomClients = this.sseClients.get(normalizedCode)!;
    roomClients.set(playerId, res);

    this.recordHeartbeat(normalizedCode, playerId);
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

    const room = this.rooms.get(normalizedCode);
    if (room) {
      res.write(`data: ${JSON.stringify({ type: 'ROOM_SYNC', room: this.serializeRoom(room) })}\n\n`);
    }

    res.on('close', () => {
      roomClients.delete(playerId);
    });
  }

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

  private startRoundTimer(room: ServerWordLibsRoom): void {
    this.stopTimer(room);
    if (room.settings.timerDuration === 0 || room.timeRemaining <= 0) {
      // Unlimited timer! No automatic submission or countdown
      return;
    }

    room.turnTimer = setInterval(() => {
      if (room.phase !== 'answering') {
        this.stopTimer(room);
        return;
      }
      room.timeRemaining -= 1;
      if (room.timeRemaining <= 0) {
        // Auto submit default answers for players who haven't submitted yet
        for (const p of room.players) {
          if (!p.hasSubmitted) {
            const fallback: Record<string, string> = {};
            for (const pr of room.currentPrompts) {
              fallback[pr.key] = 'Mystery Secret';
            }
            room.rawSubmissions[p.id] = fallback;
            p.hasSubmitted = true;
          }
        }
        this.compileStoriesAndReveal(room);
      } else {
        this.broadcastRoom(room.code);
      }
    }, 1000);
  }

  private stopTimer(room: ServerWordLibsRoom): void {
    if (room.turnTimer) {
      clearInterval(room.turnTimer);
      room.turnTimer = undefined;
    }
  }

  private sweepInactiveConnections(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      let stateChanged = false;
      const clientMap = this.sseClients.get(code);

      for (const player of room.players) {
        const lastSeen = this.playerHeartbeats.get(player.id) || 0;
        const hasSse = clientMap?.has(player.id);

        if (!hasSse && now - lastSeen > 25000 && player.connectionStatus === 'connected') {
          player.connectionStatus = 'disconnected';
          stateChanged = true;
        }
      }

      if (stateChanged) {
        this.broadcastRoom(code);
      }

      if (clientMap) {
        for (const res of clientMap.values()) {
          try {
            res.write(': ping\n\n');
          } catch {
            // Socket closed
          }
        }
      }
    }
  }

  private broadcast(code: string, payload: any): void {
    const clients = this.sseClients.get(code.toUpperCase());
    if (!clients) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const [playerId, res] of clients.entries()) {
      try {
        res.write(data);
      } catch {
        clients.delete(playerId);
      }
    }
  }

  private broadcastRoom(code: string): void {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return;
    this.broadcast(code, {
      type: 'ROOM_SYNC',
      room: this.serializeRoom(room)
    });
  }

  public serializeRoom(room: ServerWordLibsRoom): WordLibsRoom {
    const votedPlayerIds = Object.keys(room.rawVotes || {}).filter((pid) => {
      const pVotes = room.rawVotes[pid];
      return pVotes && Object.keys(pVotes).length > 0;
    });

    return {
      code: room.code,
      gameType: 'wordlibs',
      hostId: room.hostId,
      settings: room.settings,
      players: room.players,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      phase: room.phase,
      activeChaosEvent: room.activeChaosEvent,
      storyTitle: room.storyTitle,
      currentPrompts: room.currentPrompts,
      currentPromptIndex: room.currentPromptIndex,
      timeRemaining: room.timeRemaining,
      timerStartedAt: room.timerStartedAt,
      submittedPlayerIds: room.submittedPlayerIds,
      revealedStories: room.revealedStories,
      allMatchStories: room.allMatchStories || [],
      currentRevealParagraph: room.currentRevealParagraph,
      totalParagraphs: room.totalParagraphs,
      votesReceived: room.votesReceived,
      votedPlayerIds,
      roundWinners: room.roundWinners,
      finalLeaderboard: room.finalLeaderboard,
      isPublic: room.isPublic
    };
  }
}

export const wordLibsRoomManager = new WordLibsRoomManager();
