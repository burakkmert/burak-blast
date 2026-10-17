// Piece store: built-in and custom pieces in one list.
//   { id, shape, color, weight, enabled, custom }
// Built-ins (core/pieces.js) cannot be deleted, only disabled; their color is null (random per draw).
// Custom pieces have a fixed color and a name. Changes affect only the next draw: pieces already
// in the tray or on the board carry their own shape.
import { BLOCK_COLORS } from '../config.js';
import { DEFAULT_PIECES } from '../core/pieces.js';
import { cellCount, isValidShape, shapesEqual } from '../core/shapes.js';
import { pickWeighted } from '../core/spawn.js';
import { readJson, STORAGE_KEYS, writeJson } from './storage.js';

export const WEIGHTS = { rare: 1, normal: 3, frequent: 6 };
export const MIN_ENABLED = 3;

// ---------- Piece instances ----------
let nextId = Date.now(); // avoids clashing with ids in a restored game

const randomColor = () => BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];

/** A playable piece: { id, shape, color }. */
export function makePiece(shape, color = randomColor()) {
  return { id: nextId++, shape, color };
}

// ---------- Persisted state ----------
let custom = []; // full records of the user's pieces
let overrides = {}; // built-in id -> { enabled, weight }

const validWeight = (w) => Object.values(WEIGHTS).includes(w);

/** Returns the stored { custom, defaults } when it is well formed, otherwise null. */
function parseStored(d) {
  const ok =
    d &&
    d.v === 1 &&
    Array.isArray(d.custom) &&
    d.custom.every(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.color === 'string' &&
        typeof p.enabled === 'boolean' &&
        validWeight(p.weight) &&
        isValidShape(p.shape),
    ) &&
    d.defaults &&
    typeof d.defaults === 'object' &&
    Object.values(d.defaults).every((o) => o && typeof o.enabled === 'boolean' && validWeight(o.weight));
  return ok ? d : null;
}

function load() {
  const stored = parseStored(readJson(STORAGE_KEYS.pieces));
  if (!stored) return;
  custom = stored.custom;
  overrides = stored.defaults;
  if (enabledCount() < MIN_ENABLED) {
    custom = [];
    overrides = {};
  }
}

function persist() {
  writeJson(STORAGE_KEYS.pieces, { v: 1, custom, defaults: overrides });
}

// ---------- Reading ----------

/** All pieces: built-ins first, then custom ones. */
export function getAll() {
  const defs = DEFAULT_PIECES.map(({ id, kind, size, variant, shape }) => ({
    id,
    kind,
    size,
    variant,
    shape,
    color: null,
    weight: overrides[id]?.weight ?? WEIGHTS.normal,
    enabled: overrides[id]?.enabled ?? true,
    custom: false,
  }));
  return [...defs, ...custom.map((p) => ({ ...p, custom: true }))];
}

const getById = (id) => getAll().find((p) => p.id === id) ?? null;
export const enabledCount = () => getAll().filter((p) => p.enabled).length;

load();

/** An existing piece with the same (trimmed) shape. `exceptId` skips the piece being edited. */
export function findDuplicate(shape, exceptId = null) {
  return getAll().find((p) => p.id !== exceptId && shapesEqual(p.shape, shape)) ?? null;
}

/** Non-blocking warnings about the enabled set, as codes for the UI to translate. */
export function getWarnings() {
  const out = [];
  if (!getAll().some((p) => p.enabled && cellCount(p.shape) <= 2)) out.push('no-small-piece');
  return out;
}

// ---------- Changing ----------
// Failures return { ok: false, reason } with reason 'not-found' | 'min-enabled'.

export function setEnabled(id, enabled) {
  const p = getById(id);
  if (!p) return { ok: false, reason: 'not-found' };
  if (!enabled && p.enabled && enabledCount() <= MIN_ENABLED) return { ok: false, reason: 'min-enabled' };

  if (p.custom) custom.find((c) => c.id === id).enabled = enabled;
  else overrides[id] = { enabled, weight: p.weight };
  persist();
  return { ok: true };
}

export function setWeight(id, weight) {
  const p = getById(id);
  if (!p || !validWeight(weight)) return;
  if (p.custom) custom.find((c) => c.id === id).weight = weight;
  else overrides[id] = { enabled: p.enabled, weight };
  persist();
}

/** Adds an enabled custom piece. */
export function addCustom({ name, shape, color, weight }) {
  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const piece = { id, name, shape, color, weight, enabled: true };
  custom.push(piece);
  persist();
  return piece;
}

export function updateCustom(id, patch) {
  const p = custom.find((c) => c.id === id);
  if (!p) return;
  Object.assign(p, patch);
  persist();
}

export function deleteCustom(id) {
  const p = custom.find((c) => c.id === id);
  if (!p) return { ok: false, reason: 'not-found' };
  if (p.enabled && enabledCount() <= MIN_ENABLED) return { ok: false, reason: 'min-enabled' };
  custom = custom.filter((c) => c.id !== id);
  persist();
  return { ok: true };
}

/** Resets the built-ins' enabled/weight settings; custom pieces are untouched. */
export function resetDefaults() {
  overrides = {};
  persist();
}

// ---------- Drawing ----------

/** A random enabled piece, chosen by weight. */
export function getRandomPiece() {
  let pool = getAll().filter((p) => p.enabled);
  if (pool.length === 0) pool = getAll().filter((p) => !p.custom); // safety net
  const picked = pickWeighted(pool);
  return makePiece(picked.shape, picked.color ?? randomColor());
}
