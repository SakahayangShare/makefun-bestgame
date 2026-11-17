let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    } catch (e) {
      // Audio not supported or blocked
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, type, duration, vol = 0.1, freqEnd = null) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors
  }
}

export const sfx = {
  shoot() {
    playTone(600, 'sine', 0.1, 0.08, 200);
  },
  hit() {
    playTone(250, 'triangle', 0.08, 0.1, 100);
  },
  boom() {
    playTone(120, 'sawtooth', 0.3, 0.15, 30);
  },
  power() {
    playTone(400, 'sine', 0.25, 0.1, 800);
  },
  hurt() {
    playTone(150, 'sawtooth', 0.2, 0.15, 60);
  },
  win() {
    const ctx = getContext();
    if (!ctx) return;
    const notes = [300, 450, 600, 900];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 'triangle', 0.2, 0.12), i * 150);
    });
  },
  lose() {
    const ctx = getContext();
    if (!ctx) return;
    const notes = [400, 300, 200, 100];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 'sawtooth', 0.25, 0.15), i * 150);
    });
  }
};
