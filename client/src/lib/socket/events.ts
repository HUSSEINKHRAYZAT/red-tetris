/**
 * Socket Event Constants
 *
 * This file mirrors the backend's event definitions to ensure type-safe
 * socket communication between frontend and backend.
 *
 * Source: server/src/protocol/events.js
 */

/**
 * Client-to-Server Events
 * Events that the frontend sends to the backend
 */
export const C2S_EVENTS = {
  /** Join a game room with player name */
  JOIN: 'JOIN',

  /** Start the game (host only) */
  START: 'START',

  /** Restart the game (host only) */
  RESTART: 'RESTART',

  /** Send player input (LEFT, RIGHT, DOWN, ROTATE, DROP) */
  INPUT: 'INPUT',
} as const;

/**
 * Server-to-Client Events
 * Events that the backend broadcasts to the frontend
 */
export const S2C_EVENTS = {
  /** Lobby state update (players list, host status) */
  LOBBY: 'LOBBY',

  /** Game has started notification */
  GAME_STARTED: 'GAME_STARTED',

  /** Game over notification with winner */
  GAME_OVER: 'GAME_OVER',

  /** Game has been restarted notification */
  GAME_RESTARTED: 'GAME_RESTARTED',

  /** Full game state update (boards, pieces, scores) */
  STATE: 'STATE',

  /** Error message from server */
  ERROR: 'ERROR',
} as const;

/**
 * All socket events combined for easy iteration
 */
export const SOCKET_EVENTS = {
  ...C2S_EVENTS,
  ...S2C_EVENTS,
} as const;

// Type exports for TypeScript type safety
export type C2SEventType = typeof C2S_EVENTS[keyof typeof C2S_EVENTS];
export type S2CEventType = typeof S2C_EVENTS[keyof typeof S2C_EVENTS];
export type SocketEventType = C2SEventType | S2CEventType;
