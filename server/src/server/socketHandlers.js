const EVENTS = require("../protocol/events");

const GAME_TICK_MS = 500;
const loops = new Map(); // room -> intervalId

// input rate-limit (server protection)
const lastInputAt = new Map(); // socketId -> timestamp
const INPUT_COOLDOWN_MS = 50;

module.exports = function registerSocketHandlers(io, registry) {
  io.on("connection", (socket) => {
    socket.on(EVENTS.C2S_JOIN, ({ room, name }) => {
      try {
        registry.pruneDisconnected(room, io);

        const game = registry.join(room, socket.id, name);
        socket.join(room);

        io.to(room).emit(EVENTS.S2C_LOBBY, game.getLobbyState());
      } catch (e) {
        console.error("JOIN error:", e.message);
        socket.emit(EVENTS.S2C_ERROR, { message: e.message });
      }
    });

    socket.on("disconnect", () => {
      try {
        if (typeof registry.leave === "function") {
          const updates = registry.leave(socket.id);
          for (const { room, game } of updates) {
            io.to(room).emit(EVENTS.S2C_LOBBY, game.getLobbyState());
          }
          return;
        }

        for (const game of registry.games.values()) {
          if (game.players.has(socket.id)) {
            const room = game.room;
            game.removePlayer(socket.id);
            io.to(room).emit(EVENTS.S2C_LOBBY, game.getLobbyState());
          }
        }
      } catch (e) {
        console.error("disconnect error:", e);
      } finally {
        lastInputAt.delete(socket.id);
      }
    });

    socket.on(EVENTS.C2S_START, ({ room }) => {
      try {
        registry.pruneDisconnected(room, io);

        const game = registry.get(room);
        if (!game) throw new Error("Room not found");

        game.start(socket.id);

        io.to(room).emit(EVENTS.S2C_GAME_STARTED, { room });
        io.to(room).emit(EVENTS.S2C_STATE, game.getGameState());
        io.to(room).emit(EVENTS.S2C_LOBBY, game.getLobbyState());

        // start loop once per room
        if (!loops.has(room)) {
          const intervalId = setInterval(() => {
            const g = registry.get(room);

            // room deleted -> stop loop
            if (!g) {
              clearInterval(intervalId);
              loops.delete(room);
              return;
            }

            if (!g.started) return;

            const result = g.tick();
            io.to(room).emit(EVENTS.S2C_STATE, g.getGameState());

            if (result?.gameOver) {
              io.to(room).emit(EVENTS.S2C_GAME_OVER, {
                room,
                winner: result.winner, // socketId or null
              });
            }
          }, GAME_TICK_MS);

          loops.set(room, intervalId);
        }
      } catch (e) {
        console.error("START error:", e.message);
        socket.emit(EVENTS.S2C_ERROR, { message: e.message });
      }
    });

    socket.on(EVENTS.C2S_INPUT, ({ room, action }) => {
      try {
        const game = registry.get(room);
        if (!game) throw new Error("Room not found");

        registry.pruneDisconnected(room, io);

        // rate limit
        const now = Date.now();
        const last = lastInputAt.get(socket.id) ?? 0;
        if (now - last < INPUT_COOLDOWN_MS) return;
        lastInputAt.set(socket.id, now);

        const result = game.applyInput(socket.id, action);
        io.to(room).emit(EVENTS.S2C_STATE, game.getGameState());
        if (result?.gameOver)
          io.to(room).emit(EVENTS.S2C_GAME_OVER, {
            room,
            winner: result.winner,
          });
      } catch (e) {
        console.error("INPUT error:", e.message);
        socket.emit(EVENTS.S2C_ERROR, { message: e.message });
      }
    });

    socket.on(EVENTS.C2S_RESTART, ({ room }) => {
      try {
        registry.pruneDisconnected(room, io);

        const game = registry.get(room);
        if (!game) throw new Error("Room not found");

        // stop loop
        if (loops.has(room)) {
          clearInterval(loops.get(room));
          loops.delete(room);
        }

        game.restart(socket.id);

        io.to(room).emit(EVENTS.S2C_GAME_RESTARTED, { room });
        io.to(room).emit(EVENTS.S2C_LOBBY, game.getLobbyState());
        io.to(room).emit(EVENTS.S2C_STATE, game.getGameState()); // ✅ fresh state after restart
      } catch (e) {
        console.error("RESTART error:", e.message);
        socket.emit(EVENTS.S2C_ERROR, { message: e.message });
      }
    });
  });
};
