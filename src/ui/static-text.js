// Fills the texts of index.html from strings.js.
// data-text sets text content, data-aria-label and data-title set those attributes; values are keys like "menu.title".
import { STRINGS } from './strings.js';

const lookup = (path) => path.split('.').reduce((node, key) => node?.[key], STRINGS);

export function applyStaticText() {
  for (const node of document.querySelectorAll('[data-text]')) node.textContent = lookup(node.dataset.text);
  for (const node of document.querySelectorAll('[data-aria-label]'))
    node.setAttribute('aria-label', lookup(node.dataset.ariaLabel));
  for (const node of document.querySelectorAll('[data-title]')) node.title = lookup(node.dataset.title);
}
