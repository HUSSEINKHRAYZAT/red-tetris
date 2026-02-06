/**
 * useSocket Hook
 *
 * React hook for managing socket connection and state in components.
 * Provides automatic connection/disconnection and state synchronization.
 *
 * Features:
 * - Automatic connection on mount
 * - Automatic cleanup on unmount
 * - Reactive state updates
 * - Type-safe event handlers
 *
 * Usage:
 * ```typescript
 * import { useSocket } from '@/lib/socket/hooks/useSocket';
 *
 * function GameComponent() {
 *   const {
 *     isConnected,
 *     socketId,
 *     joinRoom,
 *     startGame,
 *     sendInput,
 *   } = useSocket();
 *
 *   useEffect(() => {
 *     if (isConnected) {
 *       joinRoom('room1', 'PlayerName');
 *     }
 *   }, [isConnected]);
 *
 *   return <div>Socket ID: {socketId}</div>;
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { socketService, SocketState } from '../services/socketService';
import type { InputAction } from '../../utils/types';

export interface UseSocketReturn {
  /** Whether socket is connected */
  isConnected: boolean;

  /** Current connection state */
  connectionState: SocketState;

  /** Socket ID (available after connection) */
  socketId: string | undefined;

  /** Join a game room */
  joinRoom: (room: string, name: string) => void;

  /** Start the game (host only) */
  startGame: (room: string) => void;

  /** Restart the game (host only) */
  restartGame: (room: string) => void;

  /** Send player input */
  sendInput: (room: string, action: InputAction) => void;

  /** Manually disconnect */
  disconnect: () => void;
}

/**
 * Hook for socket connection and operations
 *
 * @param autoConnect - Whether to automatically connect on mount (default: true)
 * @returns Socket state and methods
 */
export function useSocket(autoConnect = true): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<SocketState>(
    SocketState.DISCONNECTED
  );
  const [socketId, setSocketId] = useState<string | undefined>();

  // Update connection state
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
      setConnectionState(socketService.getState());
      setSocketId(socketService.getSocketId());
    };

    // Check immediately
    checkConnection();

    // Listen for connection changes
    const unsubConnect = socketService.onConnect(() => {
      checkConnection();
    });

    const unsubDisconnect = socketService.onDisconnect(() => {
      checkConnection();
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !socketService.isConnected()) {
      socketService.connect().catch((error) => {
        console.error('[useSocket] Failed to connect:', error);
      });
    }

    // Note: We don't auto-disconnect on unmount to allow
    // socket to persist across component re-renders
  }, [autoConnect]);

  // Wrapped methods with useCallback for stable references
  const joinRoom = useCallback((room: string, name: string) => {
    socketService.joinRoom(room, name);
  }, []);

  const startGame = useCallback((room: string) => {
    socketService.startGame(room);
  }, []);

  const restartGame = useCallback((room: string) => {
    socketService.restartGame(room);
  }, []);

  const sendInput = useCallback((room: string, action: InputAction) => {
    socketService.sendInput(room, action);
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return {
    isConnected,
    connectionState,
    socketId,
    joinRoom,
    startGame,
    restartGame,
    sendInput,
    disconnect,
  };
}
