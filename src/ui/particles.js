// Line-clear particles on a single canvas layer, capped at MAX_PARTICLES.
// The animation loop runs only while particles exist.
import { reducedMotion } from './effects.js';

const MAX_PARTICLES = 150;
const GRAVITY = 900; // px/s²

let canvas = null;
let ctx = null;
let dpr = 1;
let particles = [];
let running = false;
let last = 0;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
}

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

/** The cell's resolved block color; falls back to white while it is still a var(...) reference. */
function colorOf(cell) {
  const c = getComputedStyle(cell).getPropertyValue('--block-color').trim();
  return !c || c.startsWith('var(') ? '#ffffff' : c;
}

/** Sprays particles from the cleared cells, each starting with its cell's clear delay. */
export function burst(cells) {
  if (reducedMotion() || cells.length === 0) return;
  ensureCanvas();

  const perCell = Math.max(1, Math.min(4, Math.floor(MAX_PARTICLES / cells.length)));
  const now = performance.now();

  for (const cell of cells) {
    const rect = cell.getBoundingClientRect();
    const color = colorOf(cell);
    const delay = parseFloat(cell.style.getPropertyValue('--delay')) || 0;
    for (let i = 0; i < perCell; i++) {
      if (particles.length >= MAX_PARTICLES) break;
      particles.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        vx: (Math.random() - 0.5) * 320,
        vy: -60 - Math.random() * 260,
        size: rect.width * (0.12 + Math.random() * 0.12),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 12,
        life: 0.6 + Math.random() * 0.4,
        t0: now + delay + 100, // starts as the cell begins to shrink
        color,
      });
    }
  }

  if (!running) {
    running = true;
    last = now;
    requestAnimationFrame(tick);
  }
}

function tick(now) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  particles = particles.filter((p) => {
    if (now < p.t0) return true;
    const age = (now - p.t0) / 1000;
    if (age > p.life) return false;

    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;

    ctx.globalAlpha = 1 - age / p.life;
    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
    return true;
  });

  if (particles.length > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}
