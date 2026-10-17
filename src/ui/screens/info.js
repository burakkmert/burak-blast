// Read-only screens: how to play and about.
import { version } from '../../../package.json';
import { el } from '../dom.js';
import { pushScreen } from '../overlays.js';
import { STRINGS } from '../strings.js';

export function openHowTo() {
  pushScreen(STRINGS.howTo.title, (body) => {
    body.append(
      el(
        'ol',
        { class: 'howto' },
        STRINGS.howTo.steps.map((text) => el('li', { text })),
      ),
    );
  });
}

export function openAbout() {
  pushScreen(STRINGS.about.title, (body) => {
    body.append(
      el(
        'div',
        { class: 'about' },
        el('div', { class: 'logo big' }, STRINGS.app.nameLead, el('b', { text: STRINGS.app.nameAccent })),
        el('p', { text: STRINGS.app.version(version) }),
        el('p', { class: 'hint', text: STRINGS.app.tagline }),
      ),
    );
  });
}
