/**
 * GameControls Component
 *
 * Visual representation of keyboard controls with real-time feedback
 *
 * Features:
 * - Display all 5 mandatory control keys
 * - Input cooldown indicator (50ms throttle)
 * - Visual keypress feedback
 * - "Waiting for host" message for guests in lobby
 *
 * @param isPlaying - Whether game is currently active
 * @param isHost - Whether current player is host
 * @param started - Whether game has started
 * @param lastInputTime - Timestamp of last input (for throttle indicator)
 */

import React from 'react';
import { CONTROL_LABELS, BOARD_CONFIG } from '../../lib/static';
import { cn } from '../..//lib/utils';

interface GameControlsProps {
  /** Whether game is currently active */
  isPlaying: boolean;

  /** Whether current player is host */
  isHost: boolean;

  /** Whether game has started */
  started: boolean;

  /** Timestamp of last input (for cooldown indicator) */
  lastInputTime?: number;

  /** Optional CSS classes */
  className?: string;
}

export default function GameControls({
  isPlaying,
  isHost,
  started,
  lastInputTime = 0,
  className,
}: GameControlsProps) {
  // Calculate whether input is on cooldown (50ms throttle)
  const now = Date.now();
  const onCooldown = now - lastInputTime < BOARD_CONFIG.INPUT_THROTTLE_MS;
  const cooldownProgress = onCooldown
    ? ((now - lastInputTime) / BOARD_CONFIG.INPUT_THROTTLE_MS) * 100
    : 100;

  return (
    <div
      className={cn(
        'bg-[#0f0f0f] border-l-4 border-primary/30 p-4 rounded-r-lg shadow-lg',
        className
      )}
    >
      <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
        Controls
      </h3>

      {/* Control List */}
      <div className="space-y-2 font-mono text-[11px]">
        {CONTROL_LABELS.map((control, idx) => (
          <div key={idx} className="flex justify-between items-center text-gray-400">
            <span>{control.action}</span>
            <span className="text-white bg-white/10 px-1.5 rounded">{control.key}</span>
          </div>
        ))}
      </div>

      {/* Input Cooldown Indicator (only during gameplay) */}
      {isPlaying && started && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[9px] text-gray-500 uppercase mb-1">Input Cooldown</p>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-50',
                onCooldown ? 'bg-red-500' : 'bg-green-500'
              )}
              style={{ width: `${cooldownProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Waiting for Host Message (guests in lobby) */}
      {!started && !isHost && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[10px] text-gray-400 font-mono italic text-center">
            Waiting for host to start...
          </p>
        </div>
      )}
    </div>
  );
}
