// Small DOM helpers shared by the UI: element builder, icons, piece previews, switch.

/** Builds an element: el('div', { class: 'x', onClick: fn }, ...children) */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style') node.style.cssText = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

const svg = (path) =>
  new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ico" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`,
    'image/svg+xml',
  ).documentElement;

export const icons = {
  back: () => svg('<path d="M15 5l-7 7 7 7"/>'),
};

const PREVIEW_FALLBACK_COLOR = 'var(--blk-blue)';

/** A piece drawn with the in-game block look. Without `cellPx` it uses the tray slot size. */
export function pieceEl(shape, color, cellPx = null) {
  const p = el('div', { class: 'piece' });
  p.style.setProperty('--cols', shape[0].length);
  p.style.setProperty('--rows', shape.length);
  if (cellPx) p.style.setProperty('--cell', `${cellPx}px`);
  for (const row of shape) {
    for (const v of row) {
      const cell = v ? el('div', { class: 'cell filled' }) : el('div');
      if (v) cell.style.setProperty('--block-color', color ?? PREVIEW_FALLBACK_COLOR);
      p.append(cell);
    }
  }
  return p;
}

/** Toggle-switch indicator; the surrounding button carries aria-checked. */
export const switchEl = () => el('span', { class: 'switch' }, el('i'));
