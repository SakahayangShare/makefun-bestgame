export const W = 960;
export const H = 540;

export const SEA = '#0284c7';
export const DEEP = '#020617';
export const CORAL = '#f43f5e';
export const SAND = '#d97706';
export const FOAM = '#38bdf8';

export const PLAYER_SPEED = 6;
export const FIRE_MS = 220;
export const REEF_MAX = 100;
export const LIVES_START = 3;

export function waveScale(w) {
  return {
    count: 4 + w * 2,
    speed: 1.0 + w * 0.15,
    hpBonus: Math.floor(w / 3),
    shooterEvery: w >= 3 ? Math.max(1, 5 - Math.floor(w / 2)) : 0
  };
}
