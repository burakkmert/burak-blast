// Game state in one place: board, tray pieces, score and combo. Never touches the DOM.
import { FAIR_SPAWN, TRAY_SLOTS } from '../config.js';
import { createBoard } from '../core/board.js';
import { dealPieces as dealFairPieces } from '../core/spawn.js';
import { getRandomPiece } from './piece-store.js';
import { loadBest } from './save.js';
import { settings } from './settings.js';

export const state = {
  board: createBoard(),
  pieces: [], // one piece per tray slot; null for an empty slot
  score: 0,
  best: loadBest(),
  bestAtStart: 0, // best score when this game began, to detect a new record
  combo: { combo: 0, misses: 0 },
};

/** Fills the tray with new pieces, favouring ones that fit when fair spawn is on. */
export function dealPieces() {
  state.pieces = dealFairPieces({
    board: state.board,
    draw: getRandomPiece,
    slots: TRAY_SLOTS,
    fair: settings.fairSpawn,
    attempts: FAIR_SPAWN.attempts,
  });
}

/** Clears the board, score and combo. The best score is kept. */
export function resetBoard() {
  state.board = createBoard();
  state.score = 0;
  state.combo = { combo: 0, misses: 0 };
  state.bestAtStart = state.best;
}

export function newGame() {
  resetBoard();
  dealPieces();
}

export function restoreGame(data) {
  state.board = data.board;
  state.pieces = data.pieces;
  state.score = data.score;
  state.combo = data.combo;
  state.bestAtStart = data.bestAtStart;
}

/** Removes a placed piece from its slot. */
export function takePiece(slotIndex) {
  state.pieces[slotIndex] = null;
}

export function isTrayEmpty() {
  return state.pieces.every((p) => p === null);
}
