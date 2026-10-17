// Random piece selection and dealing. Randomness is injectable so tests can be deterministic.
import { hasAnyValidMove } from './game-over.js';

/** Picks one entry from `pool` with probability proportional to its `weight`. */
export function pickWeighted(pool, random = Math.random) {
  let roll = random() * pool.reduce((sum, p) => sum + p.weight, 0);
  return pool.find((p) => (roll -= p.weight) < 0) ?? pool[pool.length - 1];
}

/**
 * Deals a full tray. With `fair`, redraws (up to `attempts` times) until at least one piece fits.
 * @param {{board:number[][], draw:() => object, slots:number, fair:boolean, attempts:number}} opts
 */
export function dealPieces({ board, draw, slots, fair, attempts }) {
  const deal = () => Array.from({ length: slots }, () => draw());
  let pieces = deal();
  if (fair) {
    for (let i = 0; i < attempts && !hasAnyValidMove(board, pieces); i++) pieces = deal();
  }
  return pieces;
}
