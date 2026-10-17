// Draws the three-slot piece tray.
import { canPieceFitAnywhere } from '../core/game-over.js';

function createPieceElement(piece) {
  const el = document.createElement('div');
  el.className = 'piece';
  el.dataset.pieceId = piece.id;
  el.style.setProperty('--cols', piece.shape[0].length);
  el.style.setProperty('--rows', piece.shape.length);

  for (const row of piece.shape) {
    for (const v of row) {
      const block = document.createElement('div');
      if (v) {
        block.className = 'cell filled';
        block.style.setProperty('--block-color', piece.color);
      }
      el.appendChild(block);
    }
  }
  return el;
}

export function renderTray(container, pieces, board) {
  container.innerHTML = '';
  pieces.forEach((piece, i) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.slot = i;
    if (piece) {
      slot.appendChild(createPieceElement(piece));
      // A piece that fits nowhere is dimmed and cannot be dragged
      if (!canPieceFitAnywhere(board, piece.shape)) slot.classList.add('unfit');
    }
    container.appendChild(slot);
  });
}
