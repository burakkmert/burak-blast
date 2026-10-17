// Block themes. The theme is selected with <html data-theme="...">; block looks derive from the
// --t-* variables in styles/themes.css, so the board, tray, ghost and previews all follow it.
// The photo theme shows one blob URL (--photo) as a CSS background on every block.
import { PHOTO_TONE_MAX } from '../config.js';
import { clearPhoto, loadPhoto, storePhoto } from '../state/photo-store.js';
import { setSetting, settings } from '../state/settings.js';
import { STRINGS } from './strings.js';

const root = document.documentElement;

export const THEMES = ['jelly', 'flat', 'neon', 'pastel', 'photo'].map((id) => ({
  id,
  name: STRINGS.appearance.themes[id],
}));

let photoData = null; // stored data URL
let photoBlobUrl = null; // URL used on screen

export const hasPhoto = () => !!photoData;

export const currentTheme = () => root.dataset.theme || 'jelly';

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Points the --photo CSS variable at the image (null removes it). */
function setPhotoVar(dataUrl) {
  if (photoBlobUrl) URL.revokeObjectURL(photoBlobUrl);
  photoBlobUrl = null;
  if (!dataUrl) {
    root.style.removeProperty('--photo');
    return;
  }
  photoBlobUrl = URL.createObjectURL(dataUrlToBlob(dataUrl));
  root.style.setProperty('--photo', `url("${photoBlobUrl}")`);
}

function applyTheme() {
  let id = settings.theme;
  if (!THEMES.some((t) => t.id === id) || (id === 'photo' && !photoData)) id = 'jelly';
  root.dataset.theme = id;
}

/** Loads the stored photo and applies the saved theme. */
export function initTheme() {
  const saved = loadPhoto();
  if (saved) {
    try {
      setPhotoVar(saved);
      photoData = saved;
    } catch {
      // corrupt data URL: continue without a photo
      photoData = null;
      setPhotoVar(null);
    }
  }
  root.style.setProperty('--photo-tone', Math.min(PHOTO_TONE_MAX, settings.photoTone));
  applyTheme();
}

/** Switches theme; the photo theme needs a photo. @returns {boolean} whether the theme was applied */
export function setTheme(id) {
  if (id === 'photo' && !photoData) return false;
  setSetting('theme', id);
  applyTheme();
  return true;
}

/** Strength of the color tint derived from each piece's color (0 is none). */
export function setPhotoTone(value) {
  const v = Math.min(PHOTO_TONE_MAX, Math.max(0, Number(value) || 0));
  setSetting('photoTone', v);
  root.style.setProperty('--photo-tone', v);
}

/** @returns {boolean} false when storage is full or unavailable; nothing changes then */
export function savePhoto(dataUrl) {
  if (!storePhoto(dataUrl)) return false;
  photoData = dataUrl;
  setPhotoVar(dataUrl);
  return true;
}

/** Removes the photo and falls back to the jelly theme if it was active. */
export function removePhoto() {
  clearPhoto();
  photoData = null;
  setPhotoVar(null);
  if (settings.theme === 'photo') setSetting('theme', 'jelly');
  applyTheme();
}

/** Mirrors settings onto the document (the reduce-motion class). */
export function applySettings() {
  root.classList.toggle('reduce-motion', settings.reduceMotion);
}
