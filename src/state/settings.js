// User settings: a single object persisted through the storage module.
import { PHOTO_TONE_MAX, SETTINGS_DEFAULTS } from '../config.js';
import { readJson, STORAGE_KEYS, writeJson } from './storage.js';

const defaults = () => ({
  ...SETTINGS_DEFAULTS,
  reduceMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
});

function load() {
  const s = defaults();
  const saved = readJson(STORAGE_KEYS.settings);
  if (saved && typeof saved === 'object') {
    // Only accept known keys whose type matches the default
    for (const k of Object.keys(s)) if (typeof saved[k] === typeof s[k]) s[k] = saved[k];
    s.volume = Math.min(100, Math.max(0, s.volume));
    s.photoTone = Math.min(PHOTO_TONE_MAX, Math.max(0, s.photoTone));
  }
  return s;
}

export const settings = load();

const listeners = [];

/** Calls `fn` after every settings change. */
export function onSettingsChange(fn) {
  listeners.push(fn);
}

export function setSetting(key, value) {
  settings[key] = value;
  writeJson(STORAGE_KEYS.settings, settings);
  for (const fn of listeners) fn();
}
