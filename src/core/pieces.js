// Built-in piece definitions. Ids (d0, d1, ...) are persisted, so the order must not change.

const line = (n, vertical = false) => (vertical ? Array.from({ length: n }, () => [1]) : [Array(n).fill(1)]);

const square = (n) => Array.from({ length: n }, () => Array(n).fill(1));

const rotate = (m) => m[0].map((_, c) => m.map((row) => row[c]).reverse());

/** Distinct orientations of a shape, rotating clockwise. */
function rotations(m) {
  const seen = new Set();
  const out = [];
  let cur = m;
  for (let i = 0; i < 4; i++) {
    const key = JSON.stringify(cur);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(cur);
    }
    cur = rotate(cur);
  }
  return out;
}

/** One entry per orientation; `variant` is 1-based, or 0 when the shape has a single orientation. */
const variants = (kind, m) =>
  rotations(m).map((shape, i, all) => ({ kind, shape, variant: all.length > 1 ? i + 1 : 0 }));

const DEFINITIONS = [
  { kind: 'single', shape: [[1]] },
  ...[2, 3, 4, 5].flatMap((size) => [
    { kind: 'line-h', size, shape: line(size) },
    { kind: 'line-v', size, shape: line(size, true) },
  ]),
  { kind: 'square', size: 2, shape: square(2) },
  { kind: 'square', size: 3, shape: square(3) },
  ...variants('big-l', [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ]),
  ...variants('small-l', [
    [1, 0],
    [1, 1],
  ]),
  ...variants('t', [
    [1, 1, 1],
    [0, 1, 0],
  ]),
  ...variants('s', [
    [0, 1, 1],
    [1, 1, 0],
  ]),
  ...variants('z', [
    [1, 1, 0],
    [0, 1, 1],
  ]),
];

/** @type {{id:string, kind:string, size?:number, variant?:number, shape:number[][]}[]} */
export const DEFAULT_PIECES = DEFINITIONS.map((def, i) => ({ id: `d${i}`, ...def }));
