import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { roomManager } from './server/roomManager';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // Disable caching for API calls
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Live telemetry stats (players online, active rooms)
  app.get('/api/stats', (req, res) => {
    res.json(roomManager.getStats());
  });

  // List open public lobby rooms
  app.get('/api/rooms/public', (req, res) => {
    res.json(roomManager.getPublicLobbies());
  });

  // Create room
  app.post('/api/rooms/create', (req, res) => {
    const { profile, settings, isPublic } = req.body;
    if (!profile || !settings) {
      res.status(400).json({ error: 'Missing profile or settings' });
      return;
    }
    const result = roomManager.createRoom(profile, settings, isPublic ?? true);
    res.json(result);
  });

  // Join room
  app.post('/api/rooms/join', (req, res) => {
    const { code, profile } = req.body;
    if (!code || !profile) {
      res.status(400).json({ error: 'Missing room code or profile' });
      return;
    }
    const result = roomManager.joinRoom(code, profile);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Quick match
  app.post('/api/rooms/quickmatch', (req, res) => {
    const { profile } = req.body;
    if (!profile) {
      res.status(400).json({ error: 'Missing profile' });
      return;
    }
    const result = roomManager.quickMatch(profile);
    res.json(result);
  });

  // Reconnect player after browser refresh
  app.post('/api/rooms/:code/reconnect', (req, res) => {
    const { code } = req.params;
    const { playerId } = req.body;
    if (!playerId) {
      res.status(400).json({ error: 'Missing playerId' });
      return;
    }
    const result = roomManager.reconnectPlayer(code, playerId);
    if (!result.success) {
      res.status(404).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Server-Sent Events (SSE) stream for real-time room synchronization
  app.get('/api/rooms/:code/stream', (req, res) => {
    const { code } = req.params;
    const playerId = req.query.playerId as string;

    if (!playerId) {
      res.status(400).send('playerId required');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    if (res.flushHeaders) {
      res.flushHeaders();
    }

    roomManager.registerSseClient(code, playerId, res);
  });

  // Keepalive heartbeat
  app.post('/api/rooms/:code/heartbeat', (req, res) => {
    const { code } = req.params;
    const { playerId } = req.body;
    if (playerId) {
      roomManager.recordHeartbeat(code, playerId);
    }
    res.json({ success: true });
  });

  // Toggle ready status
  app.post('/api/rooms/:code/ready', (req, res) => {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = roomManager.toggleReady(code, playerId);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Start game match
  app.post('/api/rooms/:code/start', (req, res) => {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = roomManager.startGame(code, playerId);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Authoritative letter guess
  app.post('/api/rooms/:code/guess', (req, res) => {
    const { code } = req.params;
    const { playerId, letter } = req.body;
    const result = roomManager.guessLetter(code, playerId, letter);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Next round
  app.post('/api/rooms/:code/next-round', (req, res) => {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = roomManager.nextRound(code, playerId);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Play again
  app.post('/api/rooms/:code/play-again', (req, res) => {
    const { code } = req.params;
    const result = roomManager.playAgain(code);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Return to lobby
  app.post('/api/rooms/:code/return-lobby', (req, res) => {
    const { code } = req.params;
    const result = roomManager.returnToLobby(code);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  // Leave room
  app.post('/api/rooms/:code/leave', (req, res) => {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = roomManager.leaveRoom(code, playerId);
    res.json(result);
  });

  // Emoji reaction
  app.post('/api/rooms/:code/react', (req, res) => {
    const { code } = req.params;
    const { playerId, playerName, emoji } = req.body;
    roomManager.sendReaction(code, playerId, playerName, emoji);
    res.json({ success: true });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Hangman Game Server running on port ${PORT}`);
  });
}

startServer();
