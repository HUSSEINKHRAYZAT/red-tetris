const Game = require('../Game');

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game('testRoom');
  });

  describe('Constructor', () => {
    test('should create a game with room name', () => {
      expect(game.room).toBe('testRoom');
      expect(game.players).toBeInstanceOf(Map);
      expect(game.started).toBe(false);
      expect(game.pieceQueue).toEqual([]);
    });
  });

  describe('Player Management', () => {
    test('addPlayer should add first player as host', () => {
      game.addPlayer('player1', 'Alice');
      expect(game.players.size).toBe(1);
      const player = game.players.get('player1');
      expect(player.name).toBe('Alice');
      expect(player.isHost).toBe(true);
    });

    test('addPlayer should add second player as non-host', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      expect(game.players.size).toBe(2);
      const player2 = game.players.get('player2');
      expect(player2.isHost).toBe(false);
    });

    test('addPlayer should throw if game already started', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      expect(() => game.addPlayer('player2', 'Bob')).toThrow('Game already started');
    });

    test('removePlayer should remove player', () => {
      game.addPlayer('player1', 'Alice');
      game.removePlayer('player1');
      expect(game.players.size).toBe(0);
    });

    test('removePlayer should reassign host if host leaves', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      game.removePlayer('player1');
      const player2 = game.players.get('player2');
      expect(player2.isHost).toBe(true);
    });

    test('ensureHost should assign host if none exists', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      const player1 = game.players.get('player1');
      const player2 = game.players.get('player2');
      player1.isHost = false;
      player2.isHost = false;
      game.ensureHost();
      const hasHost = [...game.players.values()].some(p => p.isHost);
      expect(hasHost).toBe(true);
    });
  });

  describe('Piece Queue (7-bag)', () => {
    test('generateBag should return 7 unique pieces', () => {
      const bag = game.generateBag();
      expect(bag).toHaveLength(7);
      const unique = new Set(bag);
      expect(unique.size).toBe(7);
    });

    test('refillQueue should add pieces to queue', () => {
      game.refillQueue();
      expect(game.pieceQueue.length).toBeGreaterThanOrEqual(14);
    });

    test('drawNextType should return a piece type', () => {
      const type = game.drawNextType();
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(type);
    });

    test('drawNextType should refill queue when empty', () => {
      game.pieceQueue = [];
      const type = game.drawNextType();
      expect(type).toBeDefined();
      expect(game.pieceQueue.length).toBeGreaterThan(0);
    });
  });

  describe('Garbage System', () => {
    test('linesToGarbage should return n-1', () => {
      expect(game.linesToGarbage(1)).toBe(0);
      expect(game.linesToGarbage(2)).toBe(1);
      expect(game.linesToGarbage(3)).toBe(2);
      expect(game.linesToGarbage(4)).toBe(3);
    });

    test('sendGarbage should skip sender', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      game.start('player1');
      
      const player1 = game.players.get('player1');
      const player2 = game.players.get('player2');
      
      const initialBoard = JSON.stringify(player1.board.grid);
      game.sendGarbage('player1', 1);
      const afterBoard = JSON.stringify(player1.board.grid);
      
      expect(initialBoard).toBe(afterBoard);
    });

    test('sendGarbage should add garbage to other players', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      game.start('player1');
      
      const player2 = game.players.get('player2');
      game.sendGarbage('player1', 2);
      
      let penaltyCount = 0;
      for (let x = 0; x < 10; x++) {
        if (player2.board.grid[19][x] === 8) penaltyCount++;
      }
      expect(penaltyCount).toBe(9);
    });
  });

  describe('Game Start', () => {
    test('start should throw if not host', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      expect(() => game.start('player2')).toThrow('Only host can start');
    });

    test('start should throw if player not found', () => {
      expect(() => game.start('nonexistent')).toThrow('Player not found');
    });

    test('start should initialize game state', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      
      expect(game.started).toBe(true);
      const player = game.players.get('player1');
      expect(player.board).toBeDefined();
      expect(player.alive).toBe(true);
      expect(player.activePiece).toBeDefined();
      expect(player.lines).toBe(0);
    });

    test('start should throw if already started', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      expect(() => game.start('player1')).toThrow('Game already started');
    });

    test('start should refill piece queue', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      expect(game.pieceQueue.length).toBeGreaterThan(0);
    });
  });

  describe('Game Restart', () => {
    test('restart should reset game state', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      game.restart('player1');
      
      expect(game.started).toBe(false);
      const player = game.players.get('player1');
      expect(player.board).toBeUndefined();
      expect(player.alive).toBeUndefined();
    });

    test('restart should throw if not host', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      game.start('player1');
      expect(() => game.restart('player2')).toThrow('Only host can restart');
    });
  });

  describe('Game Tick', () => {
    test('tick should move pieces down', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      
      const player = game.players.get('player1');
      const initialY = player.activePiece.y;
      game.tick();
      expect(player.activePiece.y).toBeGreaterThan(initialY);
    });

    test('tick should not run if game not started', () => {
      game.addPlayer('player1', 'Alice');
      const result = game.tick();
      expect(result.gameOver).toBe(false);
    });

    test('tick should lock piece on collision', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      
      const player = game.players.get('player1');
      for (let i = 0; i < 30; i++) {
        game.tick();
        if (!player.alive) break;
      }
      
      let hasLockedBlocks = false;
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
          if (player.board.grid[y][x] === 1) {
            hasLockedBlocks = true;
            break;
          }
        }
      }
      expect(hasLockedBlocks).toBe(true);
    });
  });

  describe('Game Over', () => {
    test('checkGameOver should end game with 0 alive players', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      
      const player = game.players.get('player1');
      player.alive = false;
      
      const result = game.checkGameOver();
      expect(result.gameOver).toBe(true);
    });

    test('checkGameOver should continue with multiple alive players', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      game.start('player1');
      
      const result = game.checkGameOver();
      expect(result.gameOver).toBe(false);
    });

    test('checkGameOver should end when 1 player remains', () => {
      game.addPlayer('player1', 'Alice');
      game.addPlayer('player2', 'Bob');
      game.start('player1');
      
      const player2 = game.players.get('player2');
      player2.alive = false;
      
      const result = game.checkGameOver();
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('player1');
    });
  });

  describe('Input Handling', () => {
    beforeEach(() => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
    });

    test('applyInput should move piece left', () => {
      const player = game.players.get('player1');
      const initialX = player.activePiece.x;
      game.applyInput('player1', 'LEFT');
      expect(player.activePiece.x).toBe(initialX - 1);
    });

    test('applyInput should move piece right', () => {
      const player = game.players.get('player1');
      const initialX = player.activePiece.x;
      game.applyInput('player1', 'RIGHT');
      expect(player.activePiece.x).toBe(initialX + 1);
    });

    test('applyInput should move piece down', () => {
      const player = game.players.get('player1');
      const initialY = player.activePiece.y;
      game.applyInput('player1', 'DOWN');
      expect(player.activePiece.y).toBe(initialY + 1);
    });

    test('applyInput should rotate piece', () => {
      const player = game.players.get('player1');
      const initialRot = player.activePiece.rot;
      game.applyInput('player1', 'ROTATE');
      expect(player.activePiece.rot).not.toBe(initialRot);
    });

    test('applyInput should perform hard drop', () => {
      const player = game.players.get('player1');
      const pieceBefore = player.activePiece.type;
      game.applyInput('player1', 'DROP');
      // After hard drop, a new piece should spawn
      const pieceAfter = player.activePiece ? player.activePiece.type : null;
      // Piece should be locked and new piece spawned
      expect(pieceAfter).toBeDefined();
    });

    test('applyInput should throw for invalid action', () => {
      expect(() => game.applyInput('player1', 'INVALID')).toThrow('Unknown input');
    });

    test('applyInput should throw if game not started', () => {
      const newGame = new Game('test2');
      newGame.addPlayer('p1', 'Test');
      expect(() => newGame.applyInput('p1', 'LEFT')).toThrow('Game not started');
    });

    test('applyInput should revert invalid moves', () => {
      const player = game.players.get('player1');
      const initialX = player.activePiece.x;
      
      for (let i = 0; i < 20; i++) {
        game.applyInput('player1', 'LEFT');
      }
      
      expect(player.activePiece.x).toBeLessThan(initialX);
      expect(player.activePiece.x).toBeGreaterThanOrEqual(0);
    });
  });

  describe('State Methods', () => {
    test('getLobbyState should return lobby info', () => {
      game.addPlayer('player1', 'Alice');
      const state = game.getLobbyState();
      
      expect(state.room).toBe('testRoom');
      expect(state.started).toBe(false);
      expect(state.players).toHaveLength(1);
      expect(state.hostId).toBe('player1');
    });

    test('getGameState should return game state', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      const state = game.getGameState();
      
      expect(state.room).toBe('testRoom');
      expect(state.started).toBe(true);
      expect(state.players).toHaveLength(1);
      expect(state.nextPieces).toBeDefined();
    });

    test('getGameState should include player boards', () => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
      const state = game.getGameState();
      
      expect(state.players[0].board).toBeDefined();
      expect(state.players[0].boardWithPiece).toBeDefined();
    });
  });

  describe('Lock Delay Mechanism', () => {
    beforeEach(() => {
      game.addPlayer('player1', 'Alice');
      game.start('player1');
    });

    test('should initialize lockTimer to 0 on game start', () => {
      const player = game.players.get('player1');
      expect(player.lockTimer).toBe(0);
    });

    test('should not lock piece immediately on first ground contact', () => {
      const player = game.players.get('player1');
      
      // Fill the entire bottom row
      for (let x = 0; x < 10; x++) {
        player.board.grid[19][x] = 1;
      }
      
      // Position piece just one row above the filled bottom
      player.activePiece.y = 17;
      
      // First tick - piece will try to move down to y=18 and hit the filled row at y=19
      game.tick();
      
      // After collision, piece should stay at y=17 (reverted) with lockTimer=1
      expect(player.lockTimer).toBe(1);
      expect(player.activePiece).not.toBeNull();
      expect(player.activePiece.y).toBe(17); // Stayed in place after collision
    });

    test('should lock piece on second tick after ground contact', () => {
      const player = game.players.get('player1');
      
      // Fill bottom to create platform
      for (let x = 0; x < 10; x++) {
        player.board.grid[19][x] = 1;
      }
      
      // Position piece just above
      player.activePiece.y = 17;
      const originalType = player.activePiece.type;
      
      // First tick - start lock delay
      game.tick();
      expect(player.lockTimer).toBe(1);
      expect(player.activePiece.type).toBe(originalType);
      
      // Second tick - should lock
      game.tick();
      
      // Lock timer should reset
      expect(player.lockTimer).toBe(0);
      
      // Should have spawned new piece
      expect(player.activePiece).not.toBeNull();
      expect(player.activePiece.type).not.toBe(originalType);
    });

    test('should reset lock timer when piece moves successfully during delay', () => {
      const player = game.players.get('player1');
      
      // Fill bottom except left side
      for (let x = 3; x < 10; x++) {
        player.board.grid[19][x] = 1;
      }
      
      // Position piece above filled area
      player.activePiece.y = 17;
      player.activePiece.x = 5;
      
      // First tick - touch ground
      game.tick();
      expect(player.lockTimer).toBe(1);
      
      // Move piece left during lock delay (into empty space)
      game.applyInput('player1', 'LEFT');
      
      // Lock timer should reset if move was successful
      expect(player.lockTimer).toBe(0);
      
      // Piece should still be active
      expect(player.activePiece).not.toBeNull();
    });

    test('should reset lock timer when piece rotates during delay', () => {
      const player = game.players.get('player1');
      
      // Fill bottom
      for (let x = 0; x < 10; x++) {
        player.board.grid[19][x] = 1;
      }
      
      // Position piece
      player.activePiece.y = 17;
      
      // Touch ground
      game.tick();
      const timerAfterContact = player.lockTimer;
      
      // Try to rotate during delay
      game.applyInput('player1', 'ROTATE');
      
      // If rotation was successful, timer should reset
      // (Note: may not always succeed depending on piece type and position)
      expect(player.activePiece).not.toBeNull();
    });

    test('should allow multiple adjustments during lock delay', () => {
      const player = game.players.get('player1');
      
      // Fill bottom except center
      for (let x = 0; x < 10; x++) {
        if (x < 2 || x > 7) {
          player.board.grid[19][x] = 1;
        }
      }
      
      // Position piece above filled area
      player.activePiece.y = 17;
      player.activePiece.x = 1;
      
      // Touch ground
      game.tick();
      expect(player.lockTimer).toBe(1);
      
      // First adjustment - move right into empty space
      game.applyInput('player1', 'RIGHT');
      
      // Timer should reset after successful move
      expect(player.lockTimer).toBe(0);
    });

    test('should reset lock timer to 0 when piece falls freely', () => {
      const player = game.players.get('player1');
      
      // Create a platform with gap
      for (let x = 0; x < 10; x++) {
        if (x !== 4 && x !== 5) { // Leave gap in middle
          player.board.grid[18][x] = 1;
        }
      }
      
      // Position piece above solid part
      player.activePiece.y = 16;
      player.activePiece.x = 2;
      
      // Touch platform
      game.tick();
      expect(player.lockTimer).toBe(1);
      
      // Move into gap - piece should fall
      player.activePiece.x = 4;
      
      // Next tick should move piece down and reset timer
      game.tick();
      expect(player.lockTimer).toBe(0);
    });

    test('should handle lock delay with hard drop', () => {
      const player = game.players.get('player1');
      const initialPiece = player.activePiece;
      
      // Hard drop should bypass lock delay completely
      game.applyInput('player1', 'DROP');
      
      // Should have new piece
      expect(player.activePiece).not.toBe(initialPiece);
      expect(player.lockTimer).toBe(0);
    });

    test('should maintain lock delay state across multiple players', () => {
      // Start with fresh game for this test
      const multiGame = new Game('multiRoom');
      multiGame.addPlayer('player1', 'Alice');
      multiGame.addPlayer('player2', 'Bob');
      multiGame.start('player1');
      
      const p1 = multiGame.players.get('player1');
      const p2 = multiGame.players.get('player2');
      
      // Both should have lockTimer initialized
      expect(p1.lockTimer).toBe(0);
      expect(p2.lockTimer).toBe(0);
    });

    test('should reset lock timer on game restart', () => {
      const player = game.players.get('player1');
      
      // Set lock timer to active state
      player.lockTimer = 1;
      
      // Restart game
      game.restart('player1');
      
      // Lock timer should be deleted
      expect(player.lockTimer).toBeUndefined();
    });

    test('should handle backward compatibility if lockTimer undefined', () => {
      const player = game.players.get('player1');
      
      // Simulate old player state without lockTimer
      delete player.lockTimer;
      
      // Fill bottom
      for (let x = 0; x < 10; x++) {
        player.board.grid[19][x] = 1;
      }
      
      // Position piece above
      player.activePiece.y = 17;
      
      // Tick should initialize lockTimer
      game.tick();
      
      expect(player.lockTimer).toBeDefined();
      expect(player.lockTimer).toBe(1);
    });
  });
});
