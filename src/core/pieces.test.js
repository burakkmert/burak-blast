import { describe, expect, it } from 'vitest';
import { BOARD_SIZE } from './board.js';
import { DEFAULT_PIECES } from './pieces.js';
import { isConnected, isValidShape } from './shapes.js';

describe('DEFAULT_PIECES', () => {
  it('has unique ids', () => {
    const ids = DEFAULT_PIECES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has valid, connected and pairwise distinct shapes', () => {
    expect(DEFAULT_PIECES.every((p) => isValidShape(p.shape) && isConnected(p.shape))).toBe(true);
    const keys = DEFAULT_PIECES.map((p) => JSON.stringify(p.shape));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps persisted ids stable', () => {
    expect(DEFAULT_PIECES).toHaveLength(27);
    expect(DEFAULT_PIECES[0]).toMatchObject({ id: 'd0', kind: 'single' });
    expect(DEFAULT_PIECES[26]).toMatchObject({ id: 'd26', kind: 'z' });
  });

  it('numbers orientations only for shapes that have several', () => {
    const variantsOf = (kind) => DEFAULT_PIECES.filter((p) => p.kind === kind).map((p) => p.variant);
    expect(variantsOf('single')).toEqual([undefined]);
    expect(variantsOf('t')).toEqual([1, 2, 3, 4]);
    expect(variantsOf('s')).toEqual([1, 2]);
  });

  it('fits on the board', () => {
    expect(DEFAULT_PIECES.every((p) => p.shape.length <= BOARD_SIZE && p.shape[0].length <= BOARD_SIZE)).toBe(true);
  });
});
