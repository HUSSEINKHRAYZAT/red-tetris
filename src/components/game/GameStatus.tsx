/**
 * GameStatus Component
 *
 * Displays current game state and messages
 *
 * Features:
 * - Lobby state (waiting for host)
 * - Playing state (game active)
 * - Game Over state (winner announcement)
 * - Real-time status messages
 *
 * @param started - Whether game has started
 * @param gameOver - Whether game is over
 * @param winner - Winner's socket ID (if game over)
 * @param mySocketId - Current player's socket ID
 * @param winnerName - Winner's name
 * @param isHost - Whether current player is host
 */

import { useState, useEffect } from 'react';
import { GAME_MESSAGES } from '../../lib/static';
import { cn } from '../../lib/utils';

interface GameStatusProps {
  /** Whether game has started */
  started: boolean;

  /** Whether game is over */
  gameOver: boolean;

  /** Winner's socket ID (null if no winner) */
  winner: string | null;

  /** Current player's socket ID */
  mySocketId: string | null;

  /** Winner's display name */
  winnerName?: string;

  /** Whether current player is host */
  isHost: boolean;

  /** Optional CSS classes */
  className?: string;
}

export default function GameStatus({
  started,
  gameOver,
  winner,
  mySocketId,
  winnerName,
  isHost,
  className,
}: GameStatusProps) {
  // Local state to allow host to dismiss the lobby overlay so they can access host controls
  const [overlayHidden, setOverlayHidden] = useState(false);

  // Reset overlayHidden when returning to lobby (e.g., after restart) so dialog shows again
  useEffect(() => {
    if (!started && !gameOver) {
      setOverlayHidden(false);
    }
  }, [started, gameOver]);

  // Don't show status overlay if game is in progress
  if (started && !gameOver) {
    return null;
  }

  // If host has dismissed the lobby overlay, don't show it (only applies to lobby, not gameOver)
  if (!started && !gameOver && isHost && overlayHidden) {
    return null;
  }

  // Determine status message
  let message = '';
  let subMessage = '';
  let statusColor = 'text-gray-400';

  if (!started) {
    // Lobby state
    if (isHost) {
      message = 'Lobby';
      subMessage = 'Press Start Game when ready';
      statusColor = 'text-primary';
    } else {
      message = 'Waiting...';
      subMessage = GAME_MESSAGES.WAITING_FOR_HOST;
      statusColor = 'text-gray-400';
    }
  } else if (gameOver) {
    // Game over state
    if (winner === mySocketId) {
      message = GAME_MESSAGES.YOU_WIN;
      subMessage = winnerName ? `${winnerName} wins!` : 'Victory!';
      statusColor = 'text-green-400';
    } else if (winner) {
      message = GAME_MESSAGES.YOU_LOSE;
      subMessage = winnerName ? `${winnerName} wins!` : 'Game Over';
      statusColor = 'text-red-400';
    } else {
      message = GAME_MESSAGES.GAME_OVER;
      subMessage = 'No winner';
      statusColor = 'text-gray-400';
    }
  }

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="bg-[#0f0f0f] border-4 border-primary/30 p-12 rounded-xl shadow-2xl max-w-md text-center">
        <h2
          className={cn(
            'text-4xl font-display mb-4 drop-shadow-[0_0_12px_rgba(255,7,58,0.8)]',
            statusColor
          )}
        >
          {message}
        </h2>
        <p className="text-lg font-mono text-gray-300 mb-6">{subMessage}</p>

        {/* Allow host to close the lobby overlay so they can interact with the page */}
        {!started && !gameOver && isHost && (
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-primary text-black font-medium rounded hover:opacity-90"
              onClick={() => setOverlayHidden(true)}
            >
              Close
            </button>
          </div>
        )}

        {/* Additional info for game over */}
        {gameOver && isHost && (
          <p className="text-sm font-mono text-gray-500 italic">
            Use the Restart button to play again
          </p>
        )}
        {gameOver && !isHost && (
          <p className="text-sm font-mono text-gray-500 italic">
            Waiting for host to restart...
          </p>
        )}
      </div>
    </div>
  );
}
