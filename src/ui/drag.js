// Drag and drop for tray pieces (Pointer Events: mouse and touch share one code path).
//
// Performance rules, because this runs on every finger move:
//  - all geometry is measured once when the drag starts, never in pointermove
//  - the ghost moves with translate3d only, applied once per frame from the latest pointer position
//  - the preview callback fires only when the target cell changes
import { DRAG, TIMING } from '../config.js';
import { BOARD_SIZE, getDropCell } from '../core/board.js';

/**
 * @param {object} opts
 * @param {HTMLElement} opts.boardEl
 * @param {HTMLElement} opts.trayEl
 * @param {() => Array} opts.getPieces current tray pieces (null for an empty slot)
 * @param {() => void} [opts.onPickUp] called when a piece is picked up
 * @param {() => boolean} [opts.isBlocked] true while dragging must not start (animations, open menu)
 * @param {(piece, cell: {row:number, col:number}|null) => void} opts.onPreview
 *        called when the piece's top-left cell changes, and with (piece, null) when the drag ends
 * @param {(piece, cell: {row:number, col:number}|null, slotIndex: number) => boolean} opts.onDrop
 *        the single place a drop is resolved; returns true if the piece was placed, false to send it back
 */
export function initDrag({
  boardEl,
  trayEl,
  getPieces,
  onPreview,
  onDrop,
  onPickUp = () => {},
  isBlocked = () => false,
}) {
  let activePointerId = null;
  let drag = null;

  // Block the long-press menu and native image dragging
  trayEl.addEventListener('contextmenu', (e) => e.preventDefault());
  trayEl.addEventListener('dragstart', (e) => e.preventDefault());

  trayEl.addEventListener('pointerdown', (e) => {
    if (activePointerId !== null || isBlocked()) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const slot = e.target.closest('.slot');
    const pieceEl = slot?.querySelector('.piece');
    if (!pieceEl || slot.classList.contains('unfit') || pieceEl.classList.contains('dragging')) return;

    e.preventDefault();
    activePointerId = e.pointerId;
    startDrag(e, slot, pieceEl);
  });

  function startDrag(e, slot, pieceEl) {
    // Measured per drag: the window may have been resized since the last one
    const boardRect = boardEl.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(boardEl).columnGap) || 0;
    const cellSize = (boardRect.width - (BOARD_SIZE + 1) * gap) / BOARD_SIZE;
    const slotIndex = Number(slot.dataset.slot);

    // The ghost is a fixed-position copy sized like a board piece
    const ghost = document.createElement('div');
    ghost.className = 'ghost';
    const clone = pieceEl.cloneNode(true);
    clone.style.setProperty('--cell', `${cellSize}px`);
    ghost.appendChild(clone);
    document.body.appendChild(ghost);

    const w = ghost.offsetWidth; // layout size, unaffected by scale
    const h = ghost.offsetHeight;
    const startScale = pieceEl.getBoundingClientRect().width / w;
    clone.style.transform = `scale(${startScale})`;

    drag = {
      pointerId: e.pointerId,
      slotIndex,
      piece: getPieces()[slotIndex],
      pieceEl,
      ghost,
      clone,
      startScale,
      boardRect,
      gap,
      cellSize,
      w,
      h,
      x: e.clientX,
      y: e.clientY,
      left: 0,
      top: 0,
      cell: null,
      cellKey: undefined,
      raf: 0,
    };

    pieceEl.classList.add('dragging');
    document.body.classList.add('dragging'); // lets CSS drop heavy effects while dragging
    onPickUp();
    slot.setPointerCapture?.(e.pointerId);

    updateGhost();
    // The grow animation runs on the inner clone so the ghost itself never has a transition
    clone.getBoundingClientRect();
    clone.style.transition = `transform ${TIMING.dragGrowMs}ms var(--ease-spring)`;
    clone.style.transform = `scale(${DRAG.liftScale})`;

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function updateGhost() {
    const d = drag;
    // Centered on the finger horizontally, liftCells above it vertically (bottom edge as reference)
    d.left = d.x - d.w / 2;
    d.top = d.y - DRAG.liftCells * d.cellSize - d.h;
    d.ghost.style.transform = `translate3d(${d.left}px, ${d.top}px, 0)`;

    // Preview and drop share this value, so what is shown is what is placed
    d.cell = getDropCell({ left: d.left, top: d.top }, d.boardRect, d.gap, d.cellSize);
    const key = d.cell ? `${d.cell.row},${d.cell.col}` : 'out';
    if (key !== d.cellKey) {
      d.cellKey = key;
      onPreview(d.piece, d.cell);
    }
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (!drag.raf) {
      drag.raf = requestAnimationFrame(() => {
        if (!drag) return;
        drag.raf = 0;
        updateGhost();
      });
    }
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    // Apply the pending frame so the drop cell matches the last preview
    if (d.raf) {
      cancelAnimationFrame(d.raf);
      d.raf = 0;
      updateGhost();
    }

    finish();
    const placed = onDrop(d.piece, d.cell, d.slotIndex);
    if (placed) d.ghost.remove();
    else returnToSlot(d, true);
  }

  function onCancel(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    finish();
    returnToSlot(d, false);
  }

  function finish() {
    cancelAnimationFrame(drag.raf);
    document.body.classList.remove('dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    onPreview(drag.piece, null);
    activePointerId = null;
    drag = null;
  }

  /** Flies the ghost back over the original piece while shrinking, then removes it. */
  function returnToSlot(d, shake) {
    const r = d.pieceEl.getBoundingClientRect();
    const tx = r.left + r.width / 2 - d.w / 2;
    const ty = r.top + r.height / 2 - d.h / 2;

    d.ghost.style.transition = `transform ${TIMING.dragReturnMs}ms ease-out`;
    d.clone.style.transition = `transform ${TIMING.dragReturnMs}ms ease-out`;
    d.ghost.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    d.clone.style.transform = `scale(${d.startScale})`;

    setTimeout(() => {
      d.ghost.remove();
      d.pieceEl.classList.remove('dragging');
      if (shake) {
        d.pieceEl.classList.add('shake');
        d.pieceEl.addEventListener('animationend', () => d.pieceEl.classList.remove('shake'), { once: true });
      }
    }, TIMING.dragReturnMs + 20);
  }
}
