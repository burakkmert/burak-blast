// Visual effects: counting score, floating text, banners and animation triggers.
import { TIMING } from '../config.js';
import { settings } from '../state/settings.js';

/** True when "reduce motion" is on (defaults to the system preference): shake, particles and waves are skipped. */
export const reducedMotion = () => settings.reduceMotion;

/** Runs `cb` once when the animation called `name` ends on `el`, ignoring other animations. */
function onAnimationDone(el, name, cb) {
  const handler = (e) => {
    if (e.target !== el || e.animationName !== name) return;
    el.removeEventListener('animationend', handler);
    cb();
  };
  el.addEventListener('animationend', handler);
}

/** Board cells appear in a diagonal wave. */
export function waveIn(boardEl) {
  if (reducedMotion()) return;
  for (const cell of boardEl.children) {
    const delay = (Number(cell.dataset.row) + Number(cell.dataset.col)) * 35;
    cell.style.setProperty('--wave-delay', `${delay}ms`);
    cell.classList.add('wave-in');
    onAnimationDone(cell, 'wave-in', () => cell.classList.remove('wave-in'));
  }
}

/** New tray pieces bounce in one after another. */
export function arriveTray(trayEl) {
  if (reducedMotion()) return;
  trayEl.querySelectorAll('.slot').forEach((slot, i) => {
    const piece = slot.querySelector('.piece');
    if (!piece) return;
    piece.style.setProperty('--arrive-delay', `${i * 90}ms`);
    piece.classList.add('arrive');
    onAnimationDone(piece, 'arrive', () => piece.classList.remove('arrive'));
  });
}

/** Shakes the screen briefly; intensity is 0..1. */
export function shakeScreen(intensity = 0.5) {
  if (reducedMotion()) return;
  const app = document.getElementById('app');
  app.style.setProperty('--shake', `${(3 + 6 * intensity).toFixed(1)}px`);
  app.classList.remove('shaking');
  void app.offsetWidth; // restart the animation
  app.classList.add('shaking');
  onAnimationDone(app, 'screen-shake', () => app.classList.remove('shaking'));
}

export function flashBest(el) {
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
  onAnimationDone(el, 'best-pop', () => el.classList.remove('flash'));
}

/** Counts a number up to `to`; decreases (a reset) apply immediately. */
export function animateCount(el, to, duration = TIMING.scoreCountMs) {
  cancelAnimationFrame(el._raf);
  const from = el._shown ?? 0;
  if (to <= from) {
    el.textContent = el._shown = to;
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) * (1 - t);
    el._shown = Math.round(from + (to - from) * eased);
    el.textContent = el._shown;
    if (t < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

/** Average center point of the elements, in screen coordinates. */
export function centerOf(elements) {
  let x = 0;
  let y = 0;
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    x += r.left + r.width / 2;
    y += r.top + r.height / 2;
  }
  return { x: x / elements.length, y: y / elements.length };
}

/** Text that floats upward from (x, y), e.g. "+40". */
export function floatText(text, x, y) {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

/** Large text near the top of the screen, e.g. the combo banner. */
export function showBanner(text, { className = '', top = '28%' } = {}) {
  const el = document.createElement('div');
  el.className = `banner ${className}`;
  el.textContent = text;
  el.style.top = top;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

const CONFETTI_COLORS = ['#ff4d6d', '#ff9f1c', '#ffd93d', '#4ade80', '#22d3ee', '#4d8bff', '#b86bff'];

/** A small confetti burst inside `container`. */
export function confetti(container, count = 40) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('i');
    el.className = 'confetti';
    el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    el.style.setProperty('--dx', `${(Math.random() - 0.5) * 320}px`);
    el.style.setProperty('--dy', `${-40 + Math.random() * 260}px`);
    el.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    el.style.animationDelay = `${Math.random() * 150}ms`;
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}
