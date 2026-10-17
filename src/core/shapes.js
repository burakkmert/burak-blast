// Shape matrices (0/1 grids) and their validation. Pure functions, no DOM.

export const MAX_PIECE_SIZE = 5;

/** Crops a 0/1 grid to its bounding box; null when it has no filled cell. */
export function trimShape(grid) {
  const rows = grid.map((row, r) => (row.some(Boolean) ? r : -1)).filter((r) => r >= 0);
  if (rows.length === 0) return null;
  const cols = [];
  for (let c = 0; c < grid[0].length; c++) if (grid.some((row) => row[c])) cols.push(c);
  const [r0, r1] = [rows[0], rows[rows.length - 1]];
  const [c0, c1] = [cols[0], cols[cols.length - 1]];
  return grid.slice(r0, r1 + 1).map((row) => row.slice(c0, c1 + 1).map((v) => (v ? 1 : 0)));
}

const NEIGHBORS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** True when all filled cells touch edge to edge (breadth-first search; corners do not count). */
export function isConnected(shape) {
  const cells = [];
  shape.forEach((row, r) => row.forEach((v, c) => v && cells.push([r, c])));
  if (cells.length === 0) return false;

  const seen = new Set([cells[0].join(',')]);
  const queue = [cells[0]];
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of NEIGHBORS) {
      const [nr, nc] = [r + dr, c + dc];
      const key = `${nr},${nc}`;
      if (shape[nr]?.[nc] && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return seen.size === cells.length;
}

export const shapesEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const cellCount = (shape) => shape.flat().filter(Boolean).length;

/** A non-empty rectangular 0/1 matrix of at most MAX_PIECE_SIZE cells per side. */
export function isValidShape(shape) {
  return (
    Array.isArray(shape) &&
    shape.length > 0 &&
    shape.length <= MAX_PIECE_SIZE &&
    shape.every(
      (row) =>
        Array.isArray(row) &&
        row.length > 0 &&
        row.length <= MAX_PIECE_SIZE &&
        row.length === shape[0].length &&
        row.every((v) => v === 0 || v === 1),
    ) &&
    shape.flat().some(Boolean)
  );
}
