import { W, waveScale } from './config.js';

export const totalGelombang = 10;

export function buatGelombang(n) {
  const scale = waveScale(n);
  const spawns = [];
  const count = scale.count;
  let delay = 0;

  for (let i = 0; i < count; i++) {
    delay += 700 - Math.min(350, n * 25);
    let tipe = 'dasar';
    const r = Math.random();
    if (n >= 3 && i > 0 && i % scale.shooterEvery === 0) {
      tipe = 'penembak';
    } else if (n >= 2 && r < 0.25) {
      tipe = 'cepat';
    } else if (n >= 3 && r < 0.45) {
      tipe = 'tank';
    }

    const x = 80 + Math.random() * (W - 160);
    spawns.push({ delayMs: delay, tipe, x });
  }

  if (n === 5 || n === 10) {
    spawns.push({
      delayMs: delay + 2000,
      tipe: 'boss',
      x: W / 2
    });
  }

  return spawns;
}
