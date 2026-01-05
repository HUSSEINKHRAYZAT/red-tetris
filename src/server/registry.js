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
}

module.exports = { GameRegistry };
