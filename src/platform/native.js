// Android (Capacitor) integration: back button and app foreground/background. No-op on the web.
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * @param {object} opts
 * @param {() => boolean} opts.onBack closes an open menu, screen or dialog and returns true if it did
 * @param {() => void} opts.onPause app moved to the background
 * @param {() => void} opts.onResume app returned to the foreground
 */
export function initNative({ onBack, onPause, onResume }) {
  if (!Capacitor.isNativePlatform()) return;

  // Nothing left to close: minimize instead of exiting so the game stays resumable
  App.addListener('backButton', () => {
    if (!onBack()) App.minimizeApp();
  });

  App.addListener('appStateChange', ({ isActive }) => (isActive ? onResume() : onPause()));
}
