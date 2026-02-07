/**
 * useGameRoom Hook
 *
 * High-level hook for managing a game room's state and interactions.
 * Combines socket events with local state management.
 *
 * Features:
 * - Automatic lobby state tracking
 * - Game state synchronization
 * - Player list management
 * - Host detection
 * - Error handling
 *
 * Usage:
 * ```typescript
 * import { useGameRoom } from '@/lib/socket/hooks/useGameRoom';
 *
 * function GameLobby() {
 *   const {
 *     lobbyState,
 *     gameState,
 *     players,
 *     isHost,
 *     canStart,
 *     error,
 *     joinRoom,
 *     startGame,
 *   } = useGameRoom('room1');
 *
 *   return (
 *     <div>
 *       <h1>Room: room1</h1>
 *       <p>Players: {players.length}</p>
 *       {isHost && canStart && (
 *         <button onClick={startGame}>Start Game</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { socketStorage } from '../../utils/storage';
import type {
  LobbyPayload,
  StatePayload,
  GameOverPayload,
  LobbyPlayer,
  GamePlayer,
} from '../../utils/types';

export interface UseGameRoomReturn {
  /** Current lobby state */
  lobbyState: LobbyPayload | null;

  /** Current game state (available when game is running) */
  gameState: StatePayload | null;

  /** List of players in the room */
  players: LobbyPlayer[] | GamePlayer[];

  /** Whether current user is the host */
  isHost: boolean;

  /** Whether the game has started */
  isStarted: boolean;

  /** Whether the game is over */
  isGameOver: boolean;

  /** Winner's socket ID (if game is over) */
  winner: string | null;

  /** Whether the host can start (≥2 players recommended) */
  canStart: boolean;

  /** Last error message */
  error: string | null;

  /** Join the room */
  joinRoom: (playerName: string) => void;

  /** Start the game (host only) */
  startGame: () => void;

  /** Restart the game (host only) */
  restartGame: () => void;

  /** Clear error message */
  clearError: () => void;
}

/**
 * Hook for managing a game room
 *
 * @param roomName - Name of the room to join
 * @returns Room state and methods
 */
export function useGameRoom(roomName: string): UseGameRoomReturn {
  const [lobbyState, setLobbyState] = useState<LobbyPayload | null>(null);
  const [gameState, setGameState] = useState<StatePayload | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Computed state
  const players = gameState?.players ?? lobbyState?.players ?? [];
  const socketId = socketService.getSocketId();
  const isHost = players.some(
    (p) => ('id' in p ? p.id === socketId : false) && p.isHost
  ) || (lobbyState?.players.some((p) => p.isHost) === false && players.length === 1);
  const isStarted = lobbyState?.started ?? gameState?.started ?? false;
  const canStart = !isStarted && players.length >= 2 && isHost;

  // Listen for lobby updates
  useEffect(() => {
    const unsubscribe = socketService.onLobbyUpdate((data) => {
      if (data.room === roomName) {
        setLobbyState(data);
        socketStorage.setCurrentRoom(roomName);
      }
    });

    return unsubscribe;
  }, [roomName]);

  // Listen for game state updates
  useEffect(() => {
    const unsubscribe = socketService.onStateUpdate((data) => {
      if (data.room === roomName) {
        setGameState(data);
        setIsGameOver(false); // Reset game over when receiving state
      }
    });

    return unsubscribe;
  }, [roomName]);

  // Listen for game started
  useEffect(() => {
    const unsubscribe = socketService.onGameStarted((data) => {
      if (data.room === roomName) {
        setIsGameOver(false);
        setWinner(null);
      }
    });

    return unsubscribe;
  }, [roomName]);

  // Listen for game restarted
  useEffect(() => {
    const unsubscribe = socketService.onGameRestarted((data) => {
      if (data.room === roomName) {
        setIsGameOver(false);
        setWinner(null);
        setGameState(null);
      }
    });

    return unsubscribe;
  }, [roomName]);

  // Listen for game over
  useEffect(() => {
    const unsubscribe = socketService.onGameOver((data: GameOverPayload) => {
      if (data.room === roomName) {
        setIsGameOver(true);
        setWinner(data.winner);
      }
    });

    return unsubscribe;
  }, [roomName]);

  // Listen for errors
  useEffect(() => {
    const unsubscribe = socketService.onError((data) => {
      setError(data.message);
      socketStorage.setLastError(data.message);
    });

    return unsubscribe;
  }, []);

  // Methods
  const joinRoom = useCallback(
    (playerName: string) => {
      socketService.joinRoom(roomName, playerName);
      socketStorage.setPlayerName(playerName);
      setError(null);
    },
    [roomName]
  );

  const startGame = useCallback(() => {
    if (!isHost) {
      setError('Only the host can start the game');
      return;
    }
    socketService.startGame(roomName);
    setError(null);
  }, [roomName, isHost]);

  const restartGame = useCallback(() => {
    if (!isHost) {
      setError('Only the host can restart the game');
      return;
    }
    socketService.restartGame(roomName);
    setError(null);
  }, [roomName, isHost]);

  const clearError = useCallback(() => {
    setError(null);
    socketStorage.clearLastError();
  }, []);

  return {
    lobbyState,
    gameState,
    players,
    isHost,
    isStarted,
    isGameOver,
    winner,
    canStart,
    error,
    joinRoom,
    startGame,
    restartGame,
    clearError,
  };
}
