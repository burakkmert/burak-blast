// Score and combo rules. Pure functions; rule values are passed in (see SCORING in config.js).

/**
 * Score for one move.
 * @param {{cellsPlaced:number, linesCleared:number, combo:number, boardCleared:boolean}} move
 *        `combo` is the streak before this move
 * @param {{cellPoints:number, linePoints:number, comboStep:number, boardClearBonus:number}} rules
 * @returns {{placement:number, lines:number, bonus:number, total:number}}
 */
export function calculateScore({ cellsPlaced, linesCleared, combo, boardCleared }, rules) {
  const placement = cellsPlaced * rules.cellPoints;
  const lines = Math.round(rules.linePoints * linesCleared * linesCleared * (1 + combo * rules.comboStep));
  const bonus = boardCleared ? rules.boardClearBonus : 0;
  return { placement, lines, bonus, total: placement + lines + bonus };
}

/**
 * Combo state after a move. Clearing a line raises the combo; a miss counts toward
 * `comboGrace` consecutive misses, which reset it.
 * @param {{combo:number, misses:number}} state
 * @param {number} linesCleared
 * @param {{comboGrace:number}} rules
 */
export function nextComboState(state, linesCleared, rules) {
  if (linesCleared > 0) return { combo: state.combo + 1, misses: 0 };
  const misses = state.misses + 1;
  return misses >= rules.comboGrace ? { combo: 0, misses: 0 } : { combo: state.combo, misses };
}
