/**
 * A simple relay server for shared multiplayer games using Socket.IO.
 * 
 * This server manages "rooms" that clients can create and join.
 * 
 * A room is first created based on a client's request. The room is assigned a
 * unique ID and the creating client becomes the "host". Other clients may request
 * to join the room by ID. If the host disconnects, another client in the room is
 * promoted to host. If the last client leaves, the room is closed.
 * 
 * The server maintains the current game state for each room and an opaque, unknown
 * type. The initial game state is provided by the host when creating the room. When
 * a client joins the room, the server sends them the current game state.
 * 
 * Any client in the room may submit an action, which is broadcast to all clients
 * (including the submitter). Clients are expected to parse/validate the action,
 * apply it to their local copy of the game, and respond back with the updated game
 * state. This response allows the server to update its own copy without needing to
 * understand the game logic.
 * 
 * The current host is allowed to submit a full game state sync, which is also
 * broadcast to all clients. This allows the host to start a new game within a room.
 * 
 * Socket.IO provides an underlying guarantee of message ordering and "at most once"
 * delivery. This is at the level of each socket for an individual client. It does
 * not guarantee delivery, so a message could be missed (e.g. if a client temporarily
 * disconnects). For example, a client could receive ABC, AC, or even just C, but they
 * could not receive AABC or BCA.
 * 
 * NOTE: This server doesn't handle concurrency in a fully correct way!
 * In lab on Friday, April 17, we'll implement a more robust version.
 */

import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, RoomPlayer } from './types.js';
import { Randomizer } from './randomizer.js';



// =============================================================================
// Configuration
// =============================================================================

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? '*';



// =============================================================================
// Clients and Rooms
// =============================================================================

/** Data attached to each socket (server-side only) */
export interface SocketData {
  displayName?: string;
  currentRoomId?: string;
  isHost?: boolean;
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

interface RoomData {
  id: string;
  gameData: unknown;
  createdAt: Date;
  lastActivity: Date;
}

/** Map from room ID to Room object */
const rooms = new Map<string, RoomData>();

// Clean up inactive rooms every minute
const ROOM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, room] of Array.from(rooms)) {
    if (now - room.lastActivity.getTime() > ROOM_TIMEOUT_MS) {
      // Notify clients before removing
      io.to(id).emit('room-closed');
      rooms.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} inactive room(s). Active rooms: ${rooms.size}`);
  }
}, 60 * 1000); // Check every minute

const rand = Randomizer.create_autoseeded();

/**
 * Generate a unique, human-friendly room ID (e.g. "swift-panda-1234") that
 * is not currently in use.
 */
function generateRoomId(): string {

  // Keep generating random IDs until we find one that isn't taken.
  while(true) {
    const adjectives = ['happy', 'clever', 'swift', 'brave', 'calm', 'eager', 'gentle', 'kind', 'lively', 'merry', 'proud', 'quick'];
    const nouns = ['tiger', 'eagle', 'dolphin', 'panda', 'koala', 'falcon', 'otter', 'wolf', 'bear', 'lion', 'hawk', 'fox'];
    const adj = rand.choose_one(adjectives);
    const noun = rand.choose_one(nouns);
    const num = rand.range(0, 10000).toString().padStart(4, '0');
    const composed_id = `${adj}-${noun}-${num}`;
    if (!rooms.has(composed_id)) {
      return composed_id;
    }
  }
}

/** Emit the current player list to all clients in a room */
async function emitRoomPlayers(room_id: string) {
  const sockets = await io.in(room_id).fetchSockets();
  
  for (const s of sockets) {
    const players: RoomPlayer[] = sockets.map(other => ({
      displayName: other.data.displayName ?? 'Anonymous',
      isHost: other.data.isHost ?? false,
      isSelf: other.id === s.id,
    }));
    s.emit('room-players', players);
  }
}

/** Promote the first remaining client to host, or close room if empty */
async function promoteNewHostOrCloseRoom(room_id: string) {
  const sockets = await io.in(room_id).fetchSockets();
  const newHost = sockets[0];
  if (newHost) {
    newHost.data.isHost = true;
    console.log(`[${room_id}] Promoted ${newHost.id} to host`);
    newHost.emit('promoted-to-host');
    emitRoomPlayers(room_id);
  } else {
    rooms.delete(room_id);
    console.log(`[${room_id}] Room closed (no clients remaining).`);
  }
}


  
/** Handle a socket leaving a room (used by both leave-room and disconnect) */
function leaveCurrentRoom(socket: TypedSocket) {
  const room_id = socket.data.currentRoomId;
  if (!room_id) { return; }

  const wasHost = socket.data.isHost;
  
  socket.leave(room_id); // synchronous
  socket.data.currentRoomId = undefined;
  socket.data.isHost = false;
  console.log(`[${room_id}] ${socket.data.displayName} (${socket.id}) left room`);
  
  if(wasHost) {
    promoteNewHostOrCloseRoom(room_id);
  } else {
    emitRoomPlayers(room_id);
  }
}

// =============================================================================
// SERVER
// =============================================================================

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(httpServer, {
  cors: {
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
  },

  // 
  maxHttpBufferSize: 1e6, // 1MB - should be plenty of game states/actions

  // Generous ping timeouts to allow pausing in the debugger.
  pingInterval: 60000,    // 1 minute between pings
  pingTimeout: 120000,    // 2 minutes to respond
});

// Note: We're using the default in-memory adapter, which means many operations
// (like join, leave, fetchSockets) are synchronous and do not return a promise.

io.on('connection', (socket: TypedSocket) => {
  const totalConnections = io.sockets.sockets.size;
  console.log(`Socket ${socket.id} connected (total connections: ${totalConnections})`);  

  // -------------------------------------------------------------------------
  // Create a new room (caller becomes host)
  // -------------------------------------------------------------------------
  socket.on('create-room', async (displayName, gameData, callback) => {
    console.log(`${displayName} (${socket.id}) requested create-room`);
    leaveCurrentRoom(socket);
    
    const room_id = generateRoomId();
    const now = new Date();
    
    rooms.set(room_id, {
      id: room_id,
      gameData,
      createdAt: now,
      lastActivity: now,
    });

    socket.join(room_id); // synchronous
    socket.data.displayName = displayName;
    socket.data.currentRoomId = room_id;
    socket.data.isHost = true;

    console.log(`[${room_id}] Room created with host ${displayName} (${socket.id}). Active rooms: ${rooms.size}`);
    callback({ room_id, gameData });
    
    // Emit player list (just the host for now)
    await emitRoomPlayers(room_id);
  });

  // -------------------------------------------------------------------------
  // Join an existing room (receives current game state)
  // -------------------------------------------------------------------------
  socket.on('join-room', async (displayName, room_id, callback) => {

    const room = rooms.get(room_id);
    if (!room) {
      console.warn(`[${room_id}] Join failed for ${displayName} (${socket.id}): room not found`);
      callback({ error: `Room "${room_id}" not found` });
      return;
    }
    
    if (room_id === socket.data.currentRoomId) {
      // Already in this room - just resend current state
      console.log(`[${room_id}] ${displayName} (${socket.id}) already in room, resending state`);
      callback({ room_id, gameData: room.gameData });
      return;
    }

    // Leave any existing rooms first (with proper host promotion)
    leaveCurrentRoom(socket);

    room.lastActivity = new Date();
    await socket.join(room_id);
    socket.data.displayName = displayName;
    socket.data.currentRoomId = room_id;
    socket.data.isHost = false;

    console.log(`[${room_id}] ${displayName} (${socket.id}) joined`);
    callback({ room_id, gameData: room.gameData });
    
    // Emit updated player list to all clients in the room
    await emitRoomPlayers(room_id);
  });

  // -------------------------------------------------------------------------
  // Submit an action (broadcast to all clients in room, including sender)
  // -------------------------------------------------------------------------
  
  /** Broadcast action to all clients and update stored state from first response */
  async function broadcastActionAndUpdateState(room: RoomData, room_id: string, action: unknown) {
    const room_sockets = io.sockets.adapter.rooms.get(room_id);
    if (!room_sockets) {
      console.warn(`Attempt to broadcast to nonexistent room ${room_id}`);
      return;
    }
    console.log(`[${room_id}] Broadcasting action.`, JSON.stringify(action));
    
    const statePromises = Array.from(room_sockets).map(s => 
      io.sockets.sockets.get(s)?.emitWithAck('action', { action: action })
    );
    
    try {
      const updatedState = await Promise.any(statePromises);
      room.gameData = updatedState;
      console.log(`[${room_id}] State updated after action.`);
    } catch {
      console.warn(`[${room_id}] No clients responded to action`);
    }
  }
  
  socket.on('submit-action', async (action, callback) => {
    const room_id = socket.data.currentRoomId;
    
    if (!room_id) {
      console.warn(`Submit action failed for ${socket.data.displayName} (${socket.id}): not in a room`);
      callback?.({ error: 'Not in a room' });
      return;
    }
    
    const room = rooms.get(room_id);
    if (!room) {
      console.warn(`[${room_id}] Submit action failed for ${socket.data.displayName} (${socket.id}): room not found`);
      callback?.({ error: `Room "${room_id}" not found` });
      return;
    }

    room.lastActivity = new Date();

    // Fire and forget - don't block the callback
    broadcastActionAndUpdateState(room, room_id, action);

    callback?.({ success: true });
  });

  // -------------------------------------------------------------------------
  // Submit a full game state sync (host only)
  // -------------------------------------------------------------------------
  socket.on('submit-sync', (gameData, callback) => {
    const room_id = socket.data.currentRoomId;
    
    if (!room_id) {
      console.warn(`Submit sync failed for ${socket.data.displayName} (${socket.id}): not in a room`);
      callback({ error: 'Not in a room' });
      return;
    }
    
    const room = rooms.get(room_id);
    if (!room) {
      console.warn(`[${room_id}] Submit sync failed for ${socket.data.displayName} (${socket.id}): room not found`);
      callback({ error: `Room "${room_id}" not found` });
      return;
    }
    
    // Only host can sync
    if (!socket.data.isHost) {
      console.warn(`[${room_id}] Submit sync failed for ${socket.data.displayName} (${socket.id}): not host`);
      callback({ error: 'Only the host can sync game state' });
      return;
    }

    room.lastActivity = new Date();
    room.gameData = gameData;

    // TASK 6: Assign a sequence number for consistent ordering (same counter as actions)

    // Broadcast sync to all clients in the room
    console.log(`[${room_id}] Syncing game state submitted by host ${socket.id}`);
    io.to(room_id).emit('sync', gameData);
    
    callback({ success: true });
  });

  // -------------------------------------------------------------------------
  // Leave the current room (stay connected to server)
  // -------------------------------------------------------------------------
  socket.on('leave-room', (callback) => {
    leaveCurrentRoom(socket);
    callback?.({ success: true });
  });

  // -------------------------------------------------------------------------
  // Cleanup on disconnect
  // -------------------------------------------------------------------------
  socket.on('disconnect', (reason) => {
    const totalConnections = io.sockets.sockets.size;
    console.log(`${socket.data.displayName} (${socket.id}) disconnected (reason: ${reason}, remaining: ${totalConnections})`);
    leaveCurrentRoom(socket);
  });
});

// =============================================================================
// START
// =============================================================================

httpServer.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Socket.IO Room Server');
  console.log('='.repeat(60));
  console.log(`Server:     http://0.0.0.0:${PORT}`);
  console.log(`CORS:       ${CORS_ORIGIN}`);
  console.log('='.repeat(60));
});
