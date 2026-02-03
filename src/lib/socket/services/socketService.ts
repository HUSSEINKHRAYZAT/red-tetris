/**
 * Socket Service
 *
 * Core service for managing Socket.IO connection and communication with the backend.
 * This service provides a centralized interface for all socket operations.
 *
 * Features:
 * - Automatic connection management
 * - Type-safe event emission and listening
 * - Connection state tracking
 * - Error handling and reconnection
 *
 * Usage:
 * ```typescript
 * import { socketService } from '@/lib/socket/services/socketService';
 *
 * // Connect to server
 * socketService.connect();
 *
 * // Join a room
 * socketService.joinRoom('room1', 'PlayerName');
 *
 * // Listen for events
 * socketService.onLobbyUpdate((data) => {
 *   console.log('Players:', data.players);
 * });
 *
 * // Disconnect
 * socketService.disconnect();
 * ```
 */

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../api';
import { C2S_EVENTS, S2C_EVENTS } from '../events';
import type {
  JoinPayload,
  StartPayload,
  RestartPayload,
  InputPayload,
  LobbyPayload,
  StatePayload,
  GameStartedPayload,
  GameRestartedPayload,
  GameOverPayload,
  ErrorPayload,
  InputAction,
} from '../types';

/**
 * Socket connection states
 */
export const SocketState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export type SocketState = typeof SocketState[keyof typeof SocketState];

/**
 * Socket event handler types
 */
type LobbyHandler = (data: LobbyPayload) => void;
type StateHandler = (data: StatePayload) => void;
type GameStartedHandler = (data: GameStartedPayload) => void;
type GameRestartedHandler = (data: GameRestartedPayload) => void;
type GameOverHandler = (data: GameOverPayload) => void;
type ErrorHandler = (data: ErrorPayload) => void;
type ConnectionHandler = () => void;

class SocketService {
  private socket: Socket | null = null;
  private connectionState: SocketState = SocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Get current connection state
   */
  getState(): SocketState {
    return this.connectionState;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get the socket ID (available after connection)
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Connect to the Socket.IO server
   *
   * @param url - Optional custom URL (defaults to SOCKET_URL from api.ts)
   * @returns Promise that resolves when connected
   */
  connect(url: string = SOCKET_URL): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.connectionState = SocketState.CONNECTING;

      this.socket = io(url, {
        transports: ['websocket', 'polling'], // Prefer WebSocket
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Connection successful
      this.socket.on('connect', () => {
        this.connectionState = SocketState.CONNECTED;
        this.reconnectAttempts = 0;
        console.log('[Socket] Connected with ID:', this.socket?.id);
        resolve();
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        this.connectionState = SocketState.ERROR;
        this.reconnectAttempts++;
        console.error('[Socket] Connection error:', error);

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      // Disconnected
      this.socket.on('disconnect', (reason) => {
        this.connectionState = SocketState.DISCONNECTED;
        console.log('[Socket] Disconnected:', reason);
      });
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionState = SocketState.DISCONNECTED;
      console.log('[Socket] Manually disconnected');
    }
  }

  /* =========================================================================
   * CLIENT → SERVER METHODS (Emit events to backend)
   * ========================================================================= */

  /**
   * Join a game room
   *
   * @param room - Room name/ID
   * @param name - Player display name
   *
   * Server will respond with:
   * - LOBBY event (on success)
   * - ERROR event (on failure)
   */
  joinRoom(room: string, name: string): void {
    if (!this.socket) {
      console.error('[Socket] Cannot join room: Not connected');
      return;
    }

    const payload: JoinPayload = { room, name };
    this.socket.emit(C2S_EVENTS.JOIN, payload);
    console.log('[Socket] JOIN:', payload);
  }

  /**
   * Start the game (host only)
   *
   * @param room - Room name/ID
   *
   * Server will respond with:
   * - GAME_STARTED event (on success)
   * - ERROR event (if not host or other error)
   */
  startGame(room: string): void {
    if (!this.socket) {
      console.error('[Socket] Cannot start game: Not connected');
      return;
    }

    const payload: StartPayload = { room };
    this.socket.emit(C2S_EVENTS.START, payload);
    console.log('[Socket] START:', payload);
  }

  /**
   * Restart the game (host only)
   *
   * @param room - Room name/ID
   *
   * Server will respond with:
   * - GAME_RESTARTED event (on success)
   * - ERROR event (if not host or other error)
   */
  restartGame(room: string): void {
    if (!this.socket) {
      console.error('[Socket] Cannot restart game: Not connected');
      return;
    }

    const payload: RestartPayload = { room };
    this.socket.emit(C2S_EVENTS.RESTART, payload);
    console.log('[Socket] RESTART:', payload);
  }

  /**
   * Send player input action
   *
   * Rate-limited by server (50ms cooldown)
   *
   * @param room - Room name/ID
   * @param action - Input action (LEFT, RIGHT, DOWN, ROTATE, DROP)
   *
   * Server will respond with:
   * - STATE event (updated game state)
   * - GAME_OVER event (if game ends)
   */
  sendInput(room: string, action: InputAction): void {
    if (!this.socket) {
      console.error('[Socket] Cannot send input: Not connected');
      return;
    }

    const payload: InputPayload = { room, action };
    this.socket.emit(C2S_EVENTS.INPUT, payload);
    // Don't log every input to avoid spam
  }

  /* =========================================================================
   * SERVER → CLIENT METHODS (Listen for events from backend)
   * ========================================================================= */

  /**
   * Listen for lobby updates
   *
   * Triggered when:
   * - Player joins the room
   * - Player leaves the room
   * - Game starts/restarts
   *
   * @param handler - Callback with lobby data
   * @returns Cleanup function to remove listener
   */
  onLobbyUpdate(handler: LobbyHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for LOBBY: Not connected');
      return () => {};
    }

    this.socket.on(S2C_EVENTS.LOBBY, handler);
    return () => this.socket?.off(S2C_EVENTS.LOBBY, handler);
  }

  /**
   * Listen for game state updates
   *
   * Triggered:
   * - Every 500ms during gameplay (game tick)
   * - After player input
   * - When game starts/restarts
   *
   * @param handler - Callback with full game state
   * @returns Cleanup function to remove listener
   */
  onStateUpdate(handler: StateHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for STATE: Not connected');
      return () => {};
    }

    this.socket.on(S2C_EVENTS.STATE, handler);
    return () => this.socket?.off(S2C_EVENTS.STATE, handler);
  }

  /**
   * Listen for game started event
   *
   * Triggered when host starts the game
   *
   * @param handler - Callback with game started data
   * @returns Cleanup function to remove listener
   */
  onGameStarted(handler: GameStartedHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for GAME_STARTED: Not connected');
      return () => {};
    }

    this.socket.on(S2C_EVENTS.GAME_STARTED, handler);
    return () => this.socket?.off(S2C_EVENTS.GAME_STARTED, handler);
  }

  /**
   * Listen for game restarted event
   *
   * Triggered when host restarts the game
   *
   * @param handler - Callback with game restarted data
   * @returns Cleanup function to remove listener
   */
  onGameRestarted(handler: GameRestartedHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for GAME_RESTARTED: Not connected');
      return () => {};
    }

    this.socket.on(S2C_EVENTS.GAME_RESTARTED, handler);
    return () => this.socket?.off(S2C_EVENTS.GAME_RESTARTED, handler);
  }

  /**
   * Listen for game over event
   *
   * Triggered when game ends (≤1 players alive)
   *
   * @param handler - Callback with winner info
   * @returns Cleanup function to remove listener
   */
  onGameOver(handler: GameOverHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for GAME_OVER: Not connected');
      return () => {};
    }

    this.socket.on(S2C_EVENTS.GAME_OVER, handler);
    return () => this.socket?.off(S2C_EVENTS.GAME_OVER, handler);
  }

  /**
   * Listen for server errors
   *
   * Triggered when server rejects a request
   * Examples: "Only host can start", "Room not found", "Game already started"
   *
   * @param handler - Callback with error message
   * @returns Cleanup function to remove listener
   */
  onError(handler: ErrorHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for ERROR: Not connected');
      return () => {};
    }

    this.socket.on(S2C_EVENTS.ERROR, handler);
    return () => this.socket?.off(S2C_EVENTS.ERROR, handler);
  }

  /**
   * Listen for connection events
   *
   * @param handler - Callback when connected
   * @returns Cleanup function to remove listener
   */
  onConnect(handler: ConnectionHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for connect: Not connected');
      return () => {};
    }

    this.socket.on('connect', handler);
    return () => this.socket?.off('connect', handler);
  }

  /**
   * Listen for disconnection events
   *
   * @param handler - Callback when disconnected
   * @returns Cleanup function to remove listener
   */
  onDisconnect(handler: ConnectionHandler): () => void {
    if (!this.socket) {
      console.warn('[Socket] Cannot listen for disconnect: Not connected');
      return () => {};
    }

    this.socket.on('disconnect', handler);
    return () => this.socket?.off('disconnect', handler);
  }
}

// Export singleton instance
export const socketService = new SocketService();
