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

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

// Components
import NavBar from '@/components/game/NavBar';
import PlayerCard from '@/components/game/PlayerCard';
import GameControls from '@/components/game/GameControls';
import TetrisBoard from '@/components/game/TetrisBoard';
import OpponentsPanel from '@/components/game/OpponentsPanel';
import HostControls from '@/components/game/HostControls';
import LobbyDialog from '@/components/game/LobbyDialog';

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

  // Lobby state (from LOBBY event - before game starts)
  const [isHost, setIsHost] = useState(false);
  const [started, setStarted] = useState(false);
  const [lobbyPlayers, setLobbyPlayers] = useState<Array<{
    id: string;
    name: string;
    isHost: boolean;
    lastRoundResult?: boolean | null;
  }>>([]);

  // Game state (from STATE event - during game)
  const [gameState, setGameState] = useState<SanitizedGameState | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // Input throttling
  const [lastInputTime, setLastInputTime] = useState(0);

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

    // If there is a previously stored socket id (from reconnects / page reload), use it as an initial value
    const existingSocketId = socketStorage.getSocketId();
    if (existingSocketId) {
      setSocketId(existingSocketId);
    }

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
      if (newSocket.id) {
        setSocketId(newSocket.id);
        // Persist socket id so LOBBY events arriving before React state can still detect host
        socketStorage.setSocketId(newSocket.id);
      } else {
        setSocketId(null);
      }

      // Auto-join room on connect
      console.log('[Socket] Emitting JOIN:', { room: storedRoom, name: storedName });
      newSocket.emit(C2S_EVENTS.JOIN, { room: storedRoom, name: storedName });
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
      setSocketId(null);
      // Clear persisted socket id on disconnect
      socketStorage.clearSocketId();
    });

    // Cleanup on unmount
    return () => {
      console.log('[Socket] Cleanup - disconnecting');
      socketStorage.clearSocketId();
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

      // ✅ CRITICAL: Determine host status from LOBBY
      // Use persisted socket id as a fallback — sometimes the LOBBY event can arrive before the in-memory socketId is set
      const persistedId = socketStorage.getSocketId();
      const amIHost = data.hostId === socketId || data.hostId === persistedId;
      console.log('[LOBBY] Am I host?', amIHost, '(my ID:', socketId, ', persistedId:', persistedId, ', hostId:', data.hostId, ')');

      setIsHost(amIHost);
      setStarted(data.started);

      // Update lobby players list (preserve lastRoundResult if already set)
      setLobbyPlayers(prevPlayers => 
        data.players.map((p: { id: string; name: string; isHost: boolean }) => {
          const existing = prevPlayers.find(prev => prev.id === p.id);
          return {
            id: p.id,
            name: p.name,
            isHost: p.isHost,
            lastRoundResult: existing?.lastRoundResult ?? null,
          };
        })
      );
    };

    // GAME_STARTED event
    const handleGameStarted = () => {
      console.log('[GAME_STARTED]');
      setGameOver(false);
      // Clear previous round results when new game starts
      setLobbyPlayers(prev => prev.map(p => ({ ...p, lastRoundResult: null })));
      setStarted(true);
    };

    // STATE event (main game state updates)
    const handleState = (rawState: StatePayload) => {
      // CRITICAL: Sanitize state to enforce privacy (spectrum only for opponents)
      const cleanState = sanitizeGameState(rawState, socketId);
      setGameState(cleanState);

      // Update started/host from STATE during game
      setStarted(rawState.started);
      if (rawState.started && cleanState.myPlayer) {
        setIsHost(cleanState.myPlayer.isHost);
      }
    };

    // GAME_OVER event
    const handleGameOver = (data: GameOverPayload) => {
      console.log('[GAME_OVER]', data);
      setGameOver(true);

      // Mark winners and losers in lobby players
      setLobbyPlayers(prev =>
        prev.map(p => ({
          ...p,
          lastRoundResult: data.winner ? (p.id === data.winner ? true : false) : null,
        }))
      );
    };

    // GAME_RESTARTED event
    const handleGameRestarted = () => {
      console.log('[GAME_RESTARTED]');
      setGameOver(false);
      setStarted(false);
      // Keep lastRoundResult so it shows in lobby
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
    if (!socket || !room || !started || gameOver) return;

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
  }, [socket, room, started, gameOver, lastInputTime]);

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

        {/* Lobby Dialog (shown in lobby or post-game) */}
        {(!started || gameOver) && (
          <LobbyDialog
            players={lobbyPlayers}
            mySocketId={socketId}
            isHost={isHost}
            isPostGame={gameOver}
            onStart={gameOver ? handleRestart : handleStart}
          />
        )}
      </main>
    </div>
  );
}
