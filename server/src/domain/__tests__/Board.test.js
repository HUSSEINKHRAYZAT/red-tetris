const Board = require('../Board');

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  describe('Constructor', () => {
    test('should create a board with default dimensions (20x10)', () => {
      expect(board.rows).toBe(20);
      expect(board.cols).toBe(10);
      expect(board.grid).toHaveLength(20);
      expect(board.grid[0]).toHaveLength(10);
    });

    test('should create a board with custom dimensions', () => {
      const customBoard = new Board(15, 8);
      expect(customBoard.rows).toBe(15);
      expect(customBoard.cols).toBe(8);
      expect(customBoard.grid).toHaveLength(15);
      expect(customBoard.grid[0]).toHaveLength(8);
    });

    test('should initialize grid with all zeros', () => {
      for (let row of board.grid) {
        for (let cell of row) {
          expect(cell).toBe(0);
        }
      }
    });

    test('should set PENALTY_VALUE to 8', () => {
      expect(board.PENALTY_VALUE).toBe(8);
    });
  });

  describe('getState', () => {
    test('should return the grid', () => {
      const state = board.getState();
      expect(state).toBe(board.grid);
      expect(state).toHaveLength(20);
    });
  });

  describe('isInside', () => {
    test('should return true for valid coordinates', () => {
      expect(board.isInside(0, 0)).toBe(true);
      expect(board.isInside(9, 19)).toBe(true);
      expect(board.isInside(5, 10)).toBe(true);
    });

    test('should return false for negative coordinates', () => {
      expect(board.isInside(-1, 0)).toBe(false);
      expect(board.isInside(0, -1)).toBe(false);
      expect(board.isInside(-1, -1)).toBe(false);
    });

    test('should return false for out of bounds coordinates', () => {
      expect(board.isInside(10, 0)).toBe(false);
      expect(board.isInside(0, 20)).toBe(false);
      expect(board.isInside(10, 20)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    test('should return true for empty cells', () => {
      expect(board.isEmpty(0, 0)).toBe(true);
      expect(board.isEmpty(5, 10)).toBe(true);
    });

    test('should return false for occupied cells', () => {
      board.grid[5][3] = 1;
      expect(board.isEmpty(3, 5)).toBe(false);
    });

    test('should return false for penalty blocks', () => {
      board.grid[10][5] = board.PENALTY_VALUE;
      expect(board.isEmpty(5, 10)).toBe(false);
    });
  });

  describe('canPlace', () => {
    test('should return true for valid placement', () => {
      const cells = [
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
        { x: 6, y: 0 },
      ];
      expect(board.canPlace(cells)).toBe(true);
    });

    test('should return false if any cell is outside bounds', () => {
      const cells = [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
      ];
      expect(board.canPlace(cells)).toBe(false);
    });

    test('should return false if any cell is occupied', () => {
      board.grid[5][3] = 1;
      const cells = [
        { x: 3, y: 5 },
        { x: 4, y: 5 },
      ];
      expect(board.canPlace(cells)).toBe(false);
    });

    test('should return false for cells below board', () => {
      const cells = [
        { x: 5, y: 20 },
      ];
      expect(board.canPlace(cells)).toBe(false);
    });

    test('should return false for cells to the right of board', () => {
      const cells = [
        { x: 10, y: 5 },
      ];
      expect(board.canPlace(cells)).toBe(false);
    });
  });

  describe('lockCells', () => {
    test('should lock cells with default value 1', () => {
      const cells = [
        { x: 3, y: 5 },
        { x: 4, y: 5 },
      ];
      board.lockCells(cells);
      expect(board.grid[5][3]).toBe(1);
      expect(board.grid[5][4]).toBe(1);
    });

    test('should lock cells with custom value', () => {
      const cells = [
        { x: 3, y: 5 },
      ];
      board.lockCells(cells, 2);
      expect(board.grid[5][3]).toBe(2);
    });

    test('should ignore cells outside board', () => {
      const cells = [
        { x: -1, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 20 },
      ];
      // Should not throw error
      expect(() => board.lockCells(cells)).not.toThrow();
    });

    test('should handle multiple cells', () => {
      const cells = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];
      board.lockCells(cells, 5);
      expect(board.grid[0][0]).toBe(5);
      expect(board.grid[0][1]).toBe(5);
      expect(board.grid[0][2]).toBe(5);
      expect(board.grid[0][3]).toBe(5);
    });
  });

  describe('clearFullLines', () => {
    test('should return 0 when no lines are full', () => {
      const cleared = board.clearFullLines();
      expect(cleared).toBe(0);
    });

    test('should clear a single full line', () => {
      // Fill bottom row
      for (let x = 0; x < 10; x++) {
        board.grid[19][x] = 1;
      }
      const cleared = board.clearFullLines();
      expect(cleared).toBe(1);
      
      // Check bottom row is now empty
      for (let x = 0; x < 10; x++) {
        expect(board.grid[19][x]).toBe(0);
      }
    });

    test('should clear multiple full lines', () => {
      // Fill rows 18 and 19
      for (let x = 0; x < 10; x++) {
        board.grid[18][x] = 1;
        board.grid[19][x] = 1;
      }
      const cleared = board.clearFullLines();
      expect(cleared).toBe(2);
    });

    test('should add empty rows at top after clearing', () => {
      // Fill bottom row
      for (let x = 0; x < 10; x++) {
        board.grid[19][x] = 1;
      }
      board.clearFullLines();
      
      // Top row should be empty
      for (let x = 0; x < 10; x++) {
        expect(board.grid[0][x]).toBe(0);
      }
      
      // Board should still have 20 rows
      expect(board.grid.length).toBe(20);
    });

    test('should not clear lines with penalty blocks', () => {
      // Fill row with regular blocks
      for (let x = 0; x < 9; x++) {
        board.grid[19][x] = 1;
      }
      // Add one penalty block
      board.grid[19][9] = board.PENALTY_VALUE;
      
      const cleared = board.clearFullLines();
      expect(cleared).toBe(0);
      
      // Row should still be there
      expect(board.grid[19][9]).toBe(board.PENALTY_VALUE);
    });

    test('should not clear incomplete lines', () => {
      // Fill row partially
      for (let x = 0; x < 5; x++) {
        board.grid[19][x] = 1;
      }
      const cleared = board.clearFullLines();
      expect(cleared).toBe(0);
    });

    test('should preserve non-full rows above cleared rows', () => {
      // Add a block in row 15
      board.grid[15][5] = 1;
      
      // Fill row 19
      for (let x = 0; x < 10; x++) {
        board.grid[19][x] = 1;
      }
      
      board.clearFullLines();
      
      // Block should have moved down one row
      expect(board.grid[16][5]).toBe(1);
      expect(board.grid[15][5]).toBe(0);
    });
  });

  describe('addGarbage', () => {
    test('should return overflow false when adding garbage', () => {
      const result = board.addGarbage(2);
      expect(result.overflow).toBe(false);
    });

    test('should add penalty blocks at bottom', () => {
      board.addGarbage(1);
      
      // Bottom row should have penalty blocks with one hole
      let penaltyCount = 0;
      let emptyCount = 0;
      
      for (let x = 0; x < 10; x++) {
        if (board.grid[19][x] === board.PENALTY_VALUE) {
          penaltyCount++;
        } else if (board.grid[19][x] === 0) {
          emptyCount++;
        }
      }
      
      expect(penaltyCount).toBe(9);
      expect(emptyCount).toBe(1);
    });

    test('should add multiple garbage lines', () => {
      board.addGarbage(3);
      
      // Check last 3 rows have penalty blocks
      for (let y = 17; y < 20; y++) {
        let penaltyCount = 0;
        for (let x = 0; x < 10; x++) {
          if (board.grid[y][x] === board.PENALTY_VALUE) {
            penaltyCount++;
          }
        }
        expect(penaltyCount).toBe(9);
      }
    });

    test('should push existing blocks up', () => {
      // Place a block at bottom
      board.grid[19][5] = 1;
      
      board.addGarbage(1);
      
      // Block should have moved up
      expect(board.grid[18][5]).toBe(1);
      expect(board.grid[19][5]).toBe(board.PENALTY_VALUE);
    });

    test('should return overflow true if blocks pushed out of top', () => {
      // Fill top row
      board.grid[0][5] = 1;
      
      const result = board.addGarbage(1);
      
      expect(result.overflow).toBe(true);
    });

    test('should use specified hole column', () => {
      board.addGarbage(1, 3);
      
      expect(board.grid[19][3]).toBe(0);
      expect(board.grid[19][2]).toBe(board.PENALTY_VALUE);
      expect(board.grid[19][4]).toBe(board.PENALTY_VALUE);
    });

    test('should return overflow false when adding zero lines', () => {
      const result = board.addGarbage(0);
      expect(result.overflow).toBe(false);
    });

    test('should handle negative lines gracefully', () => {
      const result = board.addGarbage(-1);
      expect(result.overflow).toBe(false);
    });

    test('should maintain board height after adding garbage', () => {
      board.addGarbage(5);
      expect(board.grid.length).toBe(20);
    });
  });
});
