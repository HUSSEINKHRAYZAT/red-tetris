/**
 * PlayerLobbyCard Component
 *
 * Displays player information in the lobby dialog
 *
 * Features:
 * - Player name and socket ID
 * - Host badge
 * - Win/Loss status from previous round
 * - Consistent theme with main UI
 */

import { cn } from '@/lib/utils';

interface PlayerLobbyCardProps {
  /** Player name */
  name: string;

  /** Player socket ID */
  socketId: string;

  /** Whether this player is the host */
  isHost: boolean;

  /** Result from previous round: true = won, false = lost, null = no result yet */
  lastRoundResult?: boolean | null;

	/** Whether this is the current player (me) */
  isMe?: boolean;
}

export default function PlayerLobbyCard({
  name,
  socketId,
  isHost,
  lastRoundResult,
  isMe,
}: PlayerLobbyCardProps) {
  return (
    <div
      className={cn(
        'bg-[#0f0f0f] border-l-4 rounded-r-lg p-4 shadow-lg transition-all',
        isMe ? 'border-primary shadow-primary/20' : 'border-gray-700',
        'hover:shadow-xl hover:translate-x-1'
      )}
    >
      <div className="flex items-center justify-between">
        {/* Player Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-lg text-white">{name}</h3>
            {isMe && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-mono rounded border border-primary/30">
                YOU
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-gray-500">{socketId}</p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {/* Host Badge */}
          {isHost && (
            <span className="px-2 py-1 bg-primary text-black text-xs font-bold rounded uppercase">
              Host
            </span>
          )}

          {/* Last Round Result Badge */}
          {lastRoundResult === true && (
            <span className="px-2 py-1 bg-green-500 text-black text-xs font-bold rounded uppercase">
              Winner
            </span>
          )}
          {lastRoundResult === false && (
            <span className="px-2 py-1 bg-red-500 text-black text-xs font-bold rounded uppercase">
              Lost
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
