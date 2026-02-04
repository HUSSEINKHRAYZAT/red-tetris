/**
 * TetrisBoard Component
 *
 * Renders a 10x20 Tetris game board using CSS Grid ONLY.
 * NO tables, NO canvas, NO SVG (strict spec requirement).
 *
 * Features:
 * - Pure CSS Grid layout (10 columns × 20 rows)
 * - Color-coded blocks using PIECE_COLORS from static.ts
 * - Renders boardWithPiece (merged board + active piece)
 * - Penalty line visualization (indestructible blocks)
 * - Responsive cell sizing
 *
 * @param board - 20x10 board array with piece overlay
 * @param isActive - Whether this is the active player's board
 */

import React from 'react';
import { BOARD_CONFIG, PIECE_COLORS } from '../..//lib/static';
import { cn } from '../../lib/utils';

interface TetrisBoardProps {
  /** 20x10 board grid (0=empty, 1=locked, 2=falling piece) */
  board: number[][] | null;

  /** Whether this is the active player (adds visual emphasis) */
  isActive?: boolean;

  /** Optional CSS classes */
  className?: string;
}

/**
 * Get Tailwind classes for a board cell based on its value
 *
 * @param cellValue - Cell state (0=empty, 1=locked, 2=falling)
 * @returns Tailwind CSS classes for the cell
 */
function getCellClasses(cellValue: number): string {
  return PIECE_COLORS[cellValue] || PIECE_COLORS[0];
}

export default function TetrisBoard({ board, isActive = false, className }: TetrisBoardProps) {
  // Show empty board if board data is null
  if (!board || board.length === 0) {
    board = Array.from({ length: BOARD_CONFIG.ROWS }, () =>
      Array(BOARD_CONFIG.COLS).fill(0)
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm',
        isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-gray-950',
        className
      )}
    >
      {/* Board border/frame */}
      <div
        className={cn(
          'p-1 rounded shadow-2xl',
          isActive
            ? 'bg-gradient-to-b from-primary/50 to-primary/10'
            : 'bg-gradient-to-b from-gray-800/50 to-gray-900/10'
        )}
      >
        {/* CSS Grid: 10 columns × 20 rows */}
        <div
          className="grid gap-[1px] bg-primary/10"
          style={{
            gridTemplateColumns: `repeat(${BOARD_CONFIG.COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_CONFIG.ROWS}, minmax(0, 1fr))`,
            width: '300px',
            height: '600px',
          }}
        >
          {/* Render each cell */}
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  'border border-white/5 transition-colors duration-75',
                  getCellClasses(cell)
                )}
                data-row={rowIndex}
                data-col={colIndex}
              />
            ))
          )}
        </div>
      </div>

      {/* Visual overlay for empty board state */}
      {board.every((row) => row.every((cell) => cell === 0)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-700 font-mono text-xs uppercase tracking-wider">
            Empty Board
          </p>
        </div>
      )}
    </div>
  );
}
