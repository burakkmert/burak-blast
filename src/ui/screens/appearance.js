// Block appearance screen: theme picker with live previews and the photo theme controls.
import { PHOTO_TONE_MAX } from '../../config.js';
import { settings } from '../../state/settings.js';
import { el, pieceEl } from '../dom.js';
import { pushScreen, toast } from '../overlays.js';
import { STRINGS } from '../strings.js';
import { currentTheme, hasPhoto, removePhoto, setPhotoTone, setTheme, THEMES } from '../theme.js';
import { openPhotoCrop } from './photo-crop.js';

const PREVIEW_CELL_PX = 18;
const S = STRINGS.appearance;

export function openAppearance() {
  pushScreen(S.title, (body) => {
    // The gallery opens through a plain file input; no extra Android plugin is needed
    const fileInput = el('input', {
      type: 'file',
      accept: 'image/*',
      hidden: true,
      onChange: (e) => {
        const file = e.target.files[0];
        e.target.value = ''; // lets the same file be picked again
        if (file) openPhotoCrop(file);
      },
    });
    const pickPhoto = () => fileInput.click();

    function themeCard(t) {
      const active = currentTheme() === t.id;
      const photoMissing = t.id === 'photo' && !hasPhoto();
      // Each preview carries its own data-theme, so it renders in that theme whatever is selected
      const preview = el(
        'div',
        { class: 'theme-preview', 'data-theme': t.id },
        photoMissing
          ? el('span', { class: 'hint', text: S.pickPhotoHint })
          : [
              pieceEl(
                [
                  [1, 1],
                  [1, 0],
                ],
                'var(--blk-red)',
                PREVIEW_CELL_PX,
              ),
              pieceEl([[1, 1]], 'var(--blk-aqua)', PREVIEW_CELL_PX),
              pieceEl([[1]], 'var(--blk-yellow)', PREVIEW_CELL_PX),
            ],
      );
      return el(
        'button',
        {
          class: 'theme-card' + (active ? ' on' : ''),
          type: 'button',
          'aria-pressed': String(active),
          onClick: () => {
            if (photoMissing) return pickPhoto();
            setTheme(t.id);
            render();
          },
        },
        preview,
        el('span', { class: 'card-name', text: t.name }),
      );
    }

    function render() {
      const scroll = body.scrollTop;
      const photo = hasPhoto();

      const tint = el('input', {
        type: 'range',
        min: '0',
        max: String(PHOTO_TONE_MAX),
        step: '1',
        value: String(settings.photoTone),
        disabled: !photo,
        'aria-label': S.tone,
      });
      const tintValue = el('span', { text: `${settings.photoTone}` });
      tint.addEventListener('input', () => {
        setPhotoTone(tint.value);
        tintValue.textContent = tint.value;
      });

      body.replaceChildren(
        el(
          'div',
          { class: 'appearance' },
          el('div', { class: 'theme-grid' }, THEMES.map(themeCard)),
          el('h3', { class: 'section-title', text: S.photoSection }),
          el('button', { class: 'btn wide', type: 'button', onClick: pickPhoto }, S.pickPhoto),
          el(
            'div',
            { class: 'field' },
            el('div', { class: 'field-row' }, el('span', { text: S.tone }), tintValue),
            tint,
          ),
          photo &&
            el(
              'button',
              {
                class: 'btn btn-ghost danger wide',
                type: 'button',
                onClick: () => {
                  removePhoto();
                  toast(S.photoRemoved);
                  render();
                },
              },
              S.removePhoto,
            ),
          fileInput,
        ),
      );
      body.scrollTop = scroll;
    }

    render();
    return { onResume: render }; // refreshes when the crop screen closes
  });
}
