// Piece editor: 5x5 drawing grid, color, name, frequency and a live preview.
import { BLOCK_COLORS } from '../../config.js';
import { isConnected, MAX_PIECE_SIZE, trimShape } from '../../core/shapes.js';
import { addCustom, findDuplicate, getAll, updateCustom, WEIGHTS } from '../../state/piece-store.js';
import { el, pieceEl } from '../dom.js';
import { pushScreen, toast } from '../overlays.js';
import { STRINGS, pieceName } from '../strings.js';
import { RARITY } from './rarity.js';

const N = MAX_PIECE_SIZE;
const S = STRINGS.editor;

/** First "My Block N" name that is not taken. */
function autoName() {
  const used = new Set(getAll().map((p) => p.name));
  let k = 1;
  while (used.has(S.defaultName(k))) k++;
  return S.defaultName(k);
}

/** @param {{piece?: object|null}} opts the custom piece to edit; omit to create a new one */
export function openEditor({ piece = null } = {}) {
  pushScreen(piece ? S.titleEdit : S.titleNew, (body, api) => {
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    if (piece) piece.shape.forEach((row, r) => row.forEach((v, c) => (grid[r][c] = v)));
    let color = piece?.color ?? BLOCK_COLORS[0];
    let weight = piece?.weight ?? WEIGHTS.normal;
    let name = piece?.name ?? '';

    // ---- Drawing grid ----
    const gridEl = el('div', { class: 'ed-grid', role: 'group', 'aria-label': S.gridLabel });
    const cells = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = el('div', { class: 'cell' });
        cells.push(cell);
        gridEl.append(cell);
      }
    }

    // Dragging paints or erases, depending on the state of the first cell touched
    let mode = null;
    let activePointer = null;
    const cellAt = (e) => {
      const rect = gridEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x < 0 || x >= 1 || y < 0 || y >= 1) return null;
      return [Math.floor(y * N), Math.floor(x * N)];
    };
    const paint = (e) => {
      const rc = cellAt(e);
      if (!rc || grid[rc[0]][rc[1]] === mode) return;
      grid[rc[0]][rc[1]] = mode;
      update();
    };
    gridEl.addEventListener('pointerdown', (e) => {
      if (activePointer !== null) return;
      const rc = cellAt(e);
      if (!rc) return;
      e.preventDefault();
      activePointer = e.pointerId;
      gridEl.setPointerCapture?.(e.pointerId);
      mode = grid[rc[0]][rc[1]] ? 0 : 1;
      paint(e);
    });
    gridEl.addEventListener('pointermove', (e) => {
      if (e.pointerId === activePointer) paint(e);
    });
    const endPaint = (e) => {
      if (e.pointerId === activePointer) activePointer = null;
    };
    gridEl.addEventListener('pointerup', endPaint);
    gridEl.addEventListener('pointercancel', endPaint);

    // ---- Tools ----
    const setGrid = (fn) => {
      const next = fn(grid.map((r) => r.slice()));
      next.forEach((row, r) => row.forEach((v, c) => (grid[r][c] = v)));
      update();
    };
    const tools = el(
      'div',
      { class: 'ed-tools' },
      el(
        'button',
        { class: 'btn btn-ghost', type: 'button', onClick: () => setGrid((g) => g.map((r) => r.map(() => 0))) },
        S.clear,
      ),
      el(
        'button',
        {
          class: 'btn btn-ghost',
          type: 'button',
          onClick: () => setGrid((g) => g.map((_, r) => g.map((__, c) => g[N - 1 - c][r]))),
        },
        S.rotate,
      ),
      el(
        'button',
        { class: 'btn btn-ghost', type: 'button', onClick: () => setGrid((g) => g.map((r) => r.slice().reverse())) },
        S.flip,
      ),
    );

    // ---- Color picker ----
    const swatches = BLOCK_COLORS.map((c) => {
      const swatch = el('button', {
        class: 'swatch cell filled',
        type: 'button',
        'aria-label': S.pickColor,
        onClick: () => {
          color = c;
          update();
        },
      });
      swatch.style.setProperty('--block-color', c);
      return swatch;
    });

    // ---- Name and frequency ----
    const nameInput = el('input', {
      class: 'text-input',
      type: 'text',
      maxlength: '20',
      placeholder: autoName(),
      value: name,
      'aria-label': S.nameAria,
      onInput: (e) => (name = e.target.value),
    });
    const segBtns = RARITY.map(([label, w]) =>
      el(
        'button',
        {
          class: 'seg-btn',
          type: 'button',
          onClick: () => {
            weight = w;
            update();
          },
        },
        label,
      ),
    );

    // ---- Preview and validation ----
    const previewBox = el('div', { class: 'slot ed-preview' });
    const hint = el('p', { class: 'hint' });
    const saveBtn = el('button', { class: 'btn', type: 'button', onClick: save }, STRINGS.common.save);
    const cancelBtn = el('button', { class: 'btn btn-ghost', type: 'button', onClick: api.pop }, STRINGS.common.cancel);

    /** The reason the shape cannot be saved, or null. */
    function validate(trimmed) {
      if (!trimmed) return S.errors.empty;
      if (!isConnected(trimmed)) return S.errors.disconnected;
      const dup = findDuplicate(trimmed, piece?.id);
      if (dup) return S.errors.duplicate(pieceName(dup));
      return null;
    }

    function update() {
      cells.forEach((cell, i) => {
        const on = !!grid[Math.floor(i / N)][i % N];
        cell.classList.toggle('filled', on);
        cell.style.setProperty('--block-color', on ? color : 'transparent');
      });
      swatches.forEach((s, i) => s.setAttribute('aria-pressed', String(BLOCK_COLORS[i] === color)));
      segBtns.forEach((b, i) => b.classList.toggle('on', RARITY[i][1] === weight));

      const trimmed = trimShape(grid);
      previewBox.replaceChildren(
        trimmed ? pieceEl(trimmed, color) : el('span', { class: 'hint', text: S.previewEmpty }),
      );

      const error = validate(trimmed);
      saveBtn.disabled = !!error;
      hint.textContent = error ?? S.ready;
      hint.classList.toggle('error', !!error);
    }

    function save() {
      const trimmed = trimShape(grid);
      if (validate(trimmed)) return;
      const data = { name: name.trim() || autoName(), shape: trimmed, color, weight };
      if (piece) updateCustom(piece.id, data);
      else addCustom(data);
      toast(piece ? S.updated : S.added);
      api.pop();
    }

    body.append(
      el(
        'div',
        { class: 'ed' },
        el('p', { class: 'hint', text: S.hint }),
        gridEl,
        tools,
        el('div', { class: 'swatches' }, swatches),
        el('label', { class: 'field' }, el('span', { text: S.nameLabel }), nameInput),
        el('div', { class: 'field' }, el('span', { text: S.frequency }), el('div', { class: 'seg' }, segBtns)),
        el('div', { class: 'field' }, el('span', { text: S.preview }), previewBox),
        hint,
        el('div', { class: 'ed-actions' }, cancelBtn, saveBtn),
      ),
    );
    update();
  });
}
