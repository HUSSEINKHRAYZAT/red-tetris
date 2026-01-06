class Board {
  constructor(rows = 20, cols = 10) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  getState() {
    return this.grid;
  }

  isInside(x, y) {
    return y >= 0 && y < this.rows && x >= 0 && x < this.cols;
  }

  isEmpty(x, y) {
    return this.grid[y][x] === 0;
  }

  canPlace(cells) {
    for (const { x, y } of cells) {
      if (!this.isInside(x, y)) return false;
      if (!this.isEmpty(x, y)) return false;
    }
    return true;
  }

  lockCells(cells, value = 1) {
    for (const { x, y } of cells) {
      if (this.isInside(x, y)) {
        this.grid[y][x] = value;
      }
    }
  }

  clearFullLines() {
    const isFull = (row) => row.every((cell) => cell !== 0);

    const remaining = [];
    let cleared = 0;

    for (const row of this.grid) {
      if (isFull(row)) cleared++;
      else remaining.push(row);
    }

    while (remaining.length < this.rows) {
      remaining.unshift(Array(this.cols).fill(0));
    }

    this.grid = remaining;
    return cleared;
  }

  // ✅ NEW: add garbage rows at bottom, pushing board up
  // returns { overflow: true } if blocks were pushed out the top
  addGarbage(lines, holeCol = null) {
    if (lines <= 0) return { overflow: false };

    let overflow = false;

    for (let i = 0; i < lines; i++) {
      const removedTop = this.grid.shift();
      if (removedTop.some((c) => c !== 0)) overflow = true;

      const hole =
        holeCol !== null ? holeCol : Math.floor(Math.random() * this.cols);

      const garbageRow = Array(this.cols).fill(1);
      garbageRow[hole] = 0;

      this.grid.push(garbageRow);
    }

    return { overflow };
  }
}

module.exports = Board;
