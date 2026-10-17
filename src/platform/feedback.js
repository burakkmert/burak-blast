// Single entry point for sound and vibration: feedback(event, data).
// Game code never calls sound.js or haptics.js directly; the event table decides what plays.
import { settings } from '../state/settings.js';
import { haptic } from './haptics.js';
import { playSound } from './sound.js';

// event -> { sound: sound name, haptic: kind or (data) => kind }
const EVENTS = {
  pickUp: { sound: 'pickUp', haptic: 'light' },
  place: { sound: 'place', haptic: 'light' },
  invalid: { sound: 'invalid', haptic: 'warning' },
  lineClear: { sound: 'lineClear', haptic: (d) => (d.lines >= 2 ? 'heavy' : 'medium') },
  combo: { sound: 'combo' },
  boardClear: { sound: 'boardClear', haptic: 'success' },
  gameOver: { sound: 'gameOver', haptic: 'error' },
  newRecord: { sound: 'newRecord', haptic: 'success' },
  uiClick: { sound: 'uiClick' },
};

/** @param {keyof typeof EVENTS} name @param {object} [data] e.g. { lines: 2 } or { combo: 3 } */
export function feedback(name, data = {}) {
  const ev = EVENTS[name];
  if (!ev) return;
  if (settings.sound && ev.sound) playSound(ev.sound, data);
  if (settings.vibration && ev.haptic) haptic(typeof ev.haptic === 'function' ? ev.haptic(data) : ev.haptic);
}

/** Plays a short sample when sound or vibration is switched on, so the user can tell what changed. */
export function sample(kind) {
  if (kind === 'sound') playSound('place');
  else haptic('medium');
}
