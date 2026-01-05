class Game {
  constructor(room) {
    this.room = room;
    this.players = new Map(); // socketId -> { id, name, isHost }
    this.started = false;
  }

  addPlayer(socketId, name) {
    if (this.started) throw new Error("Game already started");

    const isHost = this.players.size === 0;
    this.players.set(socketId, { id: socketId, name, isHost });
  }

  removePlayer(socketId) {
    const wasHost = this.players.get(socketId)?.isHost === true;
    this.players.delete(socketId);

    if (wasHost && this.players.size > 0) {
      const first = this.players.values().next().value;
      first.isHost = true;
    }
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
}

module.exports = Game;
