// Tunable constants. The core layer never imports this file; callers pass values in.

/** Shows the developer panel. Keep false: the panel is excluded from production builds. */
export const DEV_MODE = false;

export const TRAY_SLOTS = 3;

export const SCORING = {
  cellPoints: 1,
  linePoints: 10, // lines score linePoints * n * n for n simultaneous lines
  comboStep: 0.5, // each combo level adds this to the line multiplier
  comboGrace: 3, // consecutive moves without a clear before the combo resets
  boardClearBonus: 300,
};

export const FAIR_SPAWN = {
  enabledByDefault: true, // new pieces always include one that fits
  attempts: 20,
};

export const PHOTO_TONE_MAX = 70;

export const SETTINGS_DEFAULTS = {
  sound: true,
  vibration: true,
  volume: 70, // 0..100
  fairSpawn: FAIR_SPAWN.enabledByDefault,
  theme: 'jelly',
  photoTone: 40, // 0..PHOTO_TONE_MAX; matches --photo-tone-ref in styles/tokens.css
};

/** CSS variables from styles/tokens.css, so saved games stay independent of the theme. */
export const BLOCK_COLORS = [
  'var(--blk-red)',
  'var(--blk-orange)',
  'var(--blk-yellow)',
  'var(--blk-green)',
  'var(--blk-aqua)',
  'var(--blk-blue)',
  'var(--blk-violet)',
];

/** Milliseconds. Entries that name a CSS token must match it. */
export const TIMING = {
  clearMs: 300, // --dur-clear
  clearStepMs: 25,
  gameOverMs: 600,
  gameOverCellMs: 180, // --dur-gameover
  gameOverPanelDelayMs: 100,
  gameOverCountMs: 900,
  scoreCountMs: 500,
  dragGrowMs: 150, // --dur-grow
  dragReturnMs: 200, // --dur-return
  toastMs: 2400,
};

export const DRAG = {
  liftScale: 1.07, // a held piece is slightly larger than a board cell
  liftCells: 1.5, // how many cells above the finger the piece sits
};

export const PHOTO = {
  outputPx: 256,
  jpegQuality: 0.85,
  maxZoom: 4, // multiple of the minimum scale
};
