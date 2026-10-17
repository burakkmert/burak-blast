// The custom block photo, stored as a small JPEG data URL.
import { readString, removeItem, STORAGE_KEYS, writeString } from './storage.js';

/** The stored photo data URL, or null when none or not an image. */
export function loadPhoto() {
  const saved = readString(STORAGE_KEYS.photo);
  return saved?.startsWith('data:image/') ? saved : null;
}

/** @returns {boolean} false when the device storage is full or unavailable */
export function storePhoto(dataUrl) {
  return writeString(STORAGE_KEYS.photo, dataUrl);
}

export function clearPhoto() {
  removeItem(STORAGE_KEYS.photo);
}
