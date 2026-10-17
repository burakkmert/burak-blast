// Board rules: placement, line detection and clearing. Pure functions, no DOM.

export const BOARD_SIZE = 8;

/** Empty board: 0 is an empty cell, a filled cell holds its color. */
export function createBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

/** True when every filled cell of the shape lands on an empty cell inside the board. */
export function canPlace(board, shape, row, col) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const br = row + r;
      const bc = col + c;
      if (br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE) return false;
      if (board[br][bc]) return false;
    }
  }
  return true;
}

/** Writes the shape into the board. Callers check canPlace first. */
export function placePiece(board, shape, row, col, color) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) board[row + r][col + c] = color;
    }
  }
}

/** Indices of completely filled rows and columns. */
export function findFullLines(board) {
  const rows = [];
  const cols = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (board[i].every(Boolean)) rows.push(i);
    if (board.every((row) => row[i])) cols.push(i);
  }
  return { rows, cols };
}

/**
 * Empties the given rows and columns and returns how many filled cells were removed.
 * Cells are collected first so a row/column crossing is cleared and counted once.
 * There is no gravity: remaining cells stay where they are.
 */
export function clearLines(board, rows, cols) {
  const toClear = new Set();
  for (const r of rows) for (let c = 0; c < BOARD_SIZE; c++) toClear.add(r * BOARD_SIZE + c);
  for (const c of cols) for (let r = 0; r < BOARD_SIZE; r++) toClear.add(r * BOARD_SIZE + c);

  let count = 0;
  for (const idx of toClear) {
    const r = Math.floor(idx / BOARD_SIZE);
    const c = idx % BOARD_SIZE;
    if (board[r][c]) count++;
    board[r][c] = 0;
  }
  return count;
}

export function isBoardEmpty(board) {
  return board.every((row) => row.every((v) => !v));
}

/** Rows and columns that would be full after placing the shape. The board is not modified. */
export function getPlacementLines(board, shape, row, col) {
  const copy = board.map((r) => r.slice());
  placePiece(copy, shape, row, col, 1);
  return findFullLines(copy);
}

/**
 * Board cell under the top-left cell of a dragged piece, or null when outside the board.
 * @param {{left:number, top:number}} pieceRect full-size rectangle of the dragged piece
 * @param {{left:number, top:number}} boardRect board rectangle
 * @param {number} gap board padding and cell gap
 * @param {number} cellSize
 */
export function getDropCell(pieceRect, boardRect, gap, cellSize) {
  const pitch = cellSize + gap;
  const col = Math.round((pieceRect.left - (boardRect.left + gap)) / pitch);
  const row = Math.round((pieceRect.top - (boardRect.top + gap)) / pitch);
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  return { row, col };
}
