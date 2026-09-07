import {
  WordLibsPlayer,
  WordLibsRoom,
  WordLibsSettings,
  WordLibsVoteCategory
} from '../types/wordLibs';
import { UserProfile } from '../types';

export class WordLibsClient {
  private eventSource: EventSource | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private currentCode: string | null = null;
  private currentPlayerId: string | null = null;

  /**
   * Fetch open public Word Libs lobbies
   */
  public async getPublicLobbies(): Promise<
    Array<{
      code: string;
      playerCount: number;
      maxPlayers: number;
      topic: string;
      mode: string;
    }>
  > {
    try {
      const res = await fetch('/api/wordlibs/public');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  /**
   * Create a new Word Libs room
   */
  public async createRoom(
    profile: UserProfile,
    settings: WordLibsSettings,
    isPublic: boolean = true
  ): Promise<{ room: WordLibsRoom; player: WordLibsPlayer }> {
    const res = await fetch('/api/wordlibs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, settings, isPublic })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create room' }));
      throw new Error(err.error || 'Server error creating room');
    }
    return res.json();
  }

  /**
   * Join an existing Word Libs room
   */
  public async joinRoom(
    code: string,
    profile: UserProfile
  ): Promise<{ room: WordLibsRoom; player: WordLibsPlayer }> {
    const res = await fetch('/api/wordlibs/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase(), profile })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to join room' }));
      throw new Error(err.error || 'Server error joining room');
    }
    return res.json();
  }

  /**
   * Quick match into an open public Word Libs lobby
   */
  public async quickMatch(profile: UserProfile): Promise<{ room: WordLibsRoom; player: WordLibsPlayer }> {
    const res = await fetch('/api/wordlibs/quickmatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Quick match failed' }));
      throw new Error(err.error || 'Quick match failed');
    }
    return res.json();
  }

  /**
   * Reconnect player after browser reload
   */
  public async reconnect(code: string, playerId: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/reconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Reconnect failed' }));
      throw new Error(err.error || 'Reconnect failed');
    }
    const data = await res.json();
    return data.room;
  }

  /**
   * Subscribe to server SSE synchronization stream
   */
  public subscribeToRoom(
    code: string,
    playerId: string,
    onRoomSync: (room: WordLibsRoom) => void,
    onReaction?: (reaction: { playerId: string; playerName: string; emoji: string }) => void,
    onError?: (err: any) => void
  ): () => void {
    this.leaveCurrentStream();

    const normalizedCode = code.toUpperCase();
    this.currentCode = normalizedCode;
    this.currentPlayerId = playerId;

    const streamUrl = `/api/wordlibs/${normalizedCode}/stream?playerId=${encodeURIComponent(playerId)}`;
    this.eventSource = new EventSource(streamUrl);

    this.eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ROOM_SYNC' && payload.room) {
          onRoomSync(payload.room);
        } else if (payload.type === 'REACTION' && payload.reaction && onReaction) {
          onReaction(payload.reaction);
        }
      } catch (err) {
        console.warn('[WordLibs SSE] Parse error:', err);
      }
    };

    this.eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    // Heartbeat every 8s
    this.heartbeatTimer = setInterval(() => {
      if (this.currentCode && this.currentPlayerId) {
        fetch(`/api/wordlibs/${this.currentCode}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.currentPlayerId })
        }).catch(() => {});
      }
    }, 8000);

    return () => {
      this.leaveCurrentStream();
    };
  }

  public leaveCurrentStream(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.currentCode = null;
    this.currentPlayerId = null;
  }

  /**
   * Toggle player ready status in lobby
   */
  public async toggleReady(code: string, playerId: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    const data = await res.json();
    return data.room;
  }

  /**
   * Update room settings from lobby (Host only)
   */
  public async updateSettings(
    code: string,
    hostId: string,
    settings: Partial<WordLibsSettings>
  ): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostId, settings })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update settings' }));
      throw new Error(err.error || 'Failed to update settings');
    }
    const data = await res.json();
    return data.room;
  }

  /**
   * Start game match (Host)
   */
  public async startGame(code: string, playerId: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to start game' }));
      throw new Error(err.error || 'Failed to start game');
    }
    const data = await res.json();
    return data.room;
  }

  /**
   * Submit answers for current round
   */
  public async submitAnswers(
    code: string,
    playerId: string,
    answers: Record<string, string>
  ): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, answers })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit answers' }));
      throw new Error(err.error || 'Failed to submit answers');
    }
    const data = await res.json();
    return data.room;
  }

  /**
   * Advance reveal paragraph
   */
  public async advanceReveal(code: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/advance-reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.room;
  }

  /**
   * Skip reveal directly to voting
   */
  public async skipReveal(code: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/skip-reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.room;
  }

  /**
   * Submit vote
   */
  public async submitVote(
    code: string,
    voterId: string,
    category: WordLibsVoteCategory,
    targetStoryId: string
  ): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, category, targetStoryId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit vote' }));
      throw new Error(err.error || 'Failed to submit vote');
    }
    const data = await res.json();
    return data.room;
  }

  /**
   * Force finalize voting (Host only)
   */
  public async forceFinalizeVoting(code: string, hostId: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/force-finalize-voting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to finalize voting' }));
      throw new Error(err.error || 'Failed to finalize voting');
    }
    const data = await res.json();
    return data.room;
  }

  /**
   * Next round
   */
  public async nextRound(code: string, playerId: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/next-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    const data = await res.json();
    return data.room;
  }

  /**
   * Play again
   */
  public async playAgain(code: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/play-again`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.room;
  }

  /**
   * Return to lobby
   */
  public async returnToLobby(code: string): Promise<WordLibsRoom> {
    const res = await fetch(`/api/wordlibs/${code}/return-lobby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return data.room;
  }

  /**
   * Leave room
   */
  public async leaveRoom(code: string, playerId: string): Promise<void> {
    this.leaveCurrentStream();
    await fetch(`/api/wordlibs/${code}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    }).catch(() => {});
  }

  /**
   * Send reaction emoji
   */
  public async sendReaction(
    code: string,
    playerId: string,
    playerName: string,
    emoji: string
  ): Promise<void> {
    await fetch(`/api/wordlibs/${code}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, playerName, emoji })
    }).catch(() => {});
  }
}

export const wordLibsClient = new WordLibsClient();
