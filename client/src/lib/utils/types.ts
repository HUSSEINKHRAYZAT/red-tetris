/**
 * Socket Payload Type Definitions
 *
 * TypeScript interfaces mirroring the backend's payload contracts.
 * These types ensure type-safe communication with the server.
 *
 * Source: server/src/protocol/payloads.js
 */

/* ============================================================================
 * CLIENT → SERVER PAYLOADS
 * ============================================================================ */

/**
 * JOIN event payload
 * Sent when a player joins a room
 */
export interface JoinPayload {
  /** Room name/ID to join */
  room: string;

  /** Player's display name */
  name: string;
}

/**
 * START event payload
 * Sent by host to start the game
 */
export interface StartPayload {
  /** Room name/ID */
  room: string;
}

/**
 * RESTART event payload
 * Sent by host to restart the game
 */
export interface RestartPayload {
  /** Room name/ID */
  room: string;
}

/**
 * Player input actions
 */
export type InputAction = 'LEFT' | 'RIGHT' | 'DOWN' | 'ROTATE' | 'DROP';

/**
 * INPUT event payload
 * Sent when player performs an action
 */
export interface InputPayload {
  /** Room name/ID */
  room: string;

  /** Action to perform */
  action: InputAction;
}

/* ============================================================================
 * SERVER → CLIENT PAYLOADS
 * ============================================================================ */

/**
 * Player info in lobby (minimal)
 */
export interface LobbyPlayer {
  /** Player's socket ID */
  id: string;

  /** Player's display name */
  name: string;

  /** Whether this player is the host */
  isHost: boolean;
}

/**
 * LOBBY event payload
 * Received when lobby state changes (join/leave)
 */
export interface LobbyPayload {
  /** Room name/ID */
  room: string;

  /** Whether the game has started */
  started: boolean;

  /** Socket ID of the current host (null if no players) */
  hostId: string | null;

  /** List of players in the lobby */
  players: LobbyPlayer[];
}

/**
 * Player info in game state (detailed)
 */
export interface GamePlayer {
  /** Player's socket ID */
  id: string;

  /** Player's display name */
  name: string;

  /** Whether this player is the host */
  isHost: boolean;

  /** Whether this player is still alive */
  alive: boolean;

  /** Total lines cleared */
  lines: number;

  /** Lines cleared in last move */
  lastClear: number;

  /** 20x10 grid (0=empty, 1=locked block, 2=falling piece) */
  board: number[][] | null;

  /** Active falling piece cells [{x, y}, ...] */
  activePiece: Array<{ x: number; y: number }> | null;

  /** Board merged with active piece for rendering */
  boardWithPiece: number[][] | null;
}

/**
 * STATE event payload
 * Received on every game tick (500ms) and after player inputs
 */
export interface StatePayload {
  /** Room name/ID */
  room: string;

  /** Whether the game has started */
  started: boolean;

  /** Detailed info for all players */
  players: GamePlayer[];
}

/**
 * GAME_STARTED event payload
 * Received when the host starts the game
 */
export interface GameStartedPayload {
  /** Room name/ID */
  room: string;
}

/**
 * GAME_RESTARTED event payload
 * Received when the host restarts the game
 */
export interface GameRestartedPayload {
  /** Room name/ID */
  room: string;
}

/**
 * GAME_OVER event payload
 * Received when the game ends (≤1 players alive)
 */
export interface GameOverPayload {
  /** Room name/ID */
  room: string;

  /** Winner's socket ID, or null if no winner */
  winner: string | null;
}

/**
 * ERROR event payload
 * Received when server rejects a request
 */
export interface ErrorPayload {
  /** Error message (e.g., "Only host can start", "Room not found") */
  message: string;
}

/* ============================================================================
 * HELPER TYPES
 * ============================================================================ */

/**
 * Union of all client-to-server payloads
 */
export type ClientPayload =
  | JoinPayload
  | StartPayload
  | RestartPayload
  | InputPayload;

/**
 * Union of all server-to-client payloads
 */
export type ServerPayload =
  | LobbyPayload
  | StatePayload
  | GameStartedPayload
  | GameRestartedPayload
  | GameOverPayload
  | ErrorPayload;
