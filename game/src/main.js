import { W, H, PLAYER_SPEED, FIRE_MS, REEF_MAX, LIVES_START } from './config.js';
import { input, initInput } from './input.js';
import { sfx } from './audio.js';
import { buatPemain, buatPeluru, buatMusuh, updateMusuh, buatTinta, buatPowerUp, buatPartikel, tabrakan } from './entities.js';
import { buatGelombang, totalGelombang } from './waves.js';
import { buatRenderer } from './render.js';

const canvas = document.getElementById('game');
initInput(canvas);
const renderer = buatRenderer(canvas);

let state = {
  layar: 'judul', // 'judul' | 'main' | 'jeda' | 'menang' | 'kalah'
  pemain: buatPemain(),
  peluru: [],
  musuh: [],
  tinta: [],
  powerups: [],
  partikel: [],
  skor: 0,
  skorTertinggi: 0,
  gelombang: 1,
  karang: REEF_MAX,
  nyawa: LIVES_START,
  kombo: 0,
  spawnQueue: [],
  spawnTimer: 0,
  spawnIndex: 0,
  fireTimer: 0
};

function mulaiBaru() {
  state.layar = 'main';
  state.pemain = buatPemain();
  state.peluru = [];
  state.musuh = [];
  state.tinta = [];
  state.powerups = [];
  state.partikel = [];
  state.skor = 0;
  state.gelombang = 1;
  state.karang = REEF_MAX;
  state.nyawa = LIVES_START;
  state.kombo = 0;
  state.spawnQueue = buatGelombang(1);
  state.spawnTimer = 0;
  state.spawnIndex = 0;
  state.fireTimer = 0;
}

let lastTime = performance.now();

function loop(now) {
  let dt = now - lastTime;
  if (dt > 50) dt = 50;
  lastTime = now;

  // Input handling based on screen
  if (state.layar === 'judul' || state.layar === 'menang' || state.layar === 'kalah') {
    if (input.consume('confirmPressed') || input.pointerDown) {
      input.consume('confirmPressed');
      mulaiBaru();
    }
  } else if (state.layar === 'jeda') {
    if (input.consume('pausePressed') || input.consume('confirmPressed')) {
      state.layar = 'main';
    }
  } else if (state.layar === 'main') {
    if (input.consume('pausePressed')) {
      state.layar = 'jeda';
    } else {
      const p = state.pemain;

      // Player movement
      if (input.pointerDown) {
        // Move towards pointerX smoothly
        const dx = input.pointerX - p.x;
        if (Math.abs(dx) > 2) {
          p.x += Math.sign(dx) * Math.min(Math.abs(dx), p.speed);
        }
        const dy = input.pointerY - p.y;
        if (Math.abs(dy) > 2) {
          p.y += Math.sign(dy) * Math.min(Math.abs(dy), p.speed);
        }
      } else {
        if (input.left) p.x -= p.speed;
        if (input.right) p.x += p.speed;
        if (input.up) p.y -= p.speed;
        if (input.down) p.y += p.speed;
      }

      // Clamp player bounds (bottom area of screen)
      p.x = Math.max(p.r, Math.min(W - p.r, p.x));
      p.y = Math.max(H * 0.5, Math.min(H - p.r - 20, p.y));

      // Timers update
      if (p.invulnMs > 0) p.invulnMs -= dt;
      if (p.doubleMs > 0) p.doubleMs -= dt;

      // Firing
      state.fireTimer -= dt;
      if ((input.fire || input.pointerDown) && state.fireTimer <= 0) {
        state.fireTimer = FIRE_MS;
        sfx.shoot();
        if (p.doubleMs > 0) {
          state.peluru.push(buatPeluru(p.x - 8, p.y - p.r));
          state.peluru.push(buatPeluru(p.x + 8, p.y - p.r));
        } else {
          state.peluru.push(buatPeluru(p.x, p.y - p.r));
        }
      }

      // Spawning enemies from queue
      state.spawnTimer += dt;
      while (state.spawnIndex < state.spawnQueue.length && state.spawnTimer >= state.spawnQueue[state.spawnIndex].delayMs) {
        const item = state.spawnQueue[state.spawnIndex];
        state.musuh.push(buatMusuh(item.tipe, item.x, state.gelombang));
        state.spawnIndex++;
      }

      // Update bullets
      state.peluru.forEach(b => {
        b.x += b.vx * (dt / 16);
        b.y += b.vy * (dt / 16);
        if (b.y < -10) b.active = false;
      });
      state.peluru = state.peluru.filter(b => b.active);

      // Update ink (enemy bullets)
      state.tinta.forEach(t => {
        t.x += t.vx * (dt / 16);
        t.y += t.vy * (dt / 16);
        if (t.y > H + 20 || t.x < 0 || t.x > W) t.active = false;
      });
      state.tinta = state.tinta.filter(t => t.active);

      // Update enemies
      state.musuh.forEach(m => {
        const status = updateMusuh(m, dt);
        if (status === 'lolos') {
          state.karang -= 10;
          sfx.hurt();
        }

        // Enemy shooting
        if (m.fireInterval > 0) {
          m.fireTimer += dt;
          if (m.fireTimer >= m.fireInterval) {
            m.fireTimer = 0;
            if (m.tipe === 'boss') {
              // Boss spread shot (3 inks)
              state.tinta.push(buatTinta(m.x, m.y + m.r, -2, 3));
              state.tinta.push(buatTinta(m.x, m.y + m.r, 0, 4));
              state.tinta.push(buatTinta(m.x, m.y + m.r, 2, 3));
            } else {
              // Shooter ink towards player
              const angle = Math.atan2(p.y - m.y, p.x - m.x);
              state.tinta.push(buatTinta(m.x, m.y, Math.cos(angle) * 3, Math.sin(angle) * 3));
            }
          }
        }
      });
      state.musuh = state.musuh.filter(m => m.active);

      // Update powerups
      state.powerups.forEach(pu => {
        pu.y += pu.vy * (dt / 16);
        if (pu.y > H + 20) pu.active = false;
      });
      state.powerups = state.powerups.filter(pu => pu.active);

      // Update particles
      state.partikel.forEach(pt => {
        pt.x += pt.vx * (dt / 16);
        pt.y += pt.vy * (dt / 16);
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) pt.active = false;
      });
      state.partikel = state.partikel.filter(pt => pt.active);

      // Collisions: Bullet vs Enemy
      state.peluru.forEach(b => {
        state.musuh.forEach(m => {
          if (b.active && m.active && tabrakan(b, m)) {
            b.active = false;
            m.hp--;
            sfx.hit();
            for (let i = 0; i < 3; i++) {
              state.partikel.push(buatPartikel(m.x, m.y, '#38bdf8'));
            }
            if (m.hp <= 0) {
              m.active = false;
              sfx.boom();
              state.skor += m.points * Math.max(1, state.kombo);
              state.kombo++;
              for (let i = 0; i < 10; i++) {
                state.partikel.push(buatPartikel(m.x, m.y, '#f43f5e'));
              }
              // Powerup drop chance (15%)
              if (Math.random() < 0.15) {
                const jns = ['double', 'shield', 'heart', 'bomb'][Math.floor(Math.random() * 4)];
                state.powerups.push(buatPowerUp(m.x, m.y, jns));
              }
            }
          }
        });
      });
      state.peluru = state.peluru.filter(b => b.active);

      // Collisions: Ink/Enemy vs Player
      if (p.invulnMs <= 0) {
        state.tinta.forEach(t => {
          if (t.active && tabrakan(t, p)) {
            t.active = false;
            hitPemain();
          }
        });
        state.musuh.forEach(m => {
          if (m.active && tabrakan(m, p)) {
            m.active = false;
            hitPemain();
          }
        });
      }

      function hitPemain() {
        if (p.shield) {
          p.shield = false;
          p.invulnMs = 1200;
          sfx.hurt();
        } else {
          state.nyawa--;
          p.invulnMs = 1800;
          state.kombo = 0;
          sfx.hurt();
          if (state.nyawa <= 0) {
            state.layar = 'kalah';
            sfx.lose();
            if (state.skor > state.skorTertinggi) state.skorTertinggi = state.skor;
          }
        }
      }

      // Collisions: Powerup vs Player
      state.powerups.forEach(pu => {
        if (pu.active && tabrakan(pu, p)) {
          pu.active = false;
          sfx.power();
          if (pu.jenis === 'double') {
            p.doubleMs = 10000;
          } else if (pu.jenis === 'shield') {
            p.shield = true;
          } else if (pu.jenis === 'heart') {
            state.nyawa = Math.min(5, state.nyawa + 1);
          } else if (pu.jenis === 'bomb') {
            // Destroy all non-boss enemies
            state.musuh.forEach(m => {
              if (m.tipe !== 'boss') {
                m.hp = 0;
                m.active = false;
                state.skor += m.points;
                for (let i = 0; i < 8; i++) {
                  state.partikel.push(buatPartikel(m.x, m.y, '#eab308'));
                }
              }
            });
          }
        }
      });
      state.powerups = state.powerups.filter(pu => pu.active);

      // Check wave completion
      if (state.spawnIndex >= state.spawnQueue.length && state.musuh.length === 0) {
        state.gelombang++;
        if (state.gelombang > totalGelombang) {
          state.layar = 'menang';
          sfx.win();
          if (state.skor > state.skorTertinggi) state.skorTertinggi = state.skor;
        } else {
          state.spawnQueue = buatGelombang(state.gelombang);
          state.spawnTimer = 0;
          state.spawnIndex = 0;
        }
      }

      // Check coral health loss
      if (state.karang <= 0) {
        state.karang = 0;
        state.layar = 'kalah';
        sfx.lose();
        if (state.skor > state.skorTertinggi) state.skorTertinggi = state.skor;
      }
    }
  }

  renderer.gambar(state);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
