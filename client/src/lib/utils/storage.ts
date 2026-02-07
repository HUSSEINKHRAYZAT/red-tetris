/**
 * Socket Storage
 *
 * Centralized state management for socket-related data.
 * Uses localStorage for persistence and provides reactive state updates.
 *
 * Features:
 * - Player name persistence
 * - Current room tracking
 * - Connection state
 * - Error handling
 *
 * Usage:
 * ```typescript
 * import { socketStorage } from '@/lib/socket/storage';
 *
 * // Save player name
 * socketStorage.setPlayerName('Alice');
 *
 * // Get player name
 * const name = socketStorage.getPlayerName();
 *
 * // Set current room
 * socketStorage.setCurrentRoom('room1');
 *
 * // Clear all data
 * socketStorage.clear();
 * ```
 */

const STORAGE_KEYS = {
  PLAYER_NAME: 'red-tetris:player-name',
  CURRENT_ROOM: 'red-tetris:current-room',
  LAST_ERROR: 'red-tetris:last-error',
  SOCKET_ID: 'red-tetris:socket-id',
} as const;

class SocketStorage {
  /**
   * Get stored player name
   *
   * @returns Player name or null if not set
   */
  getPlayerName(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    } catch (error) {
      // swallow storage read errors in browser environments
      return null;
    }
  }

  /**
   * Save player name to localStorage
   *
   * @param name - Player name to save
   */
  setPlayerName(name: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
    } catch (error) {
      // ignore storage write errors
    }
  }

  /**
   * Get current room
   *
   * @returns Current room name or null
   */
  getCurrentRoom(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_ROOM);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save current room to localStorage
   *
   * @param room - Room name to save
   */
  setCurrentRoom(room: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM, room);
    } catch (error) {
      // ignore storage write errors
    }
  }

  /**
   * Get last error message
   *
   * @returns Last error message or null
   */
  getLastError(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_ERROR);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save last error message
   *
   * @param error - Error message to save
   */
  setLastError(error: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ERROR, error);
    } catch (error) {
      // ignore storage write errors
    }
  }

  /**
   * Get stored socket id
   * @returns socket id or null
   */
  getSocketId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SOCKET_ID);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save socket id to localStorage
   */
  setSocketId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOCKET_ID, id);
    } catch (error) {
      // ignore storage write errors
    }
  }

  /**
   * Clear stored socket id
   */
  clearSocketId(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SOCKET_ID);
    } catch (error) {
      // ignore storage errors
    }
  }

  /**
   * Clear current room from storage
   */
  clearCurrentRoom(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROOM);
    } catch (error) {
      // ignore storage errors
    }
  }

  /**
   * Clear last error from storage
   */
  clearLastError(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_ERROR);
    } catch (error) {
      // ignore storage errors
    }
  }

  /**
   * Clear all socket-related data from storage
   */
  clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      // ignore storage errors
    }
  }

  /**
   * Check if player name is stored
   *
   * @returns True if player name exists
   */
  hasPlayerName(): boolean {
    return this.getPlayerName() !== null;
  }

  /**
   * Check if current room is set
   *
   * @returns True if current room exists
   */
  hasCurrentRoom(): boolean {
    return this.getCurrentRoom() !== null;
  }
}

// Export singleton instance
export const socketStorage = new SocketStorage();
