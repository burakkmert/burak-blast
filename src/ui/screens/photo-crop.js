// Photo crop screen: drag with one finger, zoom with two fingers, the slider or the mouse wheel.
import { PHOTO } from '../../config.js';
import { el } from '../dom.js';
import { alertDialog, pushScreen, toast } from '../overlays.js';
import { STRINGS } from '../strings.js';
import { savePhoto, setTheme } from '../theme.js';

const S = STRINGS.crop;

export function openPhotoCrop(file) {
  const url = URL.createObjectURL(file);

  pushScreen(S.title, (body, api) => {
    const F = Math.round(Math.min(window.innerWidth * 0.86, 320)); // frame side in px
    const img = el('img', { class: 'crop-img', alt: '', draggable: 'false' });
    const frame = el('div', { class: 'crop-frame', style: `width:${F}px;height:${F}px` }, img);
    const slider = el('input', {
      type: 'range',
      min: '1',
      max: String(PHOTO.maxZoom),
      step: '0.01',
      value: '1',
      'aria-label': S.zoom,
      disabled: true,
    });
    const applyBtn = el('button', { class: 'btn', type: 'button', disabled: true }, S.apply);

    // Image placement: (x, y) is its top-left corner relative to the frame, s the scale
    let iw = 0;
    let ih = 0;
    let minS = 1;
    let s = 1;
    let x = 0;
    let y = 0;

    const clamp = () => {
      x = Math.min(0, Math.max(F - iw * s, x));
      y = Math.min(0, Math.max(F - ih * s, y));
    };
    const draw = () => {
      img.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    };
    /** Zooms while keeping the point (cx, cy) fixed. */
    const zoomTo = (ns, cx, cy) => {
      ns = Math.min(minS * PHOTO.maxZoom, Math.max(minS, ns));
      const k = ns / s;
      x = cx - (cx - x) * k;
      y = cy - (cy - y) * k;
      s = ns;
      clamp();
      draw();
      slider.value = String(s / minS);
    };

    img.onload = () => {
      iw = img.naturalWidth;
      ih = img.naturalHeight;
      img.style.width = `${iw}px`;
      img.style.height = `${ih}px`;
      minS = Math.max(F / iw, F / ih); // the image always covers the frame
      s = minS;
      x = (F - iw * s) / 2;
      y = (F - ih * s) / 2;
      draw();
      slider.disabled = false;
      applyBtn.disabled = false;
    };
    img.onerror = async () => {
      await alertDialog(S.openFailed);
      api.pop();
    };
    img.src = url;

    // ---- Pointers: one drags, two pinch ----
    const pointers = new Map();
    const local = (e) => {
      const r = frame.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const pinchInfo = () => {
      const [a, b] = [...pointers.values()];
      return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    };

    frame.addEventListener('pointerdown', (e) => {
      if (!iw) return;
      e.preventDefault();
      frame.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, local(e));
    });
    frame.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      const cur = local(e);

      if (pointers.size === 1) {
        x += cur.x - prev.x;
        y += cur.y - prev.y;
        clamp();
        draw();
        pointers.set(e.pointerId, cur);
      } else if (pointers.size === 2) {
        const before = pinchInfo();
        pointers.set(e.pointerId, cur);
        const after = pinchInfo();
        zoomTo(s * (after.dist / before.dist), before.mx, before.my);
        // The midpoint between the fingers pans as well
        x += after.mx - before.mx;
        y += after.my - before.my;
        clamp();
        draw();
      }
    });
    const release = (e) => pointers.delete(e.pointerId);
    frame.addEventListener('pointerup', release);
    frame.addEventListener('pointercancel', release);
    frame.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const p = local(e);
        zoomTo(s * (e.deltaY < 0 ? 1.1 : 0.9), p.x, p.y);
      },
      { passive: false },
    );
    slider.addEventListener('input', () => zoomTo(minS * Number(slider.value), F / 2, F / 2));

    // ---- Apply: render the visible square to a small JPEG and store it ----
    applyBtn.addEventListener('click', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = PHOTO.outputPx;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; // transparent PNGs would otherwise turn black
      ctx.fillRect(0, 0, PHOTO.outputPx, PHOTO.outputPx);
      ctx.drawImage(img, -x / s, -y / s, F / s, F / s, 0, 0, PHOTO.outputPx, PHOTO.outputPx);

      if (!savePhoto(canvas.toDataURL('image/jpeg', PHOTO.jpegQuality))) {
        await alertDialog(S.saveFailed);
        return;
      }
      setTheme('photo');
      toast(S.applied);
      api.pop();
    });

    body.append(
      el(
        'div',
        { class: 'crop' },
        el('p', { class: 'hint', text: S.hint }),
        frame,
        el('label', { class: 'field' }, el('span', { text: S.zoom }), slider),
        el(
          'div',
          { class: 'ed-actions' },
          el('button', { class: 'btn btn-ghost', type: 'button', onClick: api.pop }, STRINGS.common.cancel),
          applyBtn,
        ),
      ),
    );

    return { onClose: () => URL.revokeObjectURL(url) };
  });
}
