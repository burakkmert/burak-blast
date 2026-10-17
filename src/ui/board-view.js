// Draws the board and its animations. Cells are created once; rendering only toggles classes.
import { TIMING } from '../config.js';
import { BOARD_SIZE } from '../core/board.js';

const cellAt = (container, r, c) => container.children[r * BOARD_SIZE + c];

export function buildBoardDom(container) {
  container.innerHTML = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      container.appendChild(cell);
    }
  }
}

export function renderBoard(container, board) {
  for (const cell of container.children) {
    const color = board[cell.dataset.row][cell.dataset.col];
    cell.classList.toggle('filled', !!color);
    cell.classList.remove('clearing', 'gameover');
    cell.style.removeProperty('--delay');
    cell.style.setProperty('--block-color', color || 'transparent');
  }
}

/** Short squash animation on freshly placed cells. */
export function animateSettle(container, shape, row, col) {
  shape.forEach((line, r) =>
    line.forEach((v, c) => {
      const cell = v && cellAt(container, row + r, col + c);
      if (!cell) return;
      cell.classList.remove('settle');
      void cell.offsetWidth; // restart the animation
      cell.classList.add('settle');
      cell.addEventListener('animationend', () => cell.classList.remove('settle'), { once: true });
    }),
  );
}

/**
 * Starts the clear animation on the given rows and columns without touching game state.
 * @returns {{cells: HTMLElement[], duration: number}} animated cells and total duration in ms
 */
export function animateClear(container, rows, cols) {
  const delays = new Map(); // cell index -> delay; crossings take the smaller one
  const add = (idx, d) => delays.set(idx, Math.min(d, delays.get(idx) ?? Infinity));
  for (const r of rows) for (let c = 0; c < BOARD_SIZE; c++) add(r * BOARD_SIZE + c, c * TIMING.clearStepMs);
  for (const c of cols) for (let r = 0; r < BOARD_SIZE; r++) add(r * BOARD_SIZE + c, r * TIMING.clearStepMs);

  const cells = [];
  let maxDelay = 0;
  for (const [idx, d] of delays) {
    const cell = container.children[idx];
    cell.style.setProperty('--delay', `${d}ms`);
    cell.classList.add('clearing');
    cells.push(cell);
    maxDelay = Math.max(maxDelay, d);
  }
  return { cells, duration: maxDelay + TIMING.clearMs };
}

/** Cells turn gray in a diagonal sweep. @returns {number} total duration in ms */
export function animateGameOver(container) {
  const step = (TIMING.gameOverMs - TIMING.gameOverCellMs) / (2 * (BOARD_SIZE - 1));
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = cellAt(container, r, c);
      cell.style.setProperty('--delay', `${Math.round((r + c) * step)}ms`);
      cell.classList.add('gameover');
    }
  }
  return TIMING.gameOverMs;
}

// ---------- Drop preview ----------
let previewMap = new Map(); // cell -> 'preview' | 'will-clear'

export function clearPreview() {
  for (const cell of previewMap.keys()) cell.classList.remove('preview', 'will-clear');
  previewMap = new Map();
}

/**
 * Shows where the piece would land and which lines it would complete.
 * Only the cells that changed since the last call get their class updated.
 */
export function showPreview(container, shape, row, col, color, lines = { rows: [], cols: [] }) {
  const next = new Map();
  shape.forEach((line, r) =>
    line.forEach((v, c) => {
      if (v) next.set(cellAt(container, row + r, col + c), 'preview');
    }),
  );
  for (const r of lines.rows) for (let c = 0; c < BOARD_SIZE; c++) next.set(cellAt(container, r, c), 'will-clear');
  for (const c of lines.cols) for (let r = 0; r < BOARD_SIZE; r++) next.set(cellAt(container, r, c), 'will-clear');

  for (const [cell, cls] of previewMap) {
    if (next.get(cell) !== cls) cell.classList.remove(cls);
  }
  for (const [cell, cls] of next) {
    if (previewMap.get(cell) !== cls) cell.classList.add(cls);
    cell.style.setProperty('--preview-color', color);
  }
  previewMap = next;
}
