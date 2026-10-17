// Generates the Android launcher icons.
//   node scripts/icons.mjs public       generic icon from assets/, clears icon-private/.active
//   node scripts/icons.mjs private      icon from icon-private/icon.png, creates icon-private/.active
//   node scripts/icons.mjs make-public  redraws the generic icon sources in assets/
//
// icon-private/ is git-ignored. While icon-private/.active exists, the generated files under
// android/app/src/main/res contain the private icon: run "public" before committing.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const PUBLIC_DIR = join(ROOT, 'assets');
const PRIVATE_DIR = join(ROOT, 'icon-private');
const PRIVATE_BUILD = join(PRIVATE_DIR, 'build');
const ACTIVE = join(PRIVATE_DIR, '.active');

const SIZE = 1024;
const BG_TOP = '#2b1a66';
const BG_BOTTOM = '#0e0c26';

// ---------- Drawings ----------
const BG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="${BG_TOP}"/><stop offset="1" stop-color="${BG_BOTTOM}"/>
  </linearGradient></defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
</svg>`;

/** A jelly block, simplified from the in-game look. */
function block(x, y, s, color, light, dark) {
  const r = s * 0.2;
  const id = `b${x}_${y}`;
  return `
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${light}"/><stop offset="0.35" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/>
  </linearGradient></defs>
  <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="url(#${id})"/>
  <rect x="${x + s * 0.04}" y="${y + s * 0.04}" width="${s * 0.92}" height="${s * 0.92}" rx="${r * 0.85}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="${s * 0.03}"/>
  <ellipse cx="${x + s * 0.32}" cy="${y + s * 0.24}" rx="${s * 0.18}" ry="${s * 0.09}" fill="rgba(255,255,255,0.5)"/>`;
}

/** Three colored blocks in an L layout, `span` px wide, centered on the canvas. */
function blocksSvg(span, withBackground) {
  const gap = span * 0.04;
  const s = (span - gap) / 2;
  const x0 = (SIZE - span) / 2;
  const y0 = (SIZE - span) / 2;
  const shapes =
    block(x0, y0, s, '#ff5d73', '#ff9fae', '#c23352') +
    block(x0 + s + gap, y0, s, '#ffd23f', '#ffeb9a', '#c99a00') +
    block(x0, y0 + s + gap, s, '#28c8e0', '#8cecf8', '#118aa0');
  const background = withBackground ? BG_SVG.replace(/<\/?svg[^>]*>/g, '') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">${background}${shapes}</svg>`;
}

const png = (svg) => sharp(Buffer.from(svg)).png();

async function writeSet(dir, { only, foreground, background }) {
  mkdirSync(dir, { recursive: true });
  await only.toFile(join(dir, 'icon-only.png'));
  await foreground.toFile(join(dir, 'icon-foreground.png'));
  await background.toFile(join(dir, 'icon-background.png'));
}

// ---------- Generic icon ----------
async function makePublic() {
  await writeSet(PUBLIC_DIR, {
    only: png(blocksSvg(600, true)), // full icon for old devices
    foreground: png(blocksSvg(520, false)), // adaptive icon: inside the safe zone (about 66% of the canvas)
    background: png(BG_SVG),
  });
  console.log('Wrote the generic icon sources to assets/.');
}

// ---------- Private icon ----------
async function makePrivate() {
  const src = join(PRIVATE_DIR, 'icon.png');
  if (!existsSync(src)) throw new Error('icon-private/icon.png not found.');

  const circle = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><circle cx="320" cy="320" r="320"/></svg>`,
  );
  // Adaptive foreground: circular crop centered on a transparent canvas (about 62%, so the mask does not cut it)
  const face = await sharp(src)
    .resize(640, 640, { fit: 'cover' })
    .composite([{ input: circle, blend: 'dest-in' }])
    .png()
    .toBuffer();
  const foreground = sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: face, left: 192, top: 192 }])
    .png();

  await writeSet(PRIVATE_BUILD, {
    only: sharp(src).resize(SIZE, SIZE, { fit: 'cover' }).png(), // old devices: full square image
    foreground,
    background: png(BG_SVG),
  });
}

// ---------- Capacitor Assets ----------
const LAUNCHER = join(ROOT, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png');

/** capacitor-assets exits 0 even on failure, so check that the launcher file was actually rewritten. */
function generate(dir) {
  const started = Date.now() - 1000;
  const rel = relative(ROOT, dir).split(sep).join('/'); // the CLI expects a path relative to the project root
  execSync(`npx capacitor-assets generate --android --assetPath "${rel}" --iconBackgroundColor "${BG_TOP}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (!existsSync(LAUNCHER) || statSync(LAUNCHER).mtimeMs < started) {
    throw new Error('Android icons were not generated (see the capacitor-assets output).');
  }
}

const mode = process.argv[2];
if (mode === 'make-public') {
  await makePublic();
} else if (mode === 'public') {
  if (!existsSync(join(PUBLIC_DIR, 'icon-only.png'))) await makePublic();
  generate(PUBLIC_DIR);
  rmSync(ACTIVE, { force: true });
  console.log('Generic icon is active. Safe to commit.');
} else if (mode === 'private') {
  await makePrivate();
  generate(PRIVATE_BUILD);
  writeFileSync(
    ACTIVE,
    'The private icon is written to android/app/src/main/res. Run "npm run icon:public" before committing.\n',
  );
  console.log('Private icon is active. Run "npm run icon:public" before committing.');
} else {
  console.error('Usage: node scripts/icons.mjs <public|private|make-public>');
  process.exit(1);
}
