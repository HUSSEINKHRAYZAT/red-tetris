/**
 * HostControls Component
 *
 * Start/Restart game buttons - VISIBLE ONLY TO HOST
 *
 * Features:
 * - Start Game dialog (enabled only for host, only in lobby)
 * - Restart Game button (enabled only for host, only after game ends)
 * - Conditional rendering based on isHost flag from backend
 * - Visual feedback for button states
 *
 * @param isHost - Whether current player is the host
 * @param started - Whether game has started
 * @param gameOver - Whether game has ended
 * @param onStart - Callback to emit START event
 * @param onRestart - Callback to emit RESTART event
 */

import { useState } from 'react';
import { cn } from '../..//lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';

interface HostControlsProps {
  /** Whether current player is host */
  isHost: boolean;

  /** Whether game has started */
  started: boolean;

  /** Whether game is over (≤1 player alive) */
  gameOver: boolean;

  /** Callback when host clicks Start Game */
  onStart: () => void;

  /** Callback when host clicks Restart Game */
  onRestart: () => void;

  /** Optional CSS classes */
  className?: string;
}

export default function HostControls({
  isHost,
  started,
  gameOver,
  onStart,
  onRestart,
  className,
}: HostControlsProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);

  // Don't render anything if not host
  if (!isHost) {
    return null;
  }

  const handleStartGame = () => {
    onStart();
    setShowStartDialog(false);
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Start Game Dialog (only in lobby, before game starts) */}
      {!started && (
        <>
          <button
            onClick={() => setShowStartDialog(true)}
            className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,7,58,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center justify-center gap-2">
              <span>▶</span>
              <span>Open Lobby</span>
            </span>
          </button>

          <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
            <DialogContent className="bg-[#0a0a0a] border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Ready to Start?</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Make sure all players have joined the room before starting the game.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleStartGame}
                  className="w-full px-6 py-4 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,7,58,0.6)] transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>▶</span>
                    <span>Start Game</span>
                  </span>
                </button>

                <DialogClose asChild>
                  <button className="w-full px-6 py-3 bg-transparent border border-gray-700 rounded text-white hover:bg-gray-800 transition-colors">
                    Cancel
                  </button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Restart Game Button (only after game ends) */}
      {started && gameOver && (
        <button
          onClick={onRestart}
          className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,7,58,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🔄</span>
            <span>Restart Game</span>
          </span>
        </button>
      )}

      {/* Host Badge (always visible to host) */}
      <div className="bg-primary/10 border border-primary/30 px-3 py-2 rounded text-center">
        <p className="text-[10px] text-primary uppercase tracking-widest font-mono font-bold">
          ★ Host Privileges ★
        </p>
        <p className="text-[9px] text-gray-400 mt-1 font-mono">
          {!started
            ? 'You can start the game'
            : gameOver
            ? 'You can restart the game'
            : 'Game in progress'}
        </p>
      </div>
    </div>
  );
}
