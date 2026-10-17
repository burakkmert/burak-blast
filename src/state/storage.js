// The only module that touches localStorage. Every access is guarded: storage may be
// unavailable, full or corrupt, and the game must keep working.

export const STORAGE_KEYS = {
  settings: 'burakblast.settings',
  save: 'burakblast.save',
  best: 'burakblast.best',
  pieces: 'burakblast.pieces',
  photo: 'burakblast.photo',
};

export function readString(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** @returns {boolean} false when the value could not be stored */
export function writeString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // nothing to clean up if storage is unavailable
  }
}

/** Parsed JSON, or null when the key is missing or the content is corrupt. */
export function readJson(key) {
  const raw = readString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @returns {boolean} false when the value could not be stored */
export function writeJson(key, value) {
  return writeString(key, JSON.stringify(value));
}
