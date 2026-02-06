/**
 * LobbyDialog Component
 *
 * Unified dialog for lobby and post-game states
 *
 * Features:
 * - Shows all players in the room with their info
 * - Displays host badge and win/loss status
 * - Real-time updates when players join/leave
 * - Start game button for host
 * - Waiting state for guests
 * - Consistent theme with main UI
 */

import { useEffect, useState } from 'react';
import PlayerLobbyCard from './PlayerLobbyCard';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  lastRoundResult?: boolean | null; // true = won, false = lost, null = no result yet
}

interface LobbyDialogProps {
  /** All players in the room */
  players: Player[];

  /** Current player's socket ID */
  mySocketId: string | null;

  /** Whether current player is host */
  isHost: boolean;

  /** Whether game is in post-game state (showing results) */
  isPostGame?: boolean;

  /** Callback when host clicks Start Game */
  onStart?: () => void;

  /** Optional CSS classes */
  className?: string;
}

export default function LobbyDialog({
  players,
  mySocketId,
  isHost,
  isPostGame = false,
  onStart,
  className,
}: LobbyDialogProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setAnimateIn(true);
  }, []);

  // Determine dialog title
  const title = isPostGame ? 'Round Complete' : 'Game Lobby';
  const subtitle = isPostGame
    ? 'Results from last round'
    : `${players.length} player${players.length !== 1 ? 's' : ''} in room`;

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300',
        animateIn ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div
        className={cn(
          'bg-[#0a0a0a] border-4 border-primary/30 rounded-xl shadow-2xl max-w-2xl w-full mx-4 transition-all duration-300',
          animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
      >
        {/* Header */}
        <div className="border-b border-primary/20 p-6">
          <h2 className="text-3xl font-display text-primary mb-2 drop-shadow-[0_0_12px_rgba(255,7,58,0.8)]">
            {title}
          </h2>
          <p className="text-sm font-mono text-gray-400">{subtitle}</p>
        </div>

        {/* Player List */}
        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
          {players.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-mono">
              No players in room
            </div>
          ) : (
            players.map((player) => (
              <PlayerLobbyCard
                key={player.id}
                name={player.name}
                socketId={player.id}
                isHost={player.isHost}
                lastRoundResult={player.lastRoundResult}
                isMe={player.id === mySocketId}
              />
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-primary/20 p-6">
          {isHost ? (
            <button
              className="w-full px-6 py-3 bg-primary text-black font-bold text-lg rounded hover:opacity-90 transition-opacity uppercase tracking-wider"
              onClick={onStart}
            >
              {isPostGame ? 'Start New Round' : 'Start Game'}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 font-mono text-sm mb-2">
                Waiting for host to start...
              </p>
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
