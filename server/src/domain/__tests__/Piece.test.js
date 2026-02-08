const Piece = require('../Piece');

describe('Piece', () => {
  describe('Constructor', () => {
    test('should create a piece with type, position and rotation', () => {
      const piece = new Piece('I', 3, 0);
      expect(piece.type).toBe('I');
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
      expect(piece.rot).toBe(0);
    });
  });

  describe('SHAPES', () => {
    test('should have all 7 tetromino types', () => {
      expect(Piece.SHAPES.I).toBeDefined();
      expect(Piece.SHAPES.O).toBeDefined();
      expect(Piece.SHAPES.T).toBeDefined();
      expect(Piece.SHAPES.S).toBeDefined();
      expect(Piece.SHAPES.Z).toBeDefined();
      expect(Piece.SHAPES.J).toBeDefined();
      expect(Piece.SHAPES.L).toBeDefined();
    });

    test('I piece should have 2 rotation states', () => {
      expect(Piece.SHAPES.I).toHaveLength(2);
    });

    test('O piece should have 1 rotation state', () => {
      expect(Piece.SHAPES.O).toHaveLength(1);
    });

    test('T piece should have 4 rotation states', () => {
      expect(Piece.SHAPES.T).toHaveLength(4);
    });

    test('S piece should have 2 rotation states', () => {
      expect(Piece.SHAPES.S).toHaveLength(2);
    });

    test('Z piece should have 2 rotation states', () => {
      expect(Piece.SHAPES.Z).toHaveLength(2);
    });

    test('J piece should have 4 rotation states', () => {
      expect(Piece.SHAPES.J).toHaveLength(4);
    });

    test('L piece should have 4 rotation states', () => {
      expect(Piece.SHAPES.L).toHaveLength(4);
    });
  });

  describe('getCells', () => {
    test('should return cells for I piece at position (3, 0)', () => {
      const piece = new Piece('I', 3, 0);
      const cells = piece.getCells();
      expect(cells).toHaveLength(4);
      expect(cells[0]).toEqual({ x: 3, y: 1 });
      expect(cells[1]).toEqual({ x: 4, y: 1 });
      expect(cells[2]).toEqual({ x: 5, y: 1 });
      expect(cells[3]).toEqual({ x: 6, y: 1 });
    });

    test('should return cells for O piece at position (4, 0)', () => {
      const piece = new Piece('O', 4, 0);
      const cells = piece.getCells();
      expect(cells).toHaveLength(4);
      expect(cells[0]).toEqual({ x: 4, y: 0 });
      expect(cells[1]).toEqual({ x: 5, y: 0 });
      expect(cells[2]).toEqual({ x: 4, y: 1 });
      expect(cells[3]).toEqual({ x: 5, y: 1 });
    });

    test('should return cells for T piece', () => {
      const piece = new Piece('T', 3, 0);
      const cells = piece.getCells();
      expect(cells).toHaveLength(4);
    });

    test('should apply piece position offset', () => {
      const piece = new Piece('I', 5, 10);
      const cells = piece.getCells();
      expect(cells[0].x).toBeGreaterThanOrEqual(5);
      expect(cells[0].y).toBeGreaterThanOrEqual(10);
    });

    test('should return empty array for invalid type', () => {
      const piece = new Piece('INVALID', 0, 0);
      const cells = piece.getCells();
      expect(cells).toEqual([]);
    });
  });

  describe('Movement', () => {
    let piece;

    beforeEach(() => {
      piece = new Piece('I', 3, 5);
    });

    test('moveDown should increment y', () => {
      piece.moveDown();
      expect(piece.y).toBe(6);
    });

    test('moveLeft should decrement x', () => {
      piece.moveLeft();
      expect(piece.x).toBe(2);
    });

    test('moveRight should increment x', () => {
      piece.moveRight();
      expect(piece.x).toBe(4);
    });

    test('multiple moves should accumulate', () => {
      piece.moveDown();
      piece.moveDown();
      piece.moveRight();
      expect(piece.x).toBe(4);
      expect(piece.y).toBe(7);
    });
  });

  describe('Rotation', () => {
    test('rotateCW should increment rotation', () => {
      const piece = new Piece('T', 3, 0);
      expect(piece.rot).toBe(0);
      piece.rotateCW();
      expect(piece.rot).toBe(1);
    });

    test('rotateCW should wrap around for T piece', () => {
      const piece = new Piece('T', 3, 0);
      piece.rotateCW();
      piece.rotateCW();
      piece.rotateCW();
      piece.rotateCW();
      expect(piece.rot).toBe(0);
    });

    test('rotateCW should wrap around for I piece', () => {
      const piece = new Piece('I', 3, 0);
      piece.rotateCW();
      piece.rotateCW();
      expect(piece.rot).toBe(0);
    });

    test('rotateCCW should decrement rotation', () => {
      const piece = new Piece('T', 3, 0);
      piece.rotateCW();
      piece.rotateCCW();
      expect(piece.rot).toBe(0);
    });

    test('rotateCCW should wrap around correctly', () => {
      const piece = new Piece('T', 3, 0);
      piece.rotateCCW();
      expect(piece.rot).toBe(3);
    });

    test('O piece rotation should not change shape', () => {
      const piece = new Piece('O', 4, 0);
      const cells1 = piece.getCells();
      piece.rotateCW();
      const cells2 = piece.getCells();
      expect(cells1).toEqual(cells2);
    });

    test('rotation should change cell positions for I piece', () => {
      const piece = new Piece('I', 3, 0);
      const cells1 = piece.getCells();
      piece.rotateCW();
      const cells2 = piece.getCells();
      expect(cells1).not.toEqual(cells2);
    });
  });

  describe('All piece types', () => {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    types.forEach(type => {
      test(`${type} piece should have 4 cells`, () => {
        const piece = new Piece(type, 3, 0);
        const cells = piece.getCells();
        expect(cells).toHaveLength(4);
      });

      test(`${type} piece should have valid coordinates`, () => {
        const piece = new Piece(type, 0, 0);
        const cells = piece.getCells();
        cells.forEach(cell => {
          expect(typeof cell.x).toBe('number');
          expect(typeof cell.y).toBe('number');
        });
      });
    });
  });
});
