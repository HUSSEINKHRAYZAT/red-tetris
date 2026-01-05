module.exports = function registerSocketHandlers(io, registry) {
  io.on("connection", (socket) => {
    socket.on("JOIN", ({ room, name }) => {
      const game = registry.join(room, socket.id, name);
      socket.join(room);
      io.to(room).emit("LOBBY", game.getLobbyState());
    });

socket.on("disconnect", () => {
  try {
    for (const game of registry.games.values()) {
      if (game.players.has(socket.id)) {
        const room = game.room;
        game.removePlayer(socket.id);
        io.to(room).emit("LOBBY", game.getLobbyState());
      }
    }
  } catch (e) {
    console.error("disconnect error:", e);
  }
});

  });
};
