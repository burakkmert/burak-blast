// Developer panel with shortcuts for testing. Loaded only when DEV_MODE is true (see main.js).
import { BOARD_SIZE } from '../core/board.js';
import { dealPieces, newGame, resetBoard, state } from '../state/game-state.js';
import { getRandomPiece, makePiece } from '../state/piece-store.js';
import { el } from './dom.js';
import { arriveTray, waveIn } from './effects.js';
import './dev-tools.css';

const TEST_COLORS = ['#ff4d6d', '#ff9f1c', '#4ade80', '#4d8bff', '#b86bff'];

export function initDevTools(game) {
  const run = (fn) => () => {
    if (game.isBusy()) return;
    fn();
    game.render();
    game.persist();
  };
  const button = (label, onClick) => el('button', { class: 'btn', type: 'button', onClick: run(onClick) }, label);

  const panel = el(
    'div',
    { class: 'dev-panel', hidden: true },
    button('New pieces', () => {
      dealPieces();
      queueMicrotask(() => arriveTray(game.trayEl));
    }),
    button('Reset', () => {
      newGame();
      queueMicrotask(() => {
        waveIn(game.boardEl);
        arriveTray(game.trayEl);
      });
    }),
    // Row 4 and column 4 are full except their crossing: one single cell clears both
    button('Test board', () => {
      resetBoard();
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i === 4) continue;
        state.board[4][i] = TEST_COLORS[i % TEST_COLORS.length];
        state.board[i][4] = TEST_COLORS[(i + 2) % TEST_COLORS.length];
      }
      state.pieces = [makePiece([[1]]), makePiece([[1]]), getRandomPiece()];
    }),
    // Checkerboard: every empty cell is isolated, so no multi-cell piece fits
    button('Game over test', () => {
      resetBoard();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if ((r + c) % 2 === 1) state.board[r][c] = '#4d8bff';
        }
      }
      state.pieces = [
        makePiece([
          [1, 1],
          [1, 1],
        ]),
        makePiece([[1, 1, 1]]),
        makePiece([[1], [1]]),
      ];
      game.setBusy(true);
      setTimeout(() => {
        game.setBusy(false);
        game.checkGameOver();
      }, 800);
    }),
  );

  const toggle = el('button', {
    class: 'dev-toggle',
    type: 'button',
    'aria-label': 'Developer panel',
    text: 'DEV',
    onClick: () => (panel.hidden = !panel.hidden),
  });

  document.body.append(panel, toggle);
}
