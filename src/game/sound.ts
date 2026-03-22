// ─── Web Audio API sound synthesis ───
// No external files needed — all sounds generated programmatically.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume: number = 0.15,
  delay: number = 0,
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0;

  osc.connect(gain);
  gain.connect(ac.destination);

  const t = ac.currentTime + delay;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noise(duration: number, volume: number = 0.08, delay: number = 0) {
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buffer;
  src.connect(gain);
  gain.connect(ac.destination);

  const t = ac.currentTime + delay;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.start(t);
}

// ═══════════════════════════════════════
//  PUBLIC SOUND EFFECTS
// ═══════════════════════════════════════

/** Short kick thump */
export function playKick() {
  noise(0.12, 0.2);
  tone(120, 0.1, 'sine', 0.3);
  tone(80, 0.15, 'sine', 0.2, 0.03);
}

/** Ascending jingle — GOAL! */
export function playGoal() {
  tone(523, 0.15, 'square', 0.12);        // C5
  tone(659, 0.15, 'square', 0.12, 0.12);  // E5
  tone(784, 0.15, 'square', 0.12, 0.24);  // G5
  tone(1047, 0.3, 'square', 0.15, 0.36);  // C6 (longer)
}

/** Descending tone — saved / miss */
export function playSave() {
  tone(400, 0.15, 'triangle', 0.12);
  tone(300, 0.2, 'triangle', 0.1, 0.1);
}

/** Whistle — round start */
export function playWhistle() {
  tone(880, 0.12, 'sine', 0.1);
  tone(1100, 0.3, 'sine', 0.12, 0.12);
}

/** UI button click */
export function playClick() {
  tone(660, 0.05, 'square', 0.06);
}

/** Crowd cheer (noise-based) */
export function playCrowd() {
  noise(0.6, 0.06);
  noise(0.4, 0.05, 0.1);
  noise(0.3, 0.04, 0.2);
}

/** Initialize audio context on first user interaction */
export function initAudio() {
  getCtx();
}
