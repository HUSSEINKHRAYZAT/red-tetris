/**
 * PlayerCard Component
 *
 * Displays current player's information and stats
 *
 * Features:
 * - Player name with host badge (if applicable)
 * - Lines cleared count
 * - Alive/Dead status indicator
 * - Next piece preview (future enhancement)
 * - Visual emphasis when active
 *
 * @param player - Current player data from game state
 */

import React from 'react';
import type { GamePlayer } from '../..//lib/utils/types';
import { cn } from '../..//lib/utils';

interface PlayerCardProps {
  /** Player data (can be null if not in game) */
  player: GamePlayer | null;

  /** Optional CSS classes */
  className?: string;
}

export default function PlayerCard({ player, className }: PlayerCardProps) {
  if (!player) {
    return (
      <div
        className={cn(
          'bg-[#0f0f0f] border-l-4 border-gray-700/30 p-5 rounded-r-lg shadow-lg',
          className
        )}
      >
        <p className="text-gray-600 font-mono text-sm">No player data</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-[#0f0f0f] border-l-4 p-5 rounded-r-lg shadow-lg transition-all',
        player.alive
          ? 'border-primary hover:shadow-[0_0_15px_rgba(255,7,58,0.5)]'
          : 'border-gray-700/50 opacity-60',
        className
      )}
    >
      {/* Player Name + Host Badge */}
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-mono text-lg font-bold text-white uppercase truncate">
          {player.name}
        </h2>
        {player.isHost && (
          <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 border border-primary/30 rounded uppercase font-mono">
            Host
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3 font-mono">
        {/* Lines Cleared */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 uppercase text-xs">Lines</span>
          <span className="text-white font-bold">{player.lines || 0}</span>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 uppercase text-xs">Status</span>
          <span
            className={cn(
              'font-bold uppercase text-xs',
              player.alive ? 'text-green-400' : 'text-red-600'
            )}
          >
            {player.alive ? 'Alive' : 'KO'}
          </span>
        </div>

        {/* Last Clear (if any) */}
        {player.lastClear > 0 && player.alive && (
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 uppercase">Last Clear:</span>
              <span className="text-primary font-bold">+{player.lastClear} Lines</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
