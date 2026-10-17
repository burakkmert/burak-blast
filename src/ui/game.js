// Gameplay controller: connects state, rules, drag and drop, rendering and feedback.
import { SCORING, TIMING } from '../config.js';
import { canPlace, clearLines, findFullLines, getPlacementLines, isBoardEmpty, placePiece } from '../core/board.js';
import { hasAnyValidMove } from '../core/game-over.js';
import { calculateScore, nextComboState } from '../core/scoring.js';
import { feedback } from '../platform/feedback.js';
import { isTrayEmpty, newGame, dealPieces, restoreGame, state, takePiece } from '../state/game-state.js';
import { clearSave, loadGame, saveBest, saveGame } from '../state/save.js';
import {
  animateClear,
  animateGameOver,
  animateSettle,
  buildBoardDom,
  clearPreview,
  renderBoard,
  showPreview,
} from './board-view.js';
import { initDrag } from './drag.js';
import {
  animateCount,
  arriveTray,
  centerOf,
  confetti,
  flashBest,
  floatText,
  shakeScreen,
  showBanner,
  waveIn,
} from './effects.js';
import { isOverlayOpen } from './overlays.js';
import { burst } from './particles.js';
import { STRINGS } from './strings.js';
import { renderTray } from './tray-view.js';

/**
 * Builds the board, restores or starts a game and wires dragging.
 * @returns the handles other modules need: startNewGame, persistIfAlive and, for the dev tools, the rest.
 */
export function initGame() {
  const boardEl = document.getElementById('board');
  const trayEl = document.getElementById('tray');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const bestBoxEl = document.querySelector('.best');
  const overlayEl = document.getElementById('gameover');

  let busy = false; // true during animations and game over: dragging and buttons are locked

  function render() {
    renderBoard(boardEl, state.board);
    renderTray(trayEl, state.pieces, state.board);
    animateCount(scoreEl, state.score);
    bestEl.textContent = state.best;
  }

  const persist = () => saveGame(state);

  /** A finished game must not be written back, or it would be restored as over. */
  const persistIfAlive = () => {
    if (hasAnyValidMove(state.board, state.pieces)) persist();
  };

  // ---------- Start ----------
  buildBoardDom(boardEl);
  const saved = loadGame();
  if (saved && hasAnyValidMove(saved.board, saved.pieces)) restoreGame(saved);
  else newGame(); // no save, a corrupt one, or a finished game
  render();
  waveIn(boardEl);
  arriveTray(trayEl);
  persist();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) persistIfAlive();
  });

  // ---------- Game over ----------
  function checkGameOver() {
    if (!hasAnyValidMove(state.board, state.pieces)) gameOver();
  }

  function gameOver() {
    busy = true;
    clearSave();
    feedback('gameOver');
    const newRecord = state.score > 0 && state.score > state.bestAtStart;
    const duration = animateGameOver(boardEl);

    setTimeout(() => {
      document.getElementById('go-score').textContent = '0';
      document.getElementById('go-best').textContent = state.best;
      document.getElementById('go-record').hidden = !newRecord;
      overlayEl.hidden = false;
      animateCount(document.getElementById('go-score'), state.score, TIMING.gameOverCountMs);
      if (newRecord) {
        confetti(overlayEl.querySelector('.panel'));
        feedback('newRecord');
      }
    }, duration + TIMING.gameOverPanelDelayMs);
  }

  function startNewGame() {
    overlayEl.hidden = true;
    newGame();
    render();
    waveIn(boardEl);
    arriveTray(trayEl);
    persist();
    busy = false;
  }

  document.getElementById('restart').addEventListener('click', startNewGame);

  // ---------- Resolving a move ----------
  /**
   * After a piece is placed: finds full lines, animates and clears them, updates score and combo.
   * @returns {number} animation duration in ms (0 when nothing was cleared)
   */
  function resolveMove(piece) {
    const { rows, cols } = findFullLines(state.board);
    const linesCleared = rows.length + cols.length;
    const cellsPlaced = piece.shape.flat().filter(Boolean).length;

    // The animation starts on the still-visible cells while the state is cleared immediately
    let anim = null;
    if (linesCleared > 0) {
      anim = animateClear(boardEl, rows, cols);
      clearLines(state.board, rows, cols);
    }

    const boardCleared = linesCleared > 0 && isBoardEmpty(state.board);
    const result = calculateScore({ cellsPlaced, linesCleared, combo: state.combo.combo, boardCleared }, SCORING);
    state.combo = nextComboState(state.combo, linesCleared, SCORING);

    state.score += result.total;
    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
      bestEl.textContent = state.best;
      // Flash once, at the moment the previous record is passed
      if (state.bestAtStart > 0 && state.score - result.total <= state.bestAtStart) flashBest(bestBoxEl);
    }
    animateCount(scoreEl, state.score);

    if (!anim) return 0;

    burst(anim.cells);
    feedback('lineClear', { lines: linesCleared });
    if (state.combo.combo >= 2) feedback('combo', { combo: state.combo.combo });
    if (boardCleared) feedback('boardClear');
    if (linesCleared >= 2 || state.combo.combo >= 2) {
      shakeScreen(Math.min(1, (linesCleared + state.combo.combo) / 6));
    }
    const { x, y } = centerOf(anim.cells);
    floatText(`+${result.lines}`, x, y);
    if (state.combo.combo >= 2) showBanner(STRINGS.banner.combo(state.combo.combo));
    if (boardCleared) showBanner(STRINGS.banner.boardClear(result.bonus), { className: 'clean', top: '40%' });
    return anim.duration;
  }

  // ---------- Drag and drop ----------
  initDrag({
    boardEl,
    trayEl,
    getPieces: () => state.pieces,
    isBlocked: () => busy || isOverlayOpen(),
    onPickUp: () => feedback('pickUp'),

    onPreview: (piece, cell) => {
      if (piece && cell && canPlace(state.board, piece.shape, cell.row, cell.col)) {
        const lines = getPlacementLines(state.board, piece.shape, cell.row, cell.col);
        showPreview(boardEl, piece.shape, cell.row, cell.col, piece.color, lines);
      } else {
        clearPreview();
      }
    },

    onDrop: (piece, cell, slotIndex) => {
      if (!cell || !canPlace(state.board, piece.shape, cell.row, cell.col)) {
        feedback('invalid');
        return false;
      }

      placePiece(state.board, piece.shape, cell.row, cell.col, piece.color);
      takePiece(slotIndex);
      feedback('place');
      renderBoard(boardEl, state.board);
      animateSettle(boardEl, piece.shape, cell.row, cell.col);

      // Clear first (state updates immediately), then deal: fair spawn looks at the cleared board
      const clearMs = resolveMove(piece);
      const dealt = isTrayEmpty();
      if (dealt) dealPieces();
      renderTray(trayEl, state.pieces, state.board);
      if (dealt) arriveTray(trayEl);
      persist();

      // Game over is checked after the clear animation finishes
      if (clearMs > 0) {
        busy = true;
        setTimeout(() => {
          renderBoard(boardEl, state.board);
          busy = false;
          checkGameOver();
        }, clearMs + 30);
      } else {
        checkGameOver();
      }
      return true;
    },
  });

  return {
    boardEl,
    trayEl,
    render,
    persist,
    persistIfAlive,
    checkGameOver,
    startNewGame,
    isBusy: () => busy,
    setBusy: (value) => (busy = value),
  };
}
