class Piece {
  constructor(type, x, y) {
    this.type = type; // "I"
    this.x = x;
    this.y = y;

    // 0 = horizontal, 1 = vertical (for I only)
    this.rot = 0;
  }

  getCells() {
    if (this.type === "I") {
      if (this.rot === 0) {
        // ---- (horizontal)
        return [
          { x: this.x,     y: this.y },
          { x: this.x + 1, y: this.y },
          { x: this.x + 2, y: this.y },
          { x: this.x + 3, y: this.y },
        ];
      } else {
        // | (vertical)
        return [
          { x: this.x, y: this.y },
          { x: this.x, y: this.y + 1 },
          { x: this.x, y: this.y + 2 },
          { x: this.x, y: this.y + 3 },
        ];
      }
    }

    return [];
  }

  moveDown() { this.y += 1; }
  moveLeft() { this.x -= 1; }
  moveRight() { this.x += 1; }

  rotateCW() {
    if (this.type === "I") {
      this.rot = (this.rot + 1) % 2;
    }
  }

  rotateCCW() {
    if (this.type === "I") {
      this.rot = (this.rot + 1) % 2; // same for 2-state piece
    }
  }
}

module.exports = Piece;
