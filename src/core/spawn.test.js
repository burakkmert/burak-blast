import { describe, expect, it } from 'vitest';
import { createBoard } from './board.js';
import { dealPieces, pickWeighted } from './spawn.js';

describe('pickWeighted', () => {
  const pool = [
    { id: 'a', weight: 1 },
    { id: 'b', weight: 3 },
  ];

  it('maps the random value onto the cumulative weights', () => {
    expect(pickWeighted(pool, () => 0).id).toBe('a');
    expect(pickWeighted(pool, () => 0.24).id).toBe('a');
    expect(pickWeighted(pool, () => 0.26).id).toBe('b');
    expect(pickWeighted(pool, () => 0.999).id).toBe('b');
  });

  it('always returns an entry of the pool', () => {
    expect(pickWeighted([{ id: 'only', weight: 5 }], Math.random).id).toBe('only');
  });
});

describe('dealPieces', () => {
  const single = { shape: [[1]] };
  const bigSquare = {
    shape: Array.from({ length: 3 }, () => [1, 1, 1]),
  };

  /** A board where only one cell is free, so only the single fits. */
  function almostFullBoard() {
    const board = createBoard().map((row) => row.map(() => 'x'));
    board[0][0] = 0;
    return board;
  }

  it('deals the requested number of pieces', () => {
    const pieces = dealPieces({ board: createBoard(), draw: () => single, slots: 3, fair: true, attempts: 5 });
    expect(pieces).toHaveLength(3);
  });

  it('redraws until a piece fits when fair', () => {
    const queue = [bigSquare, bigSquare, bigSquare, single, bigSquare, bigSquare];
    let i = 0;
    const draw = () => queue[i++ % queue.length];
    const pieces = dealPieces({ board: almostFullBoard(), draw, slots: 3, fair: true, attempts: 20 });
    expect(pieces).toContain(single);
  });

  it('does not redraw when fair is off', () => {
    let draws = 0;
    const draw = () => {
      draws++;
      return bigSquare;
    };
    dealPieces({ board: almostFullBoard(), draw, slots: 3, fair: false, attempts: 20 });
    expect(draws).toBe(3);
  });

  it('gives up after the attempt limit', () => {
    let draws = 0;
    const draw = () => {
      draws++;
      return bigSquare;
    };
    const pieces = dealPieces({ board: almostFullBoard(), draw, slots: 3, fair: true, attempts: 4 });
    expect(pieces).toHaveLength(3);
    expect(draws).toBe(3 * (1 + 4));
  });
});
