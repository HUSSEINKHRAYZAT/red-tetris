/**
 * OpponentsPanel Component
 *
 * Displays all opponents with SPECTRUM VISUALIZATION ONLY (privacy enforcement)
 *
 * CRITICAL: Backend sends full boards, but this component ONLY receives
 * sanitized opponent data with spectrum (column heights) - NO board data.
 *
 * Features:
 * - List all opponents (name, alive status, lines cleared)
 * - Spectrum bar graph (10 columns, height 0-20)
 * - Penalty notification badges
 * - Knockout (KO) visual state
 * - Scrollable list for many opponents
 *
 * @param opponents - Sanitized opponent data (spectrum only - NO boards)
 */

import React from 'react';
import type { OpponentData } from '../..//lib/utils/spectrum';
import { getSpectrumColor } from '../..//lib/utils/spectrum';
import { cn } from '../..//lib/utils';

interface OpponentsPanelProps {
  /** Sanitized opponents (spectrum only - NO board data) */
  opponents: OpponentData[];

  /** Optional CSS classes */
  className?: string;
}

/**
 * Single opponent card with spectrum visualization
 */
function OpponentCard({ opponent }: { opponent: OpponentData }) {
  return (
    <div
      className={cn(
        'bg-[#0f0f0f] border-l-4 p-4 rounded-r-lg shadow-lg transition-all group',
        opponent.alive
          ? 'border-primary hover:shadow-[0_0_15px_rgba(255,7,58,0.5)]'
          : 'border-gray-700/50 opacity-60'
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Name + Penalty Badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-mono truncate',
              opponent.alive ? 'text-white' : 'text-gray-400'
            )}
          >
            {opponent.name}
          </span>

          {/* Last Clear Penalty Badge */}
          {opponent.lastClear > 0 && opponent.alive && (
            <span className="text-[8px] bg-red-900/50 text-red-400 px-1 border border-red-500/30 uppercase font-mono">
              +{opponent.lastClear} Lines
            </span>
          )}
        </div>

        {/* Spectrum Visualization (Column Heights) */}
        <div className="flex items-end gap-[2px] h-12 w-32 bg-black/20 p-1 rounded">
          {opponent.spectrum.map((height, colIdx) => (
            <div
              key={colIdx}
              className={cn(
                'rounded-t-sm transition-all duration-300',
                opponent.alive ? getSpectrumColor(height) : 'bg-gray-600'
              )}
              style={{
                width: '8px',
                height: `${(height / 20) * 100}%`,
              }}
              title={`Column ${colIdx}: ${height}/20`}
            />
          ))}
        </div>
      </div>

      {/* Status + Lines */}
      <div className="text-right mt-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-mono uppercase">Lines</span>
          <span className="text-white font-mono font-bold">{opponent.lines || 0}</span>
        </div>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-gray-500 font-mono uppercase">Status</span>
          <span
            className={cn(
              'font-mono font-bold uppercase',
              opponent.alive ? 'text-green-400' : 'text-red-600'
            )}
          >
            {opponent.alive ? 'Alive' : 'KO'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OpponentsPanel({ opponents, className }: OpponentsPanelProps) {
  return (
    <aside className={cn('w-80 flex flex-col gap-4', className)}>
      {/* Header */}
      <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest px-1">
        Opponents ({opponents.length})
      </h3>

      {/* Opponents List (scrollable) */}
      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
        {opponents.length === 0 ? (
          <div className="bg-[#0f0f0f] border-l-4 border-gray-700/30 p-4 rounded-r-lg">
            <p className="text-gray-600 font-mono text-sm">No opponents</p>
          </div>
        ) : (
          opponents.map((opponent) => <OpponentCard key={opponent.id} opponent={opponent} />)
        )}
      </div>

      {/* Penalty Queue Info (future enhancement - can show pending penalties) */}
      {/* Uncomment when backend supports penalty queue
      <div className="mt-auto bg-[#0f0f0f] border-l-4 border-red-500/50 p-3 rounded-r-lg shadow-lg flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">warning</span>
        <div className="text-[10px] font-mono leading-tight">
          <p className="text-primary font-bold">PENALTY QUEUE</p>
          <p className="text-gray-400">Next drop adds X lines to board.</p>
        </div>
      </div>
      */}
    </aside>
  );
}
