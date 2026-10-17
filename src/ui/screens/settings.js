// Settings screen: toggles and master volume.
import { sample, feedback } from '../../platform/feedback.js';
import { setVolume } from '../../platform/sound.js';
import { setSetting, settings } from '../../state/settings.js';
import { el, switchEl } from '../dom.js';
import { pushScreen } from '../overlays.js';
import { STRINGS } from '../strings.js';

const TOGGLES = ['sound', 'vibration', 'reduceMotion', 'fairSpawn'];

export function openSettings() {
  pushScreen(STRINGS.settings.title, (body) => {
    const volume = el('input', {
      type: 'range',
      min: '0',
      max: '100',
      step: '1',
      value: String(settings.volume),
      disabled: !settings.sound,
      'aria-label': STRINGS.settings.volume,
    });
    const volumeValue = el('span', { text: String(settings.volume) });
    volume.addEventListener('input', () => {
      setSetting('volume', Number(volume.value));
      setVolume();
      volumeValue.textContent = volume.value;
    });
    // Release plays a sample so the new level can be heard
    volume.addEventListener('change', () => feedback('place'));

    const rows = TOGGLES.map((key) => {
      const { label, description } = STRINGS.settings.rows[key];
      const row = el(
        'button',
        {
          class: 'row',
          type: 'button',
          role: 'switch',
          'aria-checked': String(settings[key]),
          onClick: () => {
            setSetting(key, !settings[key]);
            row.setAttribute('aria-checked', String(settings[key]));
            if (key === 'sound') volume.disabled = !settings.sound;
            // Play a sample when sound or vibration is switched on
            if ((key === 'sound' || key === 'vibration') && settings[key]) sample(key);
          },
        },
        el('span', { class: 'row-text' }, el('b', { text: label }), el('small', { text: description })),
        switchEl(),
      );
      return row;
    });

    body.append(
      el(
        'div',
        { class: 'list' },
        rows,
        el(
          'div',
          { class: 'field' },
          el('div', { class: 'field-row' }, el('span', { text: STRINGS.settings.volume }), volumeValue),
          volume,
        ),
      ),
    );
  });
}
