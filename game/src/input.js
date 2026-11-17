import { W, H } from './config.js';

export const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false,
  pausePressed: false,
  confirmPressed: false,
  pointerX: W / 2,
  pointerY: H / 2,
  pointerDown: false,
  consume(action) {
    if (this[action]) {
      this[action] = false;
      return true;
    }
    return false;
  }
};

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') input.down = true;
    if (e.code === 'Space') input.fire = true;
    if (e.code === 'KeyP') input.pausePressed = true;
    if (e.code === 'Enter' || e.code === 'KeyR') input.confirmPressed = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') input.down = false;
    if (e.code === 'Space') input.fire = false;
  });

  if (canvas) {
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      input.pointerX = (clientX - rect.left) * scaleX;
      input.pointerY = (clientY - rect.top) * scaleY;
    };

    canvas.addEventListener('pointermove', (e) => {
      getPos(e);
    });

    canvas.addEventListener('pointerdown', (e) => {
      getPos(e);
      input.pointerDown = true;
      input.fire = true;
      input.confirmPressed = true;
    });

    canvas.addEventListener('pointerup', () => {
      input.pointerDown = false;
      input.fire = false;
    });

    canvas.addEventListener('touchstart', (e) => {
      getPos(e);
      input.pointerDown = true;
      input.fire = true;
      input.confirmPressed = true;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      getPos(e);
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      input.pointerDown = false;
      input.fire = false;
    });
  }
}
