import { describe, expect, it } from 'vitest';
import {
  BOARD_SIZE,
  canPlace,
  clearLines,
  createBoard,
  findFullLines,
  getDropCell,
  getPlacementLines,
  isBoardEmpty,
  placePiece,
} from './board.js';

const SINGLE = [[1]];
const SQUARE = [
  [1, 1],
  [1, 1],
];
const L_SHAPE = [
  [1, 0],
  [1, 1],
];

const fillRow = (board, r, color = 'red') => board[r].fill(color);
const fillCol = (board, c, color = 'red') => board.forEach((row) => (row[c] = color));

describe('createBoard', () => {
  it('creates an empty square board', () => {
    const board = createBoard();
    expect(board).toHaveLength(BOARD_SIZE);
    expect(board.every((row) => row.length === BOARD_SIZE && row.every((v) => v === 0))).toBe(true);
    expect(isBoardEmpty(board)).toBe(true);
  });
});

describe('canPlace', () => {
  it('accepts a piece on empty cells inside the board', () => {
    expect(canPlace(createBoard(), SQUARE, 0, 0)).toBe(true);
    expect(canPlace(createBoard(), SQUARE, BOARD_SIZE - 2, BOARD_SIZE - 2)).toBe(true);
  });

  it('rejects a piece that sticks out of any edge', () => {
    const board = createBoard();
    expect(canPlace(board, SQUARE, -1, 0)).toBe(false);
    expect(canPlace(board, SQUARE, 0, -1)).toBe(false);
    expect(canPlace(board, SQUARE, BOARD_SIZE - 1, 0)).toBe(false);
    expect(canPlace(board, SQUARE, 0, BOARD_SIZE - 1)).toBe(false);
  });

  it('rejects overlap with a filled cell', () => {
    const board = createBoard();
    board[3][3] = 'red';
    expect(canPlace(board, SQUARE, 2, 2)).toBe(false);
    expect(canPlace(board, SQUARE, 4, 4)).toBe(true);
  });

  it('ignores the empty cells of a shape', () => {
    const board = createBoard();
    board[0][1] = 'red'; // sits in the empty corner of the L bounding box
    expect(canPlace(board, L_SHAPE, 0, 0)).toBe(true);
  });
});

describe('placePiece', () => {
  it('writes the color only into filled shape cells', () => {
    const board = createBoard();
    placePiece(board, L_SHAPE, 2, 3, 'blue');
    expect(board[2][3]).toBe('blue');
    expect(board[3][3]).toBe('blue');
    expect(board[3][4]).toBe('blue');
    expect(board[2][4]).toBe(0);
  });
});

describe('findFullLines', () => {
  it('finds nothing on an empty board', () => {
    expect(findFullLines(createBoard())).toEqual({ rows: [], cols: [] });
  });

  it('finds full rows and full columns', () => {
    const board = createBoard();
    fillRow(board, 2);
    fillRow(board, 5);
    fillCol(board, 7);
    expect(findFullLines(board)).toEqual({ rows: [2, 5], cols: [7] });
  });

  it('ignores a line with one gap', () => {
    const board = createBoard();
    fillRow(board, 1);
    board[1][4] = 0;
    expect(findFullLines(board)).toEqual({ rows: [], cols: [] });
  });
});

describe('clearLines', () => {
  it('empties a row and reports the number of cleared cells', () => {
    const board = createBoard();
    fillRow(board, 3);
    expect(clearLines(board, [3], [])).toBe(BOARD_SIZE);
    expect(isBoardEmpty(board)).toBe(true);
  });

  it('clears a row and a column together and counts the crossing once', () => {
    const board = createBoard();
    fillRow(board, 4);
    fillCol(board, 4);
    const { rows, cols } = findFullLines(board);
    expect(rows).toEqual([4]);
    expect(cols).toEqual([4]);

    expect(clearLines(board, rows, cols)).toBe(2 * BOARD_SIZE - 1);
    expect(isBoardEmpty(board)).toBe(true);
  });

  it('leaves other cells untouched (no gravity)', () => {
    const board = createBoard();
    fillRow(board, 7);
    board[6][2] = 'green';
    clearLines(board, [7], []);
    expect(board[6][2]).toBe('green');
    expect(board[7].every((v) => v === 0)).toBe(true);
  });

  it('counts only cells that were filled', () => {
    const board = createBoard();
    board[0][0] = 'red';
    expect(clearLines(board, [0], [])).toBe(1);
  });
});

describe('getPlacementLines', () => {
  it('reports lines a piece would complete without changing the board', () => {
    const board = createBoard();
    fillRow(board, 0);
    board[0][3] = 0;
    const before = JSON.stringify(board);

    expect(getPlacementLines(board, SINGLE, 0, 3)).toEqual({ rows: [0], cols: [] });
    expect(JSON.stringify(board)).toBe(before);
  });

  it('detects a row and a column completed by the same piece', () => {
    const board = createBoard();
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (i === 4) continue;
      board[4][i] = 'red';
      board[i][4] = 'red';
    }
    expect(getPlacementLines(board, SINGLE, 4, 4)).toEqual({ rows: [4], cols: [4] });
  });
});

describe('getDropCell', () => {
  const boardRect = { left: 100, top: 200 };
  const gap = 4;
  const cellSize = 36;
  const pitch = cellSize + gap;

  it('maps the piece position to the nearest cell', () => {
    const rect = { left: boardRect.left + gap + 2 * pitch + 5, top: boardRect.top + gap + 3 * pitch - 5 };
    expect(getDropCell(rect, boardRect, gap, cellSize)).toEqual({ row: 3, col: 2 });
  });

  it('returns null outside the board', () => {
    expect(getDropCell({ left: 0, top: 0 }, boardRect, gap, cellSize)).toBeNull();
    const far = { left: boardRect.left + gap + BOARD_SIZE * pitch, top: boardRect.top + gap };
    expect(getDropCell(far, boardRect, gap, cellSize)).toBeNull();
  });
});
