/**
 * Audio Synthesizer using Web Audio API
 * Provides tactile clicks, victory fanfares, error buzzers, and arcade sound effects
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const soundManager = {
  getMuted(): boolean {
    return isMuted;
  },

  setMuted(muted: boolean) {
    isMuted = muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bytequest_muted', muted ? 'true' : 'false');
    }
  },

  initFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('bytequest_muted');
      if (stored === 'true') {
        isMuted = true;
      }
    }
  },

  // Soft tactile mechanical keyboard clack
  playKeyClick() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Crisp mechanical key frequency
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio error silently handled
    }
  },

  // Upbeat reward chime
  playSuccess() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {
      // Audio error silently handled
    }
  },

  // Gentle error buzz
  playError() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio error silently handled
    }
  },

  // Arcade laser zap (Asteroid Typer)
  playZap() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio error silently handled
    }
  },

  // Big fanfare for level completion & certificates
  playFanfare() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const chords = [
        [523.25, 659.25], // C5, E5
        [587.33, 698.46], // D5, F5
        [659.25, 783.99], // E5, G5
        [783.99, 1046.5], // G5, C6
      ];

      chords.forEach(([f1, f2], i) => {
        const time = ctx.currentTime + i * 0.12;
        [f1, f2].forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, time);
          gain.gain.setValueAtTime(0.09, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.35);
        });
      });
    } catch {
      // Audio error silently handled
    }
  },
};
