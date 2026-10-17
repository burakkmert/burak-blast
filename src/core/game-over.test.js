import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, createBoard } from './board.js';
import { canPieceFitAnywhere, hasAnyValidMove } from './game-over.js';

const SINGLE = { shape: [[1]] };
const SQUARE = {
  shape: [
    [1, 1],
    [1, 1],
  ],
};
const LINE_5 = { shape: [[1, 1, 1, 1, 1]] };

/** Checkerboard: every empty cell is isolated, so only a single cell can be placed. */
function checkerboard() {
  const board = createBoard();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) board[r][c] = 'x';
    }
  }
  return board;
}

describe('canPieceFitAnywhere', () => {
  it('fits anything on an empty board', () => {
    expect(canPieceFitAnywhere(createBoard(), LINE_5.shape)).toBe(true);
  });

  it('does not fit on a full board', () => {
    const board = createBoard().map((row) => row.map(() => 'x'));
    expect(canPieceFitAnywhere(board, SINGLE.shape)).toBe(false);
  });

  it('finds the last remaining spot', () => {
    const board = createBoard().map((row) => row.map(() => 'x'));
    board[BOARD_SIZE - 1][BOARD_SIZE - 1] = 0;
    expect(canPieceFitAnywhere(board, SINGLE.shape)).toBe(true);
    expect(canPieceFitAnywhere(board, SQUARE.shape)).toBe(false);
  });
});

describe('hasAnyValidMove', () => {
  it('is true when at least one piece fits', () => {
    expect(hasAnyValidMove(checkerboard(), [SQUARE, SINGLE, LINE_5])).toBe(true);
  });

  it('is false when no piece fits (game over)', () => {
    expect(hasAnyValidMove(checkerboard(), [SQUARE, LINE_5])).toBe(false);
  });

  it('ignores empty slots', () => {
    expect(hasAnyValidMove(checkerboard(), [null, SQUARE, null])).toBe(false);
    expect(hasAnyValidMove(checkerboard(), [null, SINGLE, null])).toBe(true);
  });

  it('is false for an empty tray', () => {
    expect(hasAnyValidMove(createBoard(), [null, null, null])).toBe(false);
  });
});
