// Sound effects synthesized with Web Audio (oscillators and envelopes), so no audio files ship.
// One AudioContext and one master gain feeding a compressor. The context is never created while sound is off.
import { settings } from '../state/settings.js';

const MIN_GAP_MS = 50; // the same sound plays at most once per 50 ms, so overlaps do not crackle
const HEADROOM = 0.8; // keeps full volume below clipping

let ctx = null;
let master = null;
const lastPlayed = new Map();

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
// Major pentatonic notes: any combination sounds consonant
const LADDER = [76, 79, 81, 84, 86, 88, 91, 93, 96]; // combo steps (E5 to C7)
const CHORD = [72, 76, 79, 84, 88, 91, 96]; // C major chord tones; more lines add more notes

function ensureContext() {
  if (ctx || !settings.sound) return ctx;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  ctx = new AudioContextClass();
  master = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  master.connect(compressor).connect(ctx.destination);
  applyVolume();
  return ctx;
}

function applyVolume() {
  if (master) master.gain.setTargetAtTime((settings.volume / 100) * HEADROOM, ctx.currentTime, 0.02);
}

export function setVolume() {
  applyVolume();
}

/** Browsers and Android only allow audio after a touch, so the context is created and resumed on the first one. */
export function initSound() {
  window.addEventListener(
    'pointerdown',
    () => {
      if (!settings.sound) return;
      ensureContext()?.resume();
    },
    { capture: true },
  );
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (settings.sound) ctx.resume();
  });
}

export function suspendSound() {
  ctx?.suspend();
}

export function resumeSound() {
  if (ctx && settings.sound) ctx.resume();
}

// ---------- Building blocks ----------

/** Marimba-like tone: a sine plus a short high harmonic, fast attack, exponential decay. */
function note(freq, t0, { dur = 0.3, vol = 0.4, type = 'sine', bright = 0.3 } = {}) {
  const voice = (f, v, d) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(v, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + d + 0.03);
  };
  voice(freq, vol, dur);
  if (bright) voice(freq * 4, vol * bright, dur * 0.25);
}

/** Dull thud with a falling pitch. */
function thump(f0, f1, t0, { dur = 0.15, vol = 0.5, type = 'sine' } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t0);
  osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// ---------- Sounds ----------
const SOUNDS = {
  pickUp: (t) => note(hz(88), t, { dur: 0.08, vol: 0.22, bright: 0.2 }),

  place: (t) => {
    thump(190, 90, t, { dur: 0.13, vol: 0.55 });
    note(hz(67), t, { dur: 0.1, vol: 0.14, bright: 0 });
  },

  invalid: (t) => thump(210, 120, t, { dur: 0.24, vol: 0.4, type: 'triangle' }),

  lineClear: (t, { lines = 1 } = {}) => {
    const count = Math.min(CHORD.length, 2 + lines * 1.5);
    CHORD.slice(0, Math.round(count)).forEach((m, i) => note(hz(m), t + i * 0.03, { dur: 0.5, vol: 0.3 }));
  },

  // Each combo level plays one step higher
  combo: (t, { combo = 2 } = {}) => {
    const m = LADDER[Math.min(Math.max(combo - 2, 0), LADDER.length - 1)];
    note(hz(m), t + 0.12, { dur: 0.4, vol: 0.38 });
    note(hz(m + 12), t + 0.12, { dur: 0.3, vol: 0.12, bright: 0 });
  },

  boardClear: (t) =>
    [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => note(hz(m), t + 0.15 + i * 0.07, { dur: 0.45, vol: 0.32 })),

  gameOver: (t) =>
    [69, 65, 62].forEach((m, i) => note(hz(m), t + i * 0.26, { dur: 0.7, vol: 0.38, type: 'triangle', bright: 0.15 })),

  newRecord: (t) => {
    [
      [72, 0],
      [76, 0.11],
      [79, 0.22],
      [76, 0.33],
      [84, 0.44],
    ].forEach(([m, d], i, all) => note(hz(m), t + d, { dur: i === all.length - 1 ? 0.7 : 0.25, vol: 0.34 }));
  },

  uiClick: (t) => note(hz(96), t, { dur: 0.04, vol: 0.1, bright: 0 }),
};

/** Plays a sound. Does nothing while sound is off (no context is created either). */
export function playSound(name, data = {}) {
  if (!settings.sound) return;
  const play = SOUNDS[name];
  if (!play || !ensureContext()) return;

  const run = () => {
    if (ctx.state !== 'running') return;
    const now = performance.now();
    if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return;
    lastPlayed.set(name, now);
    play(ctx.currentTime + 0.005, data);
  };

  // A new or suspended context must resume before it can play
  if (ctx.state === 'running') run();
  else ctx.resume().then(run, () => {});
}
