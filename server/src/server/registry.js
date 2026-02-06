const Game = require("../domain/Game");

class GameRegistry {
  constructor() {
    this.games = new Map(); // room -> Game
  }

  join(room, socketId, name) {
    let game = this.games.get(room);
    if (!game) {
      game = new Game(room);
      this.games.set(room, game);
    }
    game.addPlayer(socketId, name);
    return game;
  }

  get(room) {
    return this.games.get(room);
  }
  leave(socketId) {
    const updates = [];

    for (const [room, game] of this.games.entries()) {
      if (game.players.has(socketId)) {
        game.removePlayer(socketId);

        if (game.players.size === 0) {
          this.games.delete(room);
        } else {
          updates.push({ room, game });
        }
      }
    }

    return updates;
  }
  pruneDisconnected(room, io) {
  const game = this.games.get(room);
  if (!game) return;

  // remove players whose socket no longer exists
  for (const socketId of [...game.players.keys()]) {
    if (!io.sockets.sockets.get(socketId)) {
      game.removePlayer(socketId);
    }
  }

  // after pruning, guarantee a host
  game.ensureHost();
}

}

module.exports = { GameRegistry };
