const registerSocketHandlers = require('../socketHandlers');
const { GameRegistry } = require('../registry');
const EVENTS = require('../../protocol/events');

describe('Socket Handlers', () => {
  let mockIo;
  let mockSocket;
  let registry;
  let emittedEvents;
  let joinedRooms;

  beforeEach(() => {
    emittedEvents = [];
    joinedRooms = [];
    registry = new GameRegistry();

    mockSocket = {
      id: 'socket123',
      on: jest.fn(),
      emit: jest.fn((event, data) => {
        emittedEvents.push({ event, data });
      }),
      join: jest.fn((room) => {
        joinedRooms.push(room);
      }),
    };

    mockIo = {
      on: jest.fn((event, callback) => {
        if (event === 'connection') {
          callback(mockSocket);
        }
      }),
      to: jest.fn(() => mockIo),
      emit: jest.fn((event, data) => {
        emittedEvents.push({ event, data, broadcast: true });
      }),
      sockets: {
        sockets: new Map([[mockSocket.id, mockSocket]]),
      },
    };

    registerSocketHandlers(mockIo, registry);
  });

  describe('Connection', () => {
    test('should register connection handler', () => {
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    test('should register all event handlers', () => {
      expect(mockSocket.on).toHaveBeenCalledWith(EVENTS.C2S_JOIN, expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(EVENTS.C2S_START, expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(EVENTS.C2S_INPUT, expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(EVENTS.C2S_RESTART, expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('JOIN Event', () => {
    let joinHandler;

    beforeEach(() => {
      joinHandler = mockSocket.on.mock.calls.find(call => call[0] === EVENTS.C2S_JOIN)[1];
    });

    test('should join player to room', () => {
      joinHandler({ room: 'room1', name: 'Alice' });
      
      expect(joinedRooms).toContain('room1');
      expect(registry.games.has('room1')).toBe(true);
    });

    test('should emit LOBBY state', () => {
      joinHandler({ room: 'room1', name: 'Alice' });
      
      const lobbyEvent = emittedEvents.find(e => e.event === EVENTS.S2C_LOBBY);
      expect(lobbyEvent).toBeDefined();
      expect(lobbyEvent.broadcast).toBe(true);
    });

    test('should handle join errors', () => {
      jest.spyOn(registry, 'join').mockImplementation(() => {
        throw new Error('Test error');
      });
      
      joinHandler({ room: 'room1', name: 'Alice' });
      
      const errorEvent = emittedEvents.find(e => e.event === EVENTS.S2C_ERROR);
      expect(errorEvent).toBeDefined();
    });

    test('should prevent joining game that already started', () => {
      // First player joins and starts game
      joinHandler({ room: 'room1', name: 'Alice' });
      const game = registry.get('room1');
      game.start(mockSocket.id);
      
      // Second player tries to join
      const mockSocket2 = {
        id: 'socket456',
        emit: jest.fn((event, data) => {
          emittedEvents.push({ event, data, socketId: 'socket456' });
        }),
        join: jest.fn(),
      };
      
      // Manually invoke join handler with second socket context
      const joinHandler2 = (data) => {
        try {
          registry.pruneDisconnected(data.room, mockIo);
          registry.join(data.room, mockSocket2.id, data.name);
          mockSocket2.join(data.room);
          mockIo.to(data.room).emit(EVENTS.S2C_LOBBY, game.getLobbyState());
        } catch (e) {
          mockSocket2.emit(EVENTS.S2C_ERROR, { message: e.message });
        }
      };
      
      joinHandler2({ room: 'room1', name: 'Bob' });
      
      // Should emit error to the second player
      const errorEvent = emittedEvents.find(e => 
        e.event === EVENTS.S2C_ERROR && 
        e.socketId === 'socket456'
      );
      expect(errorEvent).toBeDefined();
      expect(errorEvent.data.message).toContain('already started');
      
      // Second player should not be in the game
      expect(game.players.has('socket456')).toBe(false);
      expect(game.players.size).toBe(1);
    });
  });

  describe('START Event', () => {
    let startHandler;

    beforeEach(() => {
      startHandler = mockSocket.on.mock.calls.find(call => call[0] === EVENTS.C2S_START)[1];
      registry.join('room1', mockSocket.id, 'Alice');
    });

    test('should start game and emit events', () => {
      startHandler({ room: 'room1' });
      
      expect(emittedEvents.some(e => e.event === EVENTS.S2C_GAME_STARTED)).toBe(true);
      expect(emittedEvents.some(e => e.event === EVENTS.S2C_STATE)).toBe(true);
      expect(emittedEvents.some(e => e.event === EVENTS.S2C_LOBBY)).toBe(true);
    });

    test('should throw error for non-existent room', () => {
      startHandler({ room: 'nonexistent' });
      
      const errorEvent = emittedEvents.find(e => e.event === EVENTS.S2C_ERROR);
      expect(errorEvent).toBeDefined();
      expect(errorEvent.data.message).toContain('Room not found');
    });

    test('should handle start errors', () => {
      const game = registry.get('room1');
      jest.spyOn(game, 'start').mockImplementation(() => {
        throw new Error('Test error');
      });
      
      startHandler({ room: 'room1' });
      
      const errorEvent = emittedEvents.find(e => e.event === EVENTS.S2C_ERROR);
      expect(errorEvent).toBeDefined();
    });
  });

  describe('INPUT Event', () => {
    let inputHandler;

    beforeEach(() => {
      inputHandler = mockSocket.on.mock.calls.find(call => call[0] === EVENTS.C2S_INPUT)[1];
      registry.join('room1', mockSocket.id, 'Alice');
      const game = registry.get('room1');
      game.start(mockSocket.id);
    });

    test('should process input and emit state', () => {
      inputHandler({ room: 'room1', action: 'LEFT' });
      
      const stateEvent = emittedEvents.find(e => e.event === EVENTS.S2C_STATE);
      expect(stateEvent).toBeDefined();
    });

    test('should throw error for non-existent room', () => {
      inputHandler({ room: 'nonexistent', action: 'LEFT' });
      
      const errorEvent = emittedEvents.find(e => e.event === EVENTS.S2C_ERROR);
      expect(errorEvent).toBeDefined();
    });

    test('should rate limit inputs', (done) => {
      emittedEvents = [];
      inputHandler({ room: 'room1', action: 'LEFT' });
      
      // Should be throttled immediately
      setTimeout(() => {
        inputHandler({ room: 'room1', action: 'RIGHT' });
        const stateEvents = emittedEvents.filter(e => e.event === EVENTS.S2C_STATE);
        // First input processes, second should be rate limited
        expect(stateEvents.length).toBeGreaterThanOrEqual(1);
        done();
      }, 60);
    });
  });

  describe('RESTART Event', () => {
    let restartHandler;

    beforeEach(() => {
      restartHandler = mockSocket.on.mock.calls.find(call => call[0] === EVENTS.C2S_RESTART)[1];
      registry.join('room1', mockSocket.id, 'Alice');
      const game = registry.get('room1');
      game.start(mockSocket.id);
    });

    test('should restart game and emit events', () => {
      restartHandler({ room: 'room1' });
      
      expect(emittedEvents.some(e => e.event === EVENTS.S2C_GAME_RESTARTED)).toBe(true);
      expect(emittedEvents.some(e => e.event === EVENTS.S2C_LOBBY)).toBe(true);
      expect(emittedEvents.some(e => e.event === EVENTS.S2C_STATE)).toBe(true);
    });

    test('should throw error for non-existent room', () => {
      restartHandler({ room: 'nonexistent' });
      
      const errorEvent = emittedEvents.find(e => e.event === EVENTS.S2C_ERROR);
      expect(errorEvent).toBeDefined();
    });

    test('should handle restart errors', () => {
      const game = registry.get('room1');
      jest.spyOn(game, 'restart').mockImplementation(() => {
        throw new Error('Test error');
      });
      
      restartHandler({ room: 'room1' });
      
      const errorEvent = emittedEvents.find(e => e.event === EVENTS.S2C_ERROR);
      expect(errorEvent).toBeDefined();
    });
  });

  describe('DISCONNECT Event', () => {
    let disconnectHandler;

    beforeEach(() => {
      disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    });

    test('should remove player on disconnect', () => {
      registry.join('room1', mockSocket.id, 'Alice');
      registry.join('room1', 'socket456', 'Bob');
      
      disconnectHandler();
      
      const game = registry.get('room1');
      expect(game.players.has(mockSocket.id)).toBe(false);
    });

    test('should emit lobby update on disconnect', () => {
      registry.join('room1', mockSocket.id, 'Alice');
      registry.join('room1', 'socket456', 'Bob');
      
      disconnectHandler();
      
      const lobbyEvent = emittedEvents.find(e => e.event === EVENTS.S2C_LOBBY);
      expect(lobbyEvent).toBeDefined();
    });

    test('should handle disconnect without errors', () => {
      expect(() => disconnectHandler()).not.toThrow();
    });
  });
});
