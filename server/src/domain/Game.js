const Board = require("./Board");
const Piece = require("./Piece");

class Game {
  constructor(room) {
    this.room = room;
    this.players = new Map(); // socketId -> player
    this.started = false;

    // Shared piece queue for the room (7-bag style) so all players see the same sequence
    this.pieceQueue = [];
  }

  /* ---------------- LOBBY ---------------- */

  addPlayer(socketId, name) {
    if (this.started) throw new Error("Game already started");

    this.players.set(socketId, {
      id: socketId,
      name,
      isHost: this.players.size === 0,
      // index into the shared pieceQueue for this player's personal sequence
      nextIndex: 0,
    });

    this.ensureHost();
  }

  removePlayer(socketId) {
    const wasHost = this.players.get(socketId)?.isHost === true;
    this.players.delete(socketId);

    if (wasHost) {
      for (const p of this.players.values()) p.isHost = false;
    }

    this.ensureHost();
  }

  restart(requesterSocketId) {
    const requester = this.players.get(requesterSocketId);
    if (!requester) throw new Error("Player not found");
    if (!requester.isHost) throw new Error("Only host can restart");

    this.started = false;

    for (const p of this.players.values()) {
      delete p.board;
      delete p.alive;
      delete p.activePiece;
      delete p.lines;
      delete p.lastClear;
      delete p.lockTimer;
      // Reset per-player sequence index
      p.nextIndex = 0;
    }

    this.ensureHost();
  }

  ensureHost() {
    if (this.players.size === 0) return;

    const hasHost = [...this.players.values()].some((p) => p.isHost);
    if (!hasHost) this.players.values().next().value.isHost = true;
  }

  /* ---------------- GAME ---------------- */

  // 7-bag generator helpers
  generateBag() {
    const types = ["I", "O", "T", "S", "Z", "J", "L"];
    // Fisher-Yates shuffle
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    return types;
  }

  refillQueue() {
    // Keep a modest lookahead; refill with a new bag when queue is running low
    // Accept optional dynamic minimum by checking callers using the current length.
    while (this.pieceQueue.length < 14) {
      this.pieceQueue.push(...this.generateBag());
      // limit ultimate queue growth
      if (this.pieceQueue.length > 200) this.pieceQueue.length = 200;
    }
  }

  drawNextType() {
    if (this.pieceQueue.length === 0) this.refillQueue();
    return this.pieceQueue.shift();
  }

  spawnPieceForPlayer(p) {
    // Ensure player has a nextIndex
    if (p.nextIndex === undefined) p.nextIndex = 0;

    // Ensure the shared queue is long enough for this player's index + lookahead
    while (p.nextIndex >= this.pieceQueue.length) {
      this.pieceQueue.push(...this.generateBag());
      if (this.pieceQueue.length > 200) this.pieceQueue.length = 200;
    }

    // Assign the type at the player's personal index (so every player reads from
    // the same shared sequence but advances independently). This guarantees the
    // same sequence of shapes for all players.
    const type = this.pieceQueue[p.nextIndex];
    p.nextIndex += 1;

    // Center spawn position - adjusted for different piece widths
    const startX = type === 'I' ? 3 : type === 'O' ? 4 : 3;
    p.activePiece = new Piece(type, startX, 0);
  }

  linesToGarbage(cleared) {
    // Spec: opponents receive (n - 1) indestructible penalty lines
    // 1 line → 0 penalties, 2 lines → 1 penalty, 3 lines → 2 penalties, 4 lines → 3 penalties
    return Math.max(0, cleared - 1);
  }

  // ✅ send garbage to all other alive players
  sendGarbage(fromPlayerId, garbageLines) {
    if (garbageLines <= 0) return;

    for (const p of this.players.values()) {
      if (!p.alive) continue;
      if (p.id === fromPlayerId) continue;
      if (!p.board) continue;

      const { overflow } = p.board.addGarbage(garbageLines);

      // if garbage caused overflow -> player dies
      if (overflow) {
        p.alive = false;
        p.activePiece = null;
        continue;
      }

      // if active piece now collides, try push it up a bit
      if (p.activePiece && !p.board.canPlace(p.activePiece.getCells())) {
        let fixed = false;
        for (let k = 0; k < 4; k++) {
          p.activePiece.y -= 1;
          if (p.board.canPlace(p.activePiece.getCells())) {
            fixed = true;
            break;
          }
        }
        if (!fixed) {
          p.alive = false;
          p.activePiece = null;
        }
      }
    }
  }

  checkGameOver() {
    const alivePlayers = [...this.players.values()].filter((pl) => pl.alive);

    // If there are multiple players in the room, the game ends when 0 or 1 remain alive
    if (this.players.size > 1) {
      if (alivePlayers.length <= 1) {
        this.started = false;
        return { gameOver: true, winner: alivePlayers[0]?.id ?? null };
      }
      return { gameOver: false };
    }

    // For single-player rooms, the game should continue while the single player is alive.
    // End only when that player dies (alivePlayers.length === 0).
    if (this.players.size === 1) {
      if (alivePlayers.length === 0) {
        this.started = false;
        return { gameOver: true, winner: null };
      }
      return { gameOver: false };
    }

    // No players — nothing to do
    return { gameOver: false };
  }

  start(requesterSocketId) {
    const requester = this.players.get(requesterSocketId);
    if (!requester) throw new Error("Player not found");
    if (!requester.isHost) throw new Error("Only host can start");
    if (this.started) throw new Error("Game already started");

    this.started = true;

    // initialize shared queue for deterministic same sequence
    this.pieceQueue = [];
    this.refillQueue();

    for (const p of this.players.values()) {
      p.board = new Board();
      p.alive = true;
      p.lines = 0;
      p.lastClear = 0;
      p.lockTimer = 0; // Lock delay: 0 = can move, 1 = will lock next tick

      // reset per-player sequence index so all players start at same sequence
      p.nextIndex = 0;

      this.spawnPieceForPlayer(p);

      if (!p.board.canPlace(p.activePiece.getCells())) {
        p.alive = false;
        p.activePiece = null;
      }
    }
  }

  tick() {
    if (!this.started) return { gameOver: false };

    for (const p of this.players.values()) {
      if (!p.alive || !p.activePiece || !p.board) continue;

      // Initialize lockTimer if it doesn't exist (for backward compatibility)
      if (p.lockTimer === undefined) p.lockTimer = 0;

      // Try move down
      p.activePiece.moveDown();

      // Check collision
      if (!p.board.canPlace(p.activePiece.getCells())) {
        p.activePiece.y -= 1; // Revert move

        // Lock delay: piece becomes immobile only on the next frame
        if (p.lockTimer === 0) {
          // First frame touching ground - start lock delay
          p.lockTimer = 1;
          p.lastClear = 0;
          continue; // Don't lock yet, wait for next tick
        } else {
          // Second frame - lock the piece
          p.lockTimer = 0; // Reset for next piece

          // Lock piece
          p.board.lockCells(p.activePiece.getCells(), 1);

          // Clear lines
          const cleared = p.board.clearFullLines();
          p.lastClear = cleared;
          p.lines = (p.lines ?? 0) + cleared;

          // ✅ Attacks
          const garbage = this.linesToGarbage(cleared);
          this.sendGarbage(p.id, garbage);

          // Spawn next
          this.spawnPieceForPlayer(p);

          if (!p.board.canPlace(p.activePiece.getCells())) {
            p.alive = false;
            p.activePiece = null;
          }
        }
      } else {
        // Piece moved successfully - reset lock timer
        p.lockTimer = 0;
        p.lastClear = 0;
      }
    }

    return this.checkGameOver();
  }

  hardDrop(p) {
    if (!p.alive || !p.activePiece || !p.board) return;

    while (true) {
      p.activePiece.moveDown();
      if (!p.board.canPlace(p.activePiece.getCells())) {
        p.activePiece.y -= 1;
        break;
      }
    }

    p.board.lockCells(p.activePiece.getCells(), 1);

    const cleared = p.board.clearFullLines();
    p.lastClear = cleared;
    p.lines = (p.lines ?? 0) + cleared;

    // ✅ attacks
    const garbage = this.linesToGarbage(cleared);
    this.sendGarbage(p.id, garbage);

    this.spawnPieceForPlayer(p);

    if (!p.board.canPlace(p.activePiece.getCells())) {
      p.alive = false;
      p.activePiece = null;
    }
  }

  applyInput(playerId, action) {
    if (!this.started) throw new Error("Game not started");

    const p = this.players.get(playerId);
    if (!p) throw new Error("Player not found");
    if (!p.alive) return { gameOver: false };
    if (!p.board || !p.activePiece) return { gameOver: false };

    const oldX = p.activePiece.x;
    const oldY = p.activePiece.y;
    const oldRot = p.activePiece.rot;

    switch (action) {
      case "LEFT":
        p.activePiece.moveLeft();
        break;
      case "RIGHT":
        p.activePiece.moveRight();
        break;
      case "DOWN":
        p.activePiece.moveDown();
        break;
      case "ROTATE":
        p.activePiece.rotateCW();
        break;
      case "DROP":
        this.hardDrop(p);
        return this.checkGameOver();
      default:
        throw new Error("Unknown input");
    }

    if (!p.board.canPlace(p.activePiece.getCells())) {
      // Collision - revert move
      p.activePiece.x = oldX;
      p.activePiece.y = oldY;
      p.activePiece.rot = oldRot;
    } else {
      // Successful move - reset lock timer (allows adjustments during lock delay)
      if (p.lockTimer !== undefined && p.lockTimer > 0) {
        p.lockTimer = 0;
      }
    }

    return { gameOver: false };
  }

  /* ---------------- STATE ---------------- */

  buildBoardWithPiece(board, cells) {
    const merged = board.map((row) => row.slice());
    for (const { x, y } of cells) {
      if (y >= 0 && y < merged.length && x >= 0 && x < merged[0].length) {
        merged[y][x] = 2; // falling piece
      }
    }
    return merged;
  }

  getLobbyState() {
    // Return players with id so clients can reliably identify the host
    const players = [...this.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
    }));

    const hostId = players.find((p) => p.isHost)?.id ?? null;

    return {
      room: this.room,
      started: this.started,
      hostId,
      players,
    };
  }

  getGameState() {
    return {
      room: this.room,
      started: this.started,
      // expose a short preview of upcoming types so clients can render the same preview
      nextPieces: this.pieceQueue.slice(0, 6),
      players: [...this.players.values()].map((p) => {
        const board = p.board ? p.board.getState() : null;
        const cells = p.activePiece ? p.activePiece.getCells() : null;

        return {
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          alive: p.alive ?? false,

          lines: p.lines ?? 0,
          lastClear: p.lastClear ?? 0,

          board,
          activePiece: cells,
          activePieceType: p.activePiece?.type ?? null,
          boardWithPiece:
            board && cells ? this.buildBoardWithPiece(board, cells) : board,
        };
      }),
    };
  }
}

module.exports = Game;
