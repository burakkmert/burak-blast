// Frequency choices ([label, weight]) shared by the blocks list and the piece editor.
import { WEIGHTS } from '../../state/piece-store.js';
import { STRINGS } from '../strings.js';

export const RARITY = [
  [STRINGS.rarity.rare, WEIGHTS.rare],
  [STRINGS.rarity.normal, WEIGHTS.normal],
  [STRINGS.rarity.frequent, WEIGHTS.frequent],
];
