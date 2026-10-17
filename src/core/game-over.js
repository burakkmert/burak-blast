// Game-over detection. Pure functions, no DOM.
import { BOARD_SIZE, canPlace } from './board.js';

export function canPieceFitAnywhere(board, shape) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (canPlace(board, shape, row, col)) return true;
    }
  }
  return false;
}

/** True when at least one remaining piece fits somewhere. Empty slots (null) are ignored. */
export function hasAnyValidMove(board, trayPieces) {
  return trayPieces.some((p) => p && canPieceFitAnywhere(board, p.shape));
}
