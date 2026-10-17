import { describe, expect, it } from 'vitest';
import { cellCount, isConnected, isValidShape, shapesEqual, trimShape } from './shapes.js';

describe('isConnected', () => {
  it('accepts a single cell', () => {
    expect(isConnected([[1]])).toBe(true);
  });

  it('accepts edge-connected shapes', () => {
    expect(isConnected([[1, 1, 1]])).toBe(true);
    expect(
      isConnected([
        [1, 0, 0],
        [1, 1, 1],
      ]),
    ).toBe(true);
  });

  it('accepts a winding path', () => {
    expect(
      isConnected([
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ]),
    ).toBe(true);
  });

  it('rejects cells that only touch at a corner', () => {
    expect(
      isConnected([
        [1, 0],
        [0, 1],
      ]),
    ).toBe(false);
  });

  it('rejects separate groups', () => {
    expect(isConnected([[1, 0, 1]])).toBe(false);
  });

  it('rejects an empty shape', () => {
    expect(isConnected([[0, 0]])).toBe(false);
  });
});

describe('trimShape', () => {
  it('crops empty rows and columns around the shape', () => {
    const grid = [
      [0, 0, 0],
      [0, 1, 1],
      [0, 1, 0],
    ];
    expect(trimShape(grid)).toEqual([
      [1, 1],
      [1, 0],
    ]);
  });

  it('returns null for an empty grid', () => {
    expect(
      trimShape([
        [0, 0],
        [0, 0],
      ]),
    ).toBeNull();
  });

  it('normalizes truthy values to 1', () => {
    expect(trimShape([[2, 0]])).toEqual([[1]]);
  });
});

describe('isValidShape', () => {
  it('accepts a rectangular 0/1 matrix up to 5x5', () => {
    expect(isValidShape([[1]])).toBe(true);
    expect(isValidShape([[1, 1, 1, 1, 1]])).toBe(true);
  });

  it('rejects empty, oversized, ragged or non-binary matrices', () => {
    expect(isValidShape([])).toBe(false);
    expect(isValidShape([[0]])).toBe(false);
    expect(isValidShape([[1, 1, 1, 1, 1, 1]])).toBe(false);
    expect(isValidShape([[1], [1, 1]])).toBe(false);
    expect(isValidShape([[2]])).toBe(false);
    expect(isValidShape('x')).toBe(false);
  });
});

describe('shapesEqual and cellCount', () => {
  it('compares shapes by content', () => {
    expect(shapesEqual([[1, 0]], [[1, 0]])).toBe(true);
    expect(shapesEqual([[1, 0]], [[0, 1]])).toBe(false);
  });

  it('counts filled cells', () => {
    expect(
      cellCount([
        [1, 0],
        [1, 1],
      ]),
    ).toBe(3);
  });
});
