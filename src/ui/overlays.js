// Layers above the game: dialogs, toasts and the full-screen panel stack.
import { TIMING } from '../config.js';
import { el, icons } from './dom.js';
import { STRINGS } from './strings.js';

const dialogEl = document.getElementById('dialog');
const screensEl = document.getElementById('screens');
const screens = [];
let menuOpen = false;
let onScreensEmpty = null;

export const setMenuOpen = (open) => (menuOpen = open);

/** The menu, a screen or a dialog is open: the game is paused and dragging is blocked. */
export const isOverlayOpen = () => menuOpen || screens.length > 0 || !dialogEl.hidden;

// ---------- Dialogs ----------
function showDialog(message, buttons) {
  dialogEl.replaceChildren(
    el(
      'div',
      { class: 'panel dialog-panel', role: 'alertdialog' },
      el('p', { class: 'dialog-msg', text: message }),
      el('div', { class: 'dialog-actions' }, buttons),
    ),
  );
  dialogEl.hidden = false;
}

/** In-page replacement for confirm(). Resolves to true when confirmed. */
export function confirmDialog(message, { okText = STRINGS.common.yes, cancelText = STRINGS.common.cancel } = {}) {
  return new Promise((resolve) => {
    const done = (value) => {
      dialogEl.hidden = true;
      resolve(value);
    };
    showDialog(message, [
      el('button', { class: 'btn btn-ghost', type: 'button', onClick: () => done(false) }, cancelText),
      el('button', { class: 'btn', type: 'button', onClick: () => done(true) }, okText),
    ]);
  });
}

export function alertDialog(message, okText = STRINGS.common.ok) {
  return new Promise((resolve) => {
    showDialog(message, [
      el(
        'button',
        {
          class: 'btn',
          type: 'button',
          onClick: () => {
            dialogEl.hidden = true;
            resolve();
          },
        },
        okText,
      ),
    ]);
  });
}

export const isDialogOpen = () => !dialogEl.hidden;

/** Closes the open dialog as if its first button (cancel, or OK for alerts) was pressed. */
export function dismissDialog() {
  dialogEl.querySelector('.btn')?.click();
}

// ---------- Toast ----------
export function toast(message) {
  const t = el('div', { class: 'toast', role: 'status', text: message });
  document.body.append(t);
  setTimeout(() => t.remove(), TIMING.toastMs);
}

// ---------- Screen stack ----------

/** Called when the last screen closes. */
export const setOnScreensEmpty = (fn) => (onScreensEmpty = fn);

export const hasScreens = () => screens.length > 0;

/**
 * Opens a full-screen panel. `build(body, api)` may return { onResume, onClose }:
 * onResume runs when a screen above this one closes, onClose when this one is removed.
 */
export function pushScreen(title, build) {
  const body = el('div', { class: 'screen-body' });
  const screen = el(
    'section',
    { class: 'screen' },
    el(
      'header',
      { class: 'screen-head' },
      el(
        'button',
        { class: 'icon-btn', type: 'button', 'aria-label': STRINGS.common.back, onClick: popScreen },
        icons.back(),
      ),
      el('h2', { class: 'screen-title', text: title }),
    ),
    body,
  );
  const entry = { screen, ...(build(body, { pop: popScreen }) ?? {}) };

  screens.at(-1)?.screen.setAttribute('hidden', '');
  screensEl.append(screen);
  screens.push(entry);
}

export function popScreen() {
  const entry = screens.pop();
  if (!entry) return;
  entry.screen.remove();
  entry.onClose?.();
  const top = screens.at(-1);
  if (top) {
    top.screen.hidden = false;
    top.onResume?.();
  } else {
    onScreensEmpty?.();
  }
}
