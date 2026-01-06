const Board = require("./Board");
const Piece = require("./Piece");

class Game {
  constructor(room) {
    this.room = room;
    this.players = new Map(); // socketId -> player
    this.started = false;
  }

  /* ---------------- LOBBY ---------------- */

  addPlayer(socketId, name) {
    if (this.started) throw new Error("Game already started");

    this.players.set(socketId, {
      id: socketId,
      name,
      isHost: this.players.size === 0,
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
    }

    this.ensureHost();
  }

  ensureHost() {
    if (this.players.size === 0) return;

    const hasHost = [...this.players.values()].some((p) => p.isHost);
    if (!hasHost) this.players.values().next().value.isHost = true;
  }

  /* ---------------- GAME ---------------- */

  spawnPieceForPlayer(p) {
    // For now: always spawn I piece at top center
    p.activePiece = new Piece("I", 3, 0);
  }

  linesToGarbage(cleared) {
    if (cleared === 2) return 1;
    if (cleared === 3) return 2;
    if (cleared === 4) return 4;
    return 0;
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
    if (alivePlayers.length <= 1) {
      this.started = false;
      return { gameOver: true, winner: alivePlayers[0]?.id ?? null };
    }
    return { gameOver: false };
  }

  start(requesterSocketId) {
    const requester = this.players.get(requesterSocketId);
    if (!requester) throw new Error("Player not found");
    if (!requester.isHost) throw new Error("Only host can start");
    if (this.started) throw new Error("Game already started");

    this.started = true;

    for (const p of this.players.values()) {
      p.board = new Board();
      p.alive = true;
      p.lines = 0;
      p.lastClear = 0;

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

      // try move down
      p.activePiece.moveDown();

      // collision -> revert, lock, clear, attack, spawn
      if (!p.board.canPlace(p.activePiece.getCells())) {
        p.activePiece.y -= 1;

        // lock piece
        p.board.lockCells(p.activePiece.getCells(), 1);

        // clear lines
        const cleared = p.board.clearFullLines();
        p.lastClear = cleared;
        p.lines = (p.lines ?? 0) + cleared;

        // ✅ attacks
        const garbage = this.linesToGarbage(cleared);
        this.sendGarbage(p.id, garbage);

        // spawn next
        this.spawnPieceForPlayer(p);

        if (!p.board.canPlace(p.activePiece.getCells())) {
          p.alive = false;
          p.activePiece = null;
        }
      } else {
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
      p.activePiece.x = oldX;
      p.activePiece.y = oldY;
      p.activePiece.rot = oldRot;
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
    return {
      room: this.room,
      started: this.started,
      players: [...this.players.values()].map((p) => ({
        name: p.name,
        isHost: p.isHost,
      })),
    };
  }

  getGameState() {
    return {
      room: this.room,
      started: this.started,
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
          boardWithPiece:
            board && cells ? this.buildBoardWithPiece(board, cells) : board,
        };
      }),
    };
  }
}

module.exports = Game;
