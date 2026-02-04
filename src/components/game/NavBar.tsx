/**
 * NavBar Component
 *
 * Top navigation bar for the game page
 *
 * Features:
 * - Red Tetris title with neon glow
 * - Current room ID display (from storage)
 * - Real-time connection status indicator
 * - Socket ID display (for debugging)
 * - Leave room button (navigates back to main page)
 *
 * @param room - Current room name
 * @param isConnected - Socket connection status
 * @param socketId - Socket ID (for debugging)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../..//lib/utils';

interface NavBarProps {
  /** Current room name/ID */
  room: string | null;

  /** Whether socket is connected */
  isConnected: boolean;

  /** Socket ID (optional, for debugging) */
  socketId?: string | null;
}

export default function NavBar({ room, isConnected, socketId }: NavBarProps) {
  const navigate = useNavigate();

  /**
   * Handle leave room button click
   * Navigates back to main page (socket disconnect handled by hook cleanup)
   */
  const handleLeave = () => {
    navigate('/');
  };

  return (
    <nav className="p-4 border-b border-primary/20 bg-[#0a0a0a]/70 backdrop-blur-md flex justify-between items-center">
      {/* Left: Title + Connection Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-display text-primary drop-shadow-[0_0_8px_rgba(255,7,58,0.8)]">
          Red Tetris
        </h1>

        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            )}
          />
          <span className="text-xs font-mono text-gray-400 uppercase">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Socket ID (debug) */}
        {socketId && (
          <span className="text-[10px] font-mono text-gray-600 hidden md:block">
            ID: {socketId.slice(0, 8)}...
          </span>
        )}
      </div>

      {/* Center: Room Badge */}
      {room && (
        <div className="absolute left-1/2 transform -translate-x-1/2 px-3 py-1 bg-primary/10 border border-primary/30 rounded text-xs font-mono text-primary uppercase tracking-widest">
          Room: {room}
        </div>
      )}

      {/* Right: Leave Button */}
      <div className="flex items-center gap-6 font-mono">
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 rounded transition-colors group"
        >
          <span className="text-xs uppercase tracking-tighter text-gray-300 group-hover:text-white">
            Leave Room
          </span>
        </button>
      </div>
    </nav>
  );
}
