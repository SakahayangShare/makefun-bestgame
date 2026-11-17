import { W, H, waveScale } from './config.js';

export function buatPemain() {
  return {
    x: W / 2,
    y: H - 60,
    r: 18,
    speed: 6,
    invulnMs: 0,
    doubleMs: 0,
    shield: false
  };
}

export function buatPeluru(x, y, vx = 0, vy = -10) {
  return { x, y, vx, vy, r: 5, active: true };
}

export function buatMusuh(tipe, x, wave) {
  const scale = waveScale(wave);
  let hp = 1;
  let speed = scale.speed;
  let r = 16;
  let points = 10;

  if (tipe === 'cepat') {
    hp = 1 + Math.floor(wave / 4);
    speed *= 1.6;
    r = 14;
    points = 15;
  } else if (tipe === 'tank') {
    hp = 5 + Math.floor(wave / 2);
    speed *= 0.6;
    r = 24;
    points = 30;
  } else if (tipe === 'penembak') {
    hp = 2 + Math.floor(wave / 3);
    speed *= 0.8;
    r = 18;
    points = 25;
  } else if (tipe === 'boss') {
    hp = 40 + wave * 10;
    speed = 0.5;
    r = 45;
    points = 250;
  }

  return {
    tipe,
    x,
    y: -40,
    baseX: x,
    r,
    hp,
    maxHp: hp,
    speed,
    points,
    angle: Math.random() * Math.PI * 2,
    freq: 0.002 + Math.random() * 0.002,
    amp: 30 + Math.random() * 30,
    fireTimer: 0,
    fireInterval: tipe === 'boss' ? 1400 : (tipe === 'penembak' ? 2200 : 0),
    active: true
  };
}

export function updateMusuh(m, dtMs) {
  m.angle += m.freq * dtMs;
  m.y += m.speed * (dtMs / 16);
  m.x = m.baseX + Math.sin(m.angle) * m.amp;
  if (m.y > H + 50) {
    m.active = false;
    return 'lolos';
  }
  return null;
}

export function buatTinta(x, y, vx = 0, vy = 4) {
  return { x, y, vx, vy, r: 6, active: true };
}

export function buatPowerUp(x, y, jenis) {
  return { x, y, vy: 1.5, r: 12, jenis, active: true };
}

export function buatPartikel(x, y, warna) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 4;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 2 + Math.random() * 3,
    alpha: 1,
    decay: 0.02 + Math.random() * 0.03,
    warna
  };
}

export function tabrakan(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const minDist = a.r + b.r;
  return distSq <= minDist * minDist;
}
