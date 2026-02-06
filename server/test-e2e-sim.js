// Simple E2E simulation: spawn multiple socket.io clients to exercise server game flow
// Usage: node test-e2e-sim.js
// Optional env: SERVER_URL (e.g. http://localhost:3000)

const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const ROOM = 'e2e-room-' + Date.now(); // unique room per run
const NUM_PLAYERS = 3;
// Include DROP to speed up game progression so we actually reach game-over
const ACTIONS = ['LEFT', 'RIGHT', 'ROTATE', 'DOWN', 'DROP', 'DROP'];

console.log('E2E simulation connecting to', SERVER_URL);

function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }

(async function main() {
  const clients = [];

  for (let i = 0; i < NUM_PLAYERS; i++) {
    const name = `E2E_${i + 1}`;
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'], reconnection: true });
    clients.push({ socket, name, joined: false, started: false });

    socket.on('connect', () => {
      console.log(`[${name}] connected id=${socket.id}`);
      socket.emit('JOIN', { room: ROOM, name });
    });

    socket.on('LOBBY', (data) => {
      console.log(`[${name}] LOBBY: players=${data.players.length} started=${data.started} host=${data.hostId}`);
      // If I'm the host and all players joined, start the game
      const me = data.players.find((p) => p.id === socket.id);
      if (me && me.isHost && data.players.length === NUM_PLAYERS && !data.started) {
        console.log(`[${name}] starting game as host`);
        socket.emit('START', { room: ROOM });
      }
    });

    socket.on('GAME_STARTED', (p) => {
      console.log(`[${name}] GAME_STARTED`);
      clients.forEach((c) => { c.started = true; });
      // Begin sending inputs for all clients
      clients.forEach((c) => {
        if (!c.inputInterval) {
          c.inputInterval = setInterval(() => {
            if (!c.socket.connected) return;
            const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            c.socket.emit('INPUT', { room: ROOM, action });
          }, 200);
        }
      });
    });

    socket.on('STATE', (state) => {
      // Print a concise snapshot
      const me = state.players.find((p) => p.id === socket.id);
      const alive = me?.alive ? 'alive' : 'dead';
      const line = `[${name}] STATE tick players=${state.players.length} me=${alive} lines=${me?.lines ?? 0} lastClear=${me?.lastClear ?? 0}`;
      console.log(line);
    });

    socket.on('GAME_OVER', (data) => {
      console.log(`[${name}] GAME_OVER winner=${data.winner}`);
      // cleanup
      clients.forEach((c) => {
        if (c.inputInterval) clearInterval(c.inputInterval);
        try { c.socket.disconnect(); } catch (e) {}
      });
      process.exit(0);
    });

    socket.on('ERROR', (e) => {
      console.error(`[${name}] ERROR:`, e);
    });

    // small delay between connection attempts
    await wait(250);
  }

  // Safety timeout
  setTimeout(() => {
    console.error('E2E timeout reached, exiting');
    clients.forEach((c) => {
      if (c.inputInterval) clearInterval(c.inputInterval);
      try { c.socket.disconnect(); } catch (e) {}
    });
    process.exit(1);
  }, 120000);
})();
