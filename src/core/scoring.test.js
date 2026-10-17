import { describe, expect, it } from 'vitest';
import { calculateScore, nextComboState } from './scoring.js';

const RULES = { cellPoints: 1, linePoints: 10, comboStep: 0.5, comboGrace: 3, boardClearBonus: 300 };

describe('calculateScore', () => {
  it('scores only placed cells when nothing clears', () => {
    const result = calculateScore({ cellsPlaced: 4, linesCleared: 0, combo: 0, boardCleared: false }, RULES);
    expect(result).toEqual({ placement: 4, lines: 0, bonus: 0, total: 4 });
  });

  it('scores a single line', () => {
    const result = calculateScore({ cellsPlaced: 1, linesCleared: 1, combo: 0, boardCleared: false }, RULES);
    expect(result.lines).toBe(10);
    expect(result.total).toBe(11);
  });

  it('grows quadratically with simultaneous lines', () => {
    const lines = (n) =>
      calculateScore({ cellsPlaced: 0, linesCleared: n, combo: 0, boardCleared: false }, RULES).lines;
    expect(lines(2)).toBe(40);
    expect(lines(3)).toBe(90);
  });

  it('multiplies line points by the combo', () => {
    const lines = (combo) =>
      calculateScore({ cellsPlaced: 0, linesCleared: 1, combo, boardCleared: false }, RULES).lines;
    expect(lines(0)).toBe(10);
    expect(lines(1)).toBe(15);
    expect(lines(2)).toBe(20);
  });

  it('adds the board-clear bonus', () => {
    const result = calculateScore({ cellsPlaced: 1, linesCleared: 1, combo: 0, boardCleared: true }, RULES);
    expect(result.bonus).toBe(300);
    expect(result.total).toBe(1 + 10 + 300);
  });

  it('uses the given rules', () => {
    const rules = { ...RULES, cellPoints: 2, linePoints: 100, boardClearBonus: 1 };
    const result = calculateScore({ cellsPlaced: 3, linesCleared: 1, combo: 0, boardCleared: true }, rules);
    expect(result).toEqual({ placement: 6, lines: 100, bonus: 1, total: 107 });
  });
});

describe('nextComboState', () => {
  it('increments the combo on a clear and resets misses', () => {
    expect(nextComboState({ combo: 1, misses: 2 }, 1, RULES)).toEqual({ combo: 2, misses: 0 });
  });

  it('keeps the combo and counts a miss', () => {
    expect(nextComboState({ combo: 2, misses: 0 }, 0, RULES)).toEqual({ combo: 2, misses: 1 });
  });

  it('resets the combo after comboGrace consecutive misses', () => {
    let state = { combo: 3, misses: 0 };
    state = nextComboState(state, 0, RULES);
    state = nextComboState(state, 0, RULES);
    expect(state.combo).toBe(3);
    state = nextComboState(state, 0, RULES);
    expect(state).toEqual({ combo: 0, misses: 0 });
  });

  it('a clear in between restarts the miss count', () => {
    let state = { combo: 1, misses: 2 };
    state = nextComboState(state, 2, RULES);
    expect(state).toEqual({ combo: 2, misses: 0 });
    state = nextComboState(state, 0, RULES);
    expect(state.misses).toBe(1);
  });
});
