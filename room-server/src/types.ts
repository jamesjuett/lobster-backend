/**
 * Socket.IO event types for the multiplayer room protocol.
 * These are inlined from @repo/multiplayer for standalone deployment.
 */

/** Info about a player in a room */
export interface RoomPlayer {
  /** Display name of the player */
  displayName: string;
  /** Whether this player is the room host */
  isHost: boolean;
  /** Whether this is the current client */
  isSelf: boolean;
}

export interface ServerToClientEvents {
  /** Room was closed */
  "room-closed": () => void;
  
  /** Client was promoted to host */
  "promoted-to-host": () => void;

  /** Client should synchronize its game to the given config/state */
  "sync": (gameData: unknown) => void;

  /**
   * Client should attempt to perform the given action and respond with updated state.
   */
  "action": (data: { action: unknown }, callback: (updatedState: unknown) => void) => void;

  /** Player list changed (join, leave, host promotion) */
  "room-players": (players: RoomPlayer[]) => void;
}

export interface ClientToServerEvents {
  /** Request to create a new room and join as host */
  "create-room": (displayName: string, gameData: unknown, callback: (response: { room_id: string, gameData: unknown } | { error: string }) => void) => void;
  
  /** Request to join an existing room */
  "join-room": (displayName: string, room_id: string, callback: (response: { room_id: string, gameData: unknown } | { error: string }) => void) => void;
  
  /** Request to leave the current room (stay connected to server) */
  "leave-room": (callback?: (response: { success: true } | { error: string }) => void) => void;
  
  /** Client submits an action, which will be broadcast to all clients */
  "submit-action": (action: unknown, callback?: (response: { success: true } | { error: string }) => void) => void;
  
  /** Client submits a sync request with the full game state (host only) */
  "submit-sync": (gameData: unknown, callback: (response: { success: true } | { error: string }) => void) => void;
}
