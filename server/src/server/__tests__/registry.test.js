const { GameRegistry } = require('../registry');

describe('GameRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new GameRegistry();
  });

  describe('Constructor', () => {
    test('should initialize with empty games map', () => {
      expect(registry.games).toBeInstanceOf(Map);
      expect(registry.games.size).toBe(0);
    });
  });

  describe('join', () => {
    test('should create new game if room does not exist', () => {
      const game = registry.join('room1', 'player1', 'Alice');
      expect(registry.games.size).toBe(1);
      expect(game).toBeDefined();
      expect(game.room).toBe('room1');
    });

    test('should add player to existing game', () => {
      registry.join('room1', 'player1', 'Alice');
      const game = registry.join('room1', 'player2', 'Bob');
      expect(registry.games.size).toBe(1);
      expect(game.players.size).toBe(2);
    });

    test('should return the game instance', () => {
      const game = registry.join('room1', 'player1', 'Alice');
      expect(game.players.has('player1')).toBe(true);
    });

    test('should handle multiple rooms', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room2', 'player2', 'Bob');
      expect(registry.games.size).toBe(2);
    });
  });

  describe('get', () => {
    test('should return game for existing room', () => {
      registry.join('room1', 'player1', 'Alice');
      const game = registry.get('room1');
      expect(game).toBeDefined();
      expect(game.room).toBe('room1');
    });

    test('should return undefined for non-existent room', () => {
      const game = registry.get('nonexistent');
      expect(game).toBeUndefined();
    });
  });

  describe('leave', () => {
    test('should remove player from game', () => {
      registry.join('room1', 'player1', 'Alice');
      const updates = registry.leave('player1');
      expect(updates).toHaveLength(0);
      expect(registry.games.size).toBe(0);
    });

    test('should delete empty rooms', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.leave('player1');
      expect(registry.games.has('room1')).toBe(false);
    });

    test('should keep room if other players remain', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room1', 'player2', 'Bob');
      const updates = registry.leave('player1');
      
      expect(registry.games.has('room1')).toBe(true);
      expect(updates).toHaveLength(1);
      expect(updates[0].room).toBe('room1');
    });

    test('should return updates for affected rooms', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room1', 'player2', 'Bob');
      const updates = registry.leave('player1');
      
      expect(updates).toHaveLength(1);
      expect(updates[0].game).toBeDefined();
    });

    test('should handle player not in any room', () => {
      const updates = registry.leave('nonexistent');
      expect(updates).toHaveLength(0);
    });

    test('should handle multiple rooms', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room2', 'player1', 'Alice');
      const updates = registry.leave('player1');
      expect(registry.games.size).toBe(0);
    });
  });

  describe('pruneDisconnected', () => {
    test('should remove disconnected players', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room1', 'player2', 'Bob');
      
      const mockIo = {
        sockets: {
          sockets: new Map([
            ['player1', {}]
          ])
        }
      };
      
      registry.pruneDisconnected('room1', mockIo);
      const game = registry.get('room1');
      expect(game.players.size).toBe(1);
      expect(game.players.has('player1')).toBe(true);
      expect(game.players.has('player2')).toBe(false);
    });

    test('should do nothing if room does not exist', () => {
      const mockIo = { sockets: { sockets: new Map() } };
      expect(() => registry.pruneDisconnected('nonexistent', mockIo)).not.toThrow();
    });

    test('should ensure host after pruning', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room1', 'player2', 'Bob');
      
      const mockIo = {
        sockets: {
          sockets: new Map([
            ['player2', {}]
          ])
        }
      };
      
      registry.pruneDisconnected('room1', mockIo);
      const game = registry.get('room1');
      const player2 = game.players.get('player2');
      expect(player2.isHost).toBe(true);
    });

    test('should keep all connected players', () => {
      registry.join('room1', 'player1', 'Alice');
      registry.join('room1', 'player2', 'Bob');
      
      const mockIo = {
        sockets: {
          sockets: new Map([
            ['player1', {}],
            ['player2', {}]
          ])
        }
      };
      
      registry.pruneDisconnected('room1', mockIo);
      const game = registry.get('room1');
      expect(game.players.size).toBe(2);
    });
  });
});
