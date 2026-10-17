// Entry point: initializes each layer and connects them.
import '@fontsource-variable/fredoka';
import './styles/index.css';
import { DEV_MODE } from './config.js';
import { feedback } from './platform/feedback.js';
import { initNative } from './platform/native.js';
import { initSound, resumeSound, suspendSound } from './platform/sound.js';
import { onSettingsChange } from './state/settings.js';
import { initGame } from './ui/game.js';
import { goBack, initMenu } from './ui/menu.js';
import { applyStaticText } from './ui/static-text.js';
import { applySettings, initTheme } from './ui/theme.js';

applyStaticText();
applySettings();
onSettingsChange(applySettings);
initSound();
initTheme();

const game = initGame();
initMenu({ onNewGame: game.startNewGame });

initNative({
  onBack: goBack,
  onPause: () => {
    game.persistIfAlive();
    suspendSound();
  },
  onResume: resumeSound,
});

// Light click for every button
document.addEventListener('click', (e) => {
  if (e.target.closest('button')) feedback('uiClick');
});

// import.meta.env.DEV is a literal false in production builds, so the bundler drops the dev tools entirely
if (import.meta.env.DEV && DEV_MODE) {
  import('./ui/dev-tools.js').then((m) => m.initDevTools(game));
}
