import { W, H, SEA, DEEP, CORAL, SAND, FOAM } from './config.js';

export function buatRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  // Background decor generated once for stability
  const bubbles = Array.from({ length: 25 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1 + Math.random() * 3,
    speed: 0.3 + Math.random() * 0.7
  }));

  const seaweeds = Array.from({ length: 12 }, () => ({
    x: Math.random() * W,
    height: 40 + Math.random() * 60,
    segments: 5
  }));

  return {
    gambar(state) {
      ctx.clearRect(0, 0, W, H);

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#091e3a');
      grad.addColorStop(1, '#0c2340');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const time = Date.now() * 0.003;
      // Water surface caustic light rays (upper third)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      for (let i = 0; i < 5; i++) {
        const yOffset = 20 + i * 25 + Math.sin(time + i) * 8;
        ctx.fillRect(0, yOffset, W, 2 + (i % 2));
      }

      // 2. Parallax Bubbles
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      bubbles.forEach(b => {
        b.y -= b.speed;
        if (b.y < -10) b.y = H + 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Parallax Seaweed at bottom
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 4;
      seaweeds.forEach((sw, i) => {
        ctx.beginPath();
        ctx.moveTo(sw.x, H - 20);
        let cx = sw.x;
        let cy = H - 20 - sw.height / 2;
        cx += Math.sin(time + i) * 15;
        ctx.quadraticCurveTo(cx, cy, sw.x + Math.sin(time * 0.8 + i) * 10, H - 20 - sw.height);
        ctx.stroke();
      });

      // 4. Coral Reef at Bottom
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 40) {
        const h = 25 + Math.sin(x * 0.05) * 15 + Math.cos(x * 0.02) * 10;
        ctx.lineTo(x, H - h);
      }
      ctx.lineTo(W, H);
      ctx.fill();

      // Sand floor accent
      ctx.fillStyle = SAND;
      ctx.fillRect(0, H - 12, W, 12);

      // If state is not title, draw game entities
      if (state.layar !== 'judul') {
        // Particles
        if (state.partikel) {
          state.partikel.forEach(p => {
            ctx.fillStyle = p.warna || FOAM;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        // PowerUps
        if (state.powerups) {
          state.powerups.forEach(pu => {
            ctx.save();
            ctx.translate(pu.x, pu.y);
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = pu.jenis === 'bomb' ? '#eab308' : (pu.jenis === 'heart' ? '#f43f5e' : '#38bdf8');
            ctx.beginPath();
            ctx.arc(0, 0, pu.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let symbol = '2X';
            if (pu.jenis === 'shield') symbol = 'S';
            if (pu.jenis === 'heart') symbol = '♥';
            if (pu.jenis === 'bomb') symbol = '★';
            ctx.fillText(symbol, 0, 0);
            ctx.restore();
          });
        }

        // Peluru (Player Bullets)
        if (state.peluru) {
          ctx.fillStyle = FOAM;
          state.peluru.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(p.x - 1, p.y - 1, p.r * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = FOAM;
          });
        }

        // Tinta (Enemy Bullets)
        if (state.tinta) {
          ctx.fillStyle = '#475569';
          state.tinta.forEach(t => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Musuh (Enemies)
        if (state.musuh) {
          state.musuh.forEach(m => {
            ctx.save();
            ctx.translate(m.x, m.y);
            if (m.tipe === 'boss') {
              // Boss Jellyfish Robot
              ctx.fillStyle = '#a855f7';
              ctx.beginPath();
              ctx.arc(0, 0, m.r, Math.PI, 0, false);
              ctx.lineTo(m.r, m.r * 0.5);
              // Tentacles
              for (let i = -m.r + 10; i <= m.r - 10; i += 15) {
                ctx.lineTo(i + Math.sin(time * 5 + i) * 5, m.r + 15);
                ctx.lineTo(i, m.r * 0.5);
              }
              ctx.closePath();
              ctx.fill();

              // Boss eye / core
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(0, -5, 10, 0, Math.PI * 2);
              ctx.fill();

              // Boss HP bar
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(-40, -m.r - 18, 80, 8);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(-40, -m.r - 18, 80 * (m.hp / m.maxHp), 8);
            } else {
              // Regular Jellyfish Robot
              let col = '#06b6d4'; // dasar
              if (m.tipe === 'cepat') col = '#3b82f6';
              if (m.tipe === 'tank') col = '#8b5cf6';
              if (m.tipe === 'penembak') col = '#ec4899';

              ctx.fillStyle = col;
              ctx.beginPath();
              ctx.arc(0, 0, m.r, Math.PI, 0, false);
              ctx.lineTo(m.r, m.r * 0.6);
              // tentacles
              ctx.lineTo(m.r * 0.5, m.r + 8);
              ctx.lineTo(0, m.r * 0.6);
              ctx.lineTo(-m.r * 0.5, m.r + 8);
              ctx.lineTo(-m.r, m.r * 0.6);
              ctx.closePath();
              ctx.fill();

              // Eyes
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(-5, -2, 3, 0, Math.PI * 2);
              ctx.arc(5, -2, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#0f172a';
              ctx.beginPath();
              ctx.arc(-5, -2, 1, 0, Math.PI * 2);
              ctx.arc(5, -2, 1, 0, Math.PI * 2);
              ctx.fill();

              // Small HP bar if damaged or tank/penembak
              if (m.hp < m.maxHp || m.tipe === 'tank') {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(-m.r, -m.r - 10, m.r * 2, 4);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(-m.r, -m.r - 10, m.r * 2 * (m.hp / m.maxHp), 4);
              }
            }
            ctx.restore();
          });
        }

        // Pemain (Player - Guard Crab)
        if (state.pemain) {
          const p = state.pemain;
          if (p.invulnMs <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
            ctx.save();
            ctx.translate(p.x, p.y);

            // Shield ring
            if (p.shield) {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(0, 0, p.r + 8, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Crab Body
            ctx.fillStyle = CORAL;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.75, 0, 0, Math.PI * 2);
            ctx.fill();

            // Claws
            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            ctx.arc(-p.r - 4, -2, 8, 0, Math.PI * 2);
            ctx.arc(p.r + 4, -2, 8, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5, -p.r * 0.6, 4, 0, Math.PI * 2);
            ctx.arc(5, -p.r * 0.6, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-5, -p.r * 0.6, 1.5, 0, Math.PI * 2);
            ctx.arc(5, -p.r * 0.6, 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }

        // HUD (Score, Wave, Lives, Coral Health, Combo)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Skor: ${state.skor || 0}`, 20, 30);

        ctx.textAlign = 'center';
        ctx.fillText(`Gelombang: ${state.gelombang || 1} / 10`, W / 2, 30);

        ctx.textAlign = 'right';
        ctx.fillText(`Nyawa: ${'♥'.repeat(Math.max(0, state.nyawa || 0))}`, W - 20, 30);

        // Combo text
        if (state.kombo && state.kombo >= 2) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`KOMBO x${state.kombo}!`, W / 2, 60);
        }

        // Coral Health Bar at bottom
        const karangHp = state.karang !== undefined ? state.karang : 100;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(W / 2 - 150, H - 25, 300, 14);
        ctx.fillStyle = karangHp > 30 ? '#22c55e' : '#ef4444';
        ctx.fillRect(W / 2 - 150, H - 25, 300 * Math.max(0, karangHp / 100), 14);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 150, H - 25, 300, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`KESEHATAN KARANG: ${Math.max(0, Math.ceil(karangHp))}%`, W / 2, H - 15);
      }

      // 5. Overlays (Title, Pause, Win, Lose)
      if (state.layar === 'judul') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PENJAGA KARANG', W / 2, H / 2 - 80);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        ctx.fillText('Lindungi terumbu karang dari invasi robot ubur-ubur jahat!', W / 2, H / 2 - 30);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px sans-serif';
        ctx.fillText('Kontrol: A/D atau Panah untuk gerak | Spasi untuk tembak | P untuk Jeda', W / 2, H / 2 + 20);

        if (Math.floor(Date.now() / 400) % 2 === 0) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('Klik atau tekan Enter untuk mulai', W / 2, H / 2 + 90);
        }
      } else if (state.layar === 'jeda') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('JEDA', W / 2, H / 2 - 20);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText('Tekan P untuk melanjutkan', W / 2, H / 2 + 20);
      } else if (state.layar === 'menang') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TERUMBU SELAMAT!', W / 2, H / 2 - 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.fillText(`Skor Akhir: ${state.skor || 0}`, W / 2, H / 2);

        if (Math.floor(Date.now() / 400) % 2 === 0) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('Tekan R atau klik untuk main lagi', W / 2, H / 2 + 60);
        }
      } else if (state.layar === 'kalah') {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TERUMBU HANCUR', W / 2, H / 2 - 70);

        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.fillText(`Skor Akhir: ${state.skor || 0}`, W / 2, H / 2 - 15);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px sans-serif';
        ctx.fillText(`Skor Tertinggi: ${state.skorTertinggi || 0}`, W / 2, H / 2 + 20);

        if (Math.floor(Date.now() / 400) % 2 === 0) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('Tekan R atau klik untuk main lagi', W / 2, H / 2 + 75);
        }
      }
    }
  };
}
