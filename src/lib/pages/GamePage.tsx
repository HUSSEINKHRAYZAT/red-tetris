/**
 * GamePage Component
 *
 * Main game page integrating all game components with socket communication
 *
 * ARCHITECTURE:
 * - Socket-only communication (no REST API)
 * - Spectrum-based opponent visualization (privacy enforcement)
 * - CSS-only board rendering (no canvas/SVG/tables)
 * - Host/guest flow with proper UI differentiation
 * - Real-time state updates via STATE events (500ms)
 * - Input throttling (50ms frontend + backend enforcement)
 *
 * CRITICAL FLOWS:
 * 1. JOIN → LOBBY → (host) START → GAME_STARTED → STATE (loop)
 * 2. STATE → sanitize → render (my board + opponent spectrums)
 * 3. INPUT → throttle → emit → STATE update
 * 4. GAME_OVER → (host) RESTART → GAME_RESTARTED → LOBBY
 *
 * @requires socketService for connection management
 * @requires storage for room/name persistence
 * @requires spectrum utilities for opponent privacy
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

// Components
import NavBar from '@/components/game/NavBar';
import PlayerCard from '@/components/game/PlayerCard';
import GameControls from '@/components/game/GameControls';
import TetrisBoard from '@/components/game/TetrisBoard';
import OpponentsPanel from '@/components/game/OpponentsPanel';
import HostControls from '@/components/game/HostControls';
import GameStatus from '@/components/game/GameStatus';

// Types & Utils
import { C2S_EVENTS, S2C_EVENTS } from '@/lib/socket/events';
import type {
  LobbyPayload,
  StatePayload,
  GameOverPayload,
  ErrorPayload,
  InputAction,
} from '@/lib/utils/types';
import { sanitizeGameState, type SanitizedGameState } from '@/lib/utils/spectrum';
import { KEY_MAPPINGS, BOARD_CONFIG } from '@/lib/static';
import { socketStorage } from '@/lib/utils/storage';

export default function GamePage() {
  const navigate = useNavigate();

  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  // Room & player state
  const [room, setRoom] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  // Game state
  const [gameState, setGameState] = useState<SanitizedGameState | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState<string>('');

  // Input throttling
  const [lastInputTime, setLastInputTime] = useState(0);
  const inputThrottleRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize socket connection and load room/name from storage
   */
  useEffect(() => {
    // Load room and name from storage
    const storedRoom = socketStorage.getCurrentRoom();
    const storedName = socketStorage.getPlayerName();

    if (!storedRoom || !storedName) {
      // Redirect to main page if no room/name
      console.warn('[GamePage] No room or name in storage, redirecting...');
      navigate('/');
      return;
    }

    setRoom(storedRoom);
    setPlayerName(storedName);

    // Initialize socket connection
    const newSocket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setIsConnected(true);
      setSocketId(newSocket.id || null);

      // Auto-join room on connect
      console.log('[Socket] Emitting JOIN:', { room: storedRoom, name: storedName });
      newSocket.emit(C2S_EVENTS.JOIN, { room: storedRoom, name: storedName });
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('[Socket] Cleanup - disconnecting');
      newSocket.disconnect();
    };
  }, [navigate]);

  /**
   * Socket event handlers
   */
  useEffect(() => {
    if (!socket) return;

    // LOBBY event (player list updates)
    const handleLobby = (data: LobbyPayload) => {
      console.log('[LOBBY]', data);
      // Update local state if needed
    };

    // GAME_STARTED event
    const handleGameStarted = () => {
      console.log('[GAME_STARTED]');
      setGameOver(false);
      setWinner(null);
    };

    // STATE event (main game state updates)
    const handleState = (rawState: StatePayload) => {
      // CRITICAL: Sanitize state to enforce privacy (spectrum only for opponents)
      const cleanState = sanitizeGameState(rawState, socketId);
      setGameState(cleanState);
    };

    // GAME_OVER event
    const handleGameOver = (data: GameOverPayload) => {
      console.log('[GAME_OVER]', data);
      setGameOver(true);
      setWinner(data.winner);

      // Find winner name
      if (data.winner && gameState) {
        const winnerPlayer =
          gameState.myPlayer?.id === data.winner
            ? gameState.myPlayer
            : gameState.opponents.find((opp) => opp.id === data.winner);

        setWinnerName(winnerPlayer?.name || 'Unknown');
      }
    };

    // GAME_RESTARTED event
    const handleGameRestarted = () => {
      console.log('[GAME_RESTARTED]');
      setGameOver(false);
      setWinner(null);
      setWinnerName('');
    };

    // ERROR event
    const handleError = (data: ErrorPayload) => {
      console.error('[ERROR]', data.message);
      alert(`Error: ${data.message}`);
    };

    // Register event handlers
    socket.on(S2C_EVENTS.LOBBY, handleLobby);
    socket.on(S2C_EVENTS.GAME_STARTED, handleGameStarted);
    socket.on(S2C_EVENTS.STATE, handleState);
    socket.on(S2C_EVENTS.GAME_OVER, handleGameOver);
    socket.on(S2C_EVENTS.GAME_RESTARTED, handleGameRestarted);
    socket.on(S2C_EVENTS.ERROR, handleError);

    // Cleanup
    return () => {
      socket.off(S2C_EVENTS.LOBBY, handleLobby);
      socket.off(S2C_EVENTS.GAME_STARTED, handleGameStarted);
      socket.off(S2C_EVENTS.STATE, handleState);
      socket.off(S2C_EVENTS.GAME_OVER, handleGameOver);
      socket.off(S2C_EVENTS.GAME_RESTARTED, handleGameRestarted);
      socket.off(S2C_EVENTS.ERROR, handleError);
    };
  }, [socket, socketId, gameState]);

  /**
   * Handle keyboard input with throttling
   */
  useEffect(() => {
    if (!socket || !room || !gameState?.started || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const action = KEY_MAPPINGS[e.key] as InputAction | undefined;

      if (!action) return;

      // Frontend throttle (50ms)
      const now = Date.now();
      if (now - lastInputTime < BOARD_CONFIG.INPUT_THROTTLE_MS) {
        return;
      }

      // Emit INPUT event
      console.log('[INPUT]', action);
      socket.emit(C2S_EVENTS.INPUT, { room, action });
      setLastInputTime(now);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket, room, gameState?.started, gameOver, lastInputTime]);

  /**
   * Host actions
   */
  const handleStart = useCallback(() => {
    if (!socket || !room) return;
    console.log('[START]');
    socket.emit(C2S_EVENTS.START, { room });
  }, [socket, room]);

  const handleRestart = useCallback(() => {
    if (!socket || !room) return;
    console.log('[RESTART]');
    socket.emit(C2S_EVENTS.RESTART, { room });
  }, [socket, room]);

  // Derived state
  const isHost = gameState?.myPlayer?.isHost || false;
  const started = gameState?.started || false;

  return (
    <div className="h-screen flex flex-col bg-bg-deep">
      {/* Navigation Bar */}
      <NavBar room={room} isConnected={isConnected} socketId={socketId} />

      {/* Main Game Area */}
      <main className="flex-grow flex gap-6 p-6 max-w-[1400px] mx-auto w-full items-start justify-center relative">
        {/* Left Sidebar: Player Info + Controls */}
        <aside className="w-64 flex flex-col gap-6">
          <PlayerCard player={gameState?.myPlayer || null} />
          <GameControls
            isPlaying={started}
            isHost={isHost}
            started={started}
            lastInputTime={lastInputTime}
          />
          <HostControls
            isHost={isHost}
            started={started}
            gameOver={gameOver}
            onStart={handleStart}
            onRestart={handleRestart}
          />
        </aside>

        {/* Center: Tetris Board */}
        <section className="flex flex-col items-center gap-4">
          <TetrisBoard
            board={gameState?.myPlayer?.boardWithPiece || gameState?.myPlayer?.board || null}
            isActive={started && !gameOver}
          />
        </section>

        {/* Right Sidebar: Opponents */}
        <OpponentsPanel opponents={gameState?.opponents || []} />

        {/* Game Status Overlay (lobby/game over) */}
        {(!started || gameOver) && (
          <GameStatus
            started={started}
            gameOver={gameOver}
            winner={winner}
            mySocketId={socketId}
            winnerName={winnerName}
            isHost={isHost}
          />
        )}
      </main>
    </div>
  );
}
