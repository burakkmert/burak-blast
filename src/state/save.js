// Saved game and best score. Corrupt or incompatible saves are ignored (a new game starts).
import { TRAY_SLOTS } from '../config.js';
import { BOARD_SIZE } from '../core/board.js';
import { isValidShape } from '../core/shapes.js';
import { readJson, readString, removeItem, STORAGE_KEYS, writeJson, writeString } from './storage.js';

const SAVE_VERSION = 1;

export function saveGame(state) {
  writeJson(STORAGE_KEYS.save, {
    v: SAVE_VERSION,
    board: state.board,
    pieces: state.pieces,
    score: state.score,
    combo: state.combo,
    bestAtStart: state.bestAtStart,
  });
}

export function clearSave() {
  removeItem(STORAGE_KEYS.save);
}

/** The saved game, or null when missing or invalid. */
export function loadGame() {
  const data = readJson(STORAGE_KEYS.save);
  return isValid(data) ? data : null;
}

export function loadBest() {
  return Number(readString(STORAGE_KEYS.best)) || 0;
}

export function saveBest(value) {
  writeString(STORAGE_KEYS.best, String(value));
}

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

function isValid(d) {
  if (!d || d.v !== SAVE_VERSION) return false;
  const boardOk =
    Array.isArray(d.board) &&
    d.board.length === BOARD_SIZE &&
    d.board.every(
      (row) => Array.isArray(row) && row.length === BOARD_SIZE && row.every((v) => v === 0 || typeof v === 'string'),
    );
  const piecesOk =
    Array.isArray(d.pieces) &&
    d.pieces.length === TRAY_SLOTS &&
    d.pieces.every((p) => p === null || (p && typeof p.color === 'string' && isNum(p.id) && isValidShape(p.shape)));
  const comboOk = d.combo && isNum(d.combo.combo) && isNum(d.combo.misses);
  return boardOk && piecesOk && !!comboOk && isNum(d.score) && d.score >= 0 && isNum(d.bestAtStart);
}
