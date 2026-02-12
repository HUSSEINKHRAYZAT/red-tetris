/**
 * Spectrum Utilities
 *
 * Converts full Tetris boards to spectrum (column height) representations
 * for opponent visualization. This enforces the privacy requirement:
 * players see only column heights of opponents, not their full boards.
 *
 * CRITICAL: The backend broadcasts full boards for all players, but the
 * frontend MUST convert opponent boards to spectrum before rendering.
 *
 * Spectrum Format: Array of 10 numbers (0-20) representing the height
 * of the highest block in each column from bottom to top.
 */

import type { GamePlayer, StatePayload } from './types';

/**
 * Calculate spectrum (column heights) from a Tetris board
 *
 * @param board - 20x10 board array (row 0 = top, row 19 = bottom)
 * @returns Array of 10 heights [h0, h1, ..., h9] where h = blocks from bottom (0-20)
 *
 * @example
 * const board = [
 *   [0,0,0,0,0,0,0,0,0,0],  // row 0 (top)
 *   ...
 *   [1,1,0,0,0,0,0,0,1,1],  // row 19 (bottom)
 * ];
 * const spectrum = calculateSpectrum(board);
 * // [1, 1, 0, 0, 0, 0, 0, 0, 1, 1] - column heights from bottom
 */
export function calculateSpectrum(board: number[][] | null): number[] {
  // Return empty spectrum if board is null or invalid
  if (!board || board.length === 0) {
    return Array(10).fill(0);
  }

  const COLS = 10;
  const ROWS = board.length;
  const spectrum: number[] = Array(COLS).fill(0);

  // For each column, find the highest non-empty cell
  for (let col = 0; col < COLS; col++) {
    let height = 0;

    // Scan from bottom (row 19) to top (row 0)
    for (let row = ROWS - 1; row >= 0; row--) {
      // Check if cell exists and is not empty (non-zero)
      if (board[row] && board[row][col] && board[row][col] !== 0) {
        // Height = distance from bottom + 1
        // (row 19 has height 1, row 18 has height 2, etc.)
        height = ROWS - row;
        break;
      }
    }

    spectrum[col] = height;
  }

  return spectrum;
}

/**
 * Opponent data with spectrum (sanitized - no board data)
 */
export interface OpponentData {
  /** Player's socket ID */
  id: string;

  /** Player's display name */
  name: string;

  /** Whether this player is still alive */
  alive: boolean;

  /** Total lines cleared */
  lines: number;

  /** Lines cleared in last move */
  lastClear: number;

  /** Column heights (0-20) - NO full board data */
  spectrum: number[];
}

/**
 * Sanitized game state for rendering
 * Separates current player (full board) from opponents (spectrum only)
 */
export interface SanitizedGameState {
  /** Current room */
  room: string;

  /** Whether game has started */
  started: boolean;

  /** Full data for current player (with board) */
  myPlayer: GamePlayer | null;

  /** Sanitized opponent data (spectrum only - NO boards) */
  opponents: OpponentData[];
}

/**
 * Sanitize game state to enforce privacy requirements
 *
 * Converts raw STATE payload from backend into sanitized state:
 * - Current player keeps full board data
 * - Opponents get spectrum only (boards discarded)
 *
 * @param rawState - Raw STATE event payload from backend
 * @param mySocketId - Current player's socket ID
 * @returns Sanitized state safe for rendering
 *
 * @example
 * socket.on('STATE', (rawState) => {
 *   const cleanState = sanitizeGameState(rawState, socket.id);
 *   setGameState(cleanState); // Pass clean state to UI
 * });
 */
export function sanitizeGameState(
  rawState: StatePayload,
  mySocketId: string | null
): SanitizedGameState {
  if (!mySocketId) {
    return {
      room: rawState.room,
      started: rawState.started,
      myPlayer: null,
      opponents: [],
    };
  }

  // Find current player
  const myPlayer = rawState.players.find((p) => p.id === mySocketId) || null;

  // Convert all other players to opponent data with spectrum only
  const opponents: OpponentData[] = rawState.players
    .filter((p) => p.id !== mySocketId)
    .map((p) => ({
      id: p.id,
      name: p.name,
      alive: p.alive,
      lines: p.lines,
      lastClear: p.lastClear,
      // CRITICAL: Convert board to spectrum from locked blocks only (discard active/falling piece)
      // Use the raw `board` (locked cells) instead of `boardWithPiece` which includes the current falling piece.
      spectrum: calculateSpectrum(p.board),
    }));

  return {
    room: rawState.room,
    started: rawState.started,
    myPlayer,
    opponents,
  };
}

/**
 * Get color class for spectrum bar based on height
 *
 * @param height - Column height (0-20)
 * @returns Tailwind color class (gradient intensity based on height)
 */
export function getSpectrumColor(height: number): string {
  if (height === 0) return 'bg-gray-800';
  if (height <= 5) return 'bg-gradient-to-t from-green-500 to-green-400';
  if (height <= 10) return 'bg-gradient-to-t from-yellow-500 to-yellow-400';
  if (height <= 15) return 'bg-gradient-to-t from-orange-500 to-orange-400';
  return 'bg-gradient-to-t from-red-600 to-red-500'; // Danger zone
}
