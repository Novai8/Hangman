import { ActivityEvent, FloatingReaction, Player, ReactionEmoji, Room, RoomSettings, UserProfile } from '../types';

export interface SavedRoomSession {
  code: string;
  playerId: string;
  playerName: string;
}

const SESSION_KEY = 'hangman_active_room_session';

class MultiplayerClient {
  private activeEventSource: EventSource | null = null;
  private heartbeatTimer: number | null = null;

  public saveSession(code: string, playerId: string, playerName: string): void {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code, playerId, playerName }));
      localStorage.setItem(SESSION_KEY, JSON.stringify({ code, playerId, playerName }));
    } catch {
      // Ignore
    }
  }

  public getSavedSession(): SavedRoomSession | null {
    try {
      const data = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return null;
  }

  public clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }

  public async fetchStats(): Promise<{ onlinePlayers: number; activeRooms: number }> {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch {
      return { onlinePlayers: 1, activeRooms: 1 };
    }
  }

  public async fetchPublicLobbies(): Promise<Array<{ code: string; playerCount: number; maxPlayers: number; category: string; mode: string }>> {
    try {
      const res = await fetch('/api/rooms/public');
      if (!res.ok) throw new Error('Failed to fetch public rooms');
      return await res.json();
    } catch {
      return [];
    }
  }

  public async createRoom(
    profile: UserProfile,
    settings: RoomSettings,
    isPublic: boolean = true
  ): Promise<{ room: Room; player: Player }> {
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, settings, isPublic })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create room' }));
      throw new Error(err.error || 'Failed to create room');
    }

    const data = await res.json();
    this.saveSession(data.room.code, data.player.id, data.player.name);
    return data;
  }

  public async joinRoom(
    code: string,
    profile: UserProfile
  ): Promise<{ room: Room; player: Player }> {
    const res = await fetch('/api/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase(), profile })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to join room' }));
      throw new Error(err.error || 'Failed to join room');
    }

    const data = await res.json();
    this.saveSession(data.room.code, data.player.id, data.player.name);
    return data;
  }

  public async quickMatch(profile: UserProfile): Promise<{ room: Room; player: Player }> {
    const res = await fetch('/api/rooms/quickmatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to quickmatch' }));
      throw new Error(err.error || 'Failed to quickmatch');
    }

    const data = await res.json();
    this.saveSession(data.room.code, data.player.id, data.player.name);
    return data;
  }

  public async reconnectRoom(code: string, playerId: string): Promise<{ room: Room }> {
    const res = await fetch(`/api/rooms/${code.toUpperCase()}/reconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Room no longer active' }));
      throw new Error(err.error || 'Room no longer active');
    }

    return await res.json();
  }

  public connectStream(
    code: string,
    playerId: string,
    callbacks: {
      onRoomSync: (room: Room) => void;
      onActivity: (event: ActivityEvent) => void;
      onReaction: (reaction: FloatingReaction) => void;
      onConnectionChange?: (status: 'connected' | 'reconnecting' | 'disconnected') => void;
    }
  ): () => void {
    // Close existing stream
    this.disconnectStream();

    const normalizedCode = code.toUpperCase();
    const url = `/api/rooms/${normalizedCode}/stream?playerId=${encodeURIComponent(playerId)}`;
    const eventSource = new EventSource(url);
    this.activeEventSource = eventSource;

    eventSource.onopen = () => {
      callbacks.onConnectionChange?.('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ROOM_SYNC' && payload.room) {
          callbacks.onRoomSync(payload.room);
        } else if (payload.type === 'ACTIVITY' && payload.event) {
          callbacks.onActivity(payload.event);
        } else if (payload.type === 'REACTION' && payload.reaction) {
          callbacks.onReaction(payload.reaction);
        }
      } catch {
        // Ping comment or parse error
      }
    };

    eventSource.onerror = () => {
      callbacks.onConnectionChange?.('reconnecting');
    };

    // Heartbeat loop every 8 seconds
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = window.setInterval(() => {
      fetch(`/api/rooms/${normalizedCode}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      }).catch(() => {
        // Silently ignore transient error
      });
    }, 8000);

    return () => {
      this.disconnectStream();
    };
  }

  public disconnectStream(): void {
    if (this.activeEventSource) {
      this.activeEventSource.close();
      this.activeEventSource = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public async toggleReady(code: string, playerId: string): Promise<Room> {
    const res = await fetch(`/api/rooms/${code}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Action failed' }));
      throw new Error(err.error || 'Action failed');
    }
    const data = await res.json();
    return data.room;
  }

  public async startGame(code: string, playerId: string): Promise<Room> {
    const res = await fetch(`/api/rooms/${code}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Action failed' }));
      throw new Error(err.error || 'Action failed');
    }
    const data = await res.json();
    return data.room;
  }

  public async guessLetter(
    code: string,
    playerId: string,
    letter: string
  ): Promise<{ room: Room; isCorrect: boolean; feedback?: string }> {
    const res = await fetch(`/api/rooms/${code}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, letter })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to guess' }));
      throw new Error(err.error || 'Failed to guess');
    }
    return await res.json();
  }

  public async nextRound(code: string, playerId: string): Promise<Room> {
    const res = await fetch(`/api/rooms/${code}/next-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to start next round' }));
      throw new Error(err.error || 'Failed to start next round');
    }
    const data = await res.json();
    return data.room;
  }

  public async playAgain(code: string): Promise<Room> {
    const res = await fetch(`/api/rooms/${code}/play-again`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to restart' }));
      throw new Error(err.error || 'Failed to restart');
    }
    const data = await res.json();
    return data.room;
  }

  public async returnToLobby(code: string): Promise<Room> {
    const res = await fetch(`/api/rooms/${code}/return-lobby`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to return to lobby' }));
      throw new Error(err.error || 'Failed to return to lobby');
    }
    const data = await res.json();
    return data.room;
  }

  public async leaveRoom(code: string, playerId: string): Promise<void> {
    this.disconnectStream();
    this.clearSession();
    try {
      await fetch(`/api/rooms/${code}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
    } catch {
      // Ignore
    }
  }

  public async sendReaction(code: string, playerId: string, playerName: string, emoji: ReactionEmoji): Promise<void> {
    try {
      await fetch(`/api/rooms/${code}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, playerName, emoji })
      });
    } catch {
      // Ignore
    }
  }
}

export const multiplayerClient = new MultiplayerClient();
