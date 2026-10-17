// "My Blocks" screen: every piece as a small card with enable, frequency, edit and delete controls.
import {
  deleteCustom,
  enabledCount,
  getAll,
  getWarnings,
  MIN_ENABLED,
  resetDefaults,
  setEnabled,
  setWeight,
} from '../../state/piece-store.js';
import { el, pieceEl, switchEl } from '../dom.js';
import { confirmDialog, pushScreen, toast } from '../overlays.js';
import { STRINGS, pieceName } from '../strings.js';
import { openEditor } from './piece-editor.js';
import { RARITY } from './rarity.js';

const PREVIEW_CELL_PX = 15;

const S = STRINGS.blocks;

/** Message for a failed store operation. `context` picks the wording for a blocked delete. */
function failureMessage(reason, context) {
  if (reason === 'min-enabled')
    return context === 'delete' ? S.reasons['min-enabled-delete'](MIN_ENABLED) : S.reasons['min-enabled'](MIN_ENABLED);
  return S.reasons[reason];
}

export function openBlocks() {
  pushScreen(S.title, (body) => {
    function render() {
      const scroll = body.scrollTop;
      const all = getAll();

      body.replaceChildren(
        el(
          'div',
          { class: 'blocks' },
          el('button', { class: 'btn btn-big wide', type: 'button', onClick: () => openEditor() }, S.design),
          ...getWarnings().map((code) => el('p', { class: 'notice', text: S.warnings[code] })),
          el('p', { class: 'hint', text: S.enabledCount(enabledCount(), all.length) }),
          el('div', { class: 'cards' }, all.map(card)),
          el('button', { class: 'btn btn-ghost wide', type: 'button', onClick: resetAll }, S.restoreDefaults),
        ),
      );
      body.scrollTop = scroll;
    }

    function card(p) {
      const toggle = el(
        'button',
        {
          class: 'row mini',
          type: 'button',
          role: 'switch',
          'aria-checked': String(p.enabled),
          onClick: () => {
            const res = setEnabled(p.id, !p.enabled);
            if (!res.ok) toast(failureMessage(res.reason, 'disable'));
            render();
          },
        },
        el('span', { text: p.enabled ? S.on : S.off }),
        switchEl(),
      );

      const seg = el(
        'div',
        { class: 'seg' },
        RARITY.map(([label, w]) =>
          el(
            'button',
            {
              class: 'seg-btn' + (p.weight === w ? ' on' : ''),
              type: 'button',
              onClick: () => {
                setWeight(p.id, w);
                render();
              },
            },
            label,
          ),
        ),
      );

      return el(
        'div',
        { class: 'card' + (p.enabled ? '' : ' off') },
        el('div', { class: 'card-preview' }, pieceEl(p.shape, p.color, PREVIEW_CELL_PX)),
        el('div', { class: 'card-name', text: pieceName(p) }),
        toggle,
        seg,
        p.custom &&
          el(
            'div',
            { class: 'card-actions' },
            el('button', { class: 'btn btn-ghost', type: 'button', onClick: () => openEditor({ piece: p }) }, S.edit),
            el(
              'button',
              { class: 'btn btn-ghost danger', type: 'button', onClick: () => remove(p) },
              STRINGS.common.delete,
            ),
          ),
      );
    }

    async function remove(p) {
      if (!(await confirmDialog(S.confirmDelete(p.name), { okText: STRINGS.common.delete }))) return;
      const res = deleteCustom(p.id);
      if (!res.ok) toast(failureMessage(res.reason, 'delete'));
      render();
    }

    async function resetAll() {
      if (!(await confirmDialog(S.confirmRestore, { okText: STRINGS.common.reset }))) return;
      resetDefaults();
      toast(S.restored);
      render();
    }

    render();
    return { onResume: render }; // the list refreshes when the editor closes
  });
}
