// Hamburger drawer menu and its entries. While the menu, a screen or a dialog is open the game is paused.
import {
  confirmDialog,
  dismissDialog,
  hasScreens,
  isDialogOpen,
  popScreen,
  setMenuOpen,
  setOnScreensEmpty,
} from './overlays.js';
import { STRINGS } from './strings.js';
import { openAppearance } from './screens/appearance.js';
import { openBlocks } from './screens/blocks.js';
import { openAbout, openHowTo } from './screens/info.js';
import { openSettings } from './screens/settings.js';
import { version } from '../../package.json';

const drawer = document.getElementById('menu');
const backdrop = document.getElementById('menu-backdrop');
const menuBtn = document.getElementById('menu-btn');
let reopenMenu = false; // a screen opened from the menu returns to it when closed

function openMenu() {
  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.removeAttribute('inert');
  menuBtn.classList.add('is-open'); // hamburger turns into a cross
  menuBtn.setAttribute('aria-expanded', 'true');
  setMenuOpen(true);
}

function closeMenu() {
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('inert', '');
  menuBtn.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  setMenuOpen(false);
}

/**
 * Back action for the Android back button and Escape: closes a dialog, else the top screen, else the menu.
 * @returns {boolean} whether something was closed
 */
export function goBack() {
  if (isDialogOpen()) return (dismissDialog(), true);
  if (hasScreens()) return (popScreen(), true);
  if (drawer.classList.contains('open')) return (closeMenu(), true);
  return false;
}

function openFromMenu(open) {
  reopenMenu = true;
  closeMenu();
  open();
}

/** @param {{onNewGame: () => void}} opts */
export function initMenu({ onNewGame }) {
  document.getElementById('menu-version').textContent = `v${version}`;
  drawer.setAttribute('inert', '');

  menuBtn.addEventListener('click', openMenu);
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  backdrop.addEventListener('click', closeMenu);

  setOnScreensEmpty(() => {
    if (reopenMenu) openMenu();
  });

  const actions = {
    resume: closeMenu,
    newgame: async () => {
      const ok = await confirmDialog(STRINGS.menu.confirmNewGame, { okText: STRINGS.menu.newGame });
      if (!ok) return;
      closeMenu();
      onNewGame();
    },
    blocks: () => openFromMenu(openBlocks),
    appearance: () => openFromMenu(openAppearance),
    settings: () => openFromMenu(openSettings),
    howto: () => openFromMenu(openHowTo),
    about: () => openFromMenu(openAbout),
  };
  drawer.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => actions[btn.dataset.action]?.());
  });

  // Escape behaves like the Android back button
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') goBack();
  });
}
