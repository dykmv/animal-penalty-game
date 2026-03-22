// ─── Web Audio API sound synthesis ───
// No external files needed — all sounds generated programmatically.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
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
//  SOUND EFFECTS
// ═══════════════════════════════════════

export function playKick() {
  noise(0.12, 0.2);
  tone(120, 0.1, 'sine', 0.3);
  tone(80, 0.15, 'sine', 0.2, 0.03);
}

export function playGoal() {
  tone(523, 0.15, 'square', 0.12);
  tone(659, 0.15, 'square', 0.12, 0.12);
  tone(784, 0.15, 'square', 0.12, 0.24);
  tone(1047, 0.3, 'square', 0.15, 0.36);
}

export function playSave() {
  tone(400, 0.15, 'triangle', 0.12);
  tone(300, 0.2, 'triangle', 0.1, 0.1);
}

export function playWhistle() {
  tone(880, 0.12, 'sine', 0.1);
  tone(1100, 0.3, 'sine', 0.12, 0.12);
}

export function playClick() {
  tone(660, 0.05, 'square', 0.06);
}

export function playCrowd() {
  noise(0.6, 0.06);
  noise(0.4, 0.05, 0.1);
  noise(0.3, 0.04, 0.2);
}

export function initAudio() {
  getCtx();
}

// ═══════════════════════════════════════
//  BACKGROUND MUSIC — retro pixel loop
// ═══════════════════════════════════════
//  A dreamy, gentle chiptune melody that loops.
//  Uses square + triangle waves at low volume.

let bgmPlaying = false;
let bgmTimeout: number | null = null;

// Notes in Hz — a gentle pentatonic melody in C major
// Each entry: [freq, duration in beats, wave type]
type NoteEntry = [number, number, OscillatorType];

const BPM = 100;
const BEAT = 60 / BPM;
const VOL = 0.035; // quiet!

// Melody line (square wave, higher)
const melody: NoteEntry[] = [
  [523, 1, 'square'],    // C5
  [587, 1, 'square'],    // D5
  [659, 2, 'square'],    // E5
  [587, 1, 'square'],    // D5
  [523, 1, 'square'],    // C5
  [440, 2, 'square'],    // A4
  [0, 1, 'square'],      // rest
  [494, 1, 'square'],    // B4
  [523, 1, 'square'],    // C5
  [659, 1, 'square'],    // E5
  [587, 2, 'square'],    // D5
  [523, 1, 'square'],    // C5
  [440, 1, 'square'],    // A4
  [392, 2, 'square'],    // G4

  [0, 1, 'square'],      // rest
  [440, 1, 'square'],    // A4
  [523, 1, 'square'],    // C5
  [587, 1, 'square'],    // D5
  [659, 2, 'square'],    // E5
  [784, 1, 'square'],    // G5
  [659, 1, 'square'],    // E5
  [587, 1, 'square'],    // D5
  [523, 3, 'square'],    // C5 (hold)
  [0, 2, 'square'],      // rest
];

// Bass line (triangle wave, lower, simple root notes)
const bass: NoteEntry[] = [
  [131, 2, 'triangle'],  // C3
  [0, 2, 'triangle'],
  [131, 2, 'triangle'],  // C3
  [0, 2, 'triangle'],
  [110, 2, 'triangle'],  // A2
  [0, 2, 'triangle'],
  [110, 2, 'triangle'],  // A2
  [0, 2, 'triangle'],
  [98, 2, 'triangle'],   // G2
  [0, 2, 'triangle'],
  [98, 2, 'triangle'],   // G2
  [0, 2, 'triangle'],
  [131, 2, 'triangle'],  // C3
  [0, 2, 'triangle'],
  [131, 4, 'triangle'],  // C3 (hold)
  [0, 2, 'triangle'],
];

function playLine(notes: NoteEntry[], vol: number) {
  const ac = getCtx();
  let offset = 0;

  for (const [freq, beats, type] of notes) {
    if (freq > 0) {
      const dur = beats * BEAT * 0.85; // slightly shorter for staccato
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ac.destination);

      const t = ac.currentTime + offset;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.setValueAtTime(vol, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
    offset += beats * BEAT;
  }
  return offset;
}

function loopBgm() {
  if (!bgmPlaying) return;

  const melodyDur = playLine(melody, VOL);
  playLine(bass, VOL * 0.8);

  // Schedule next loop slightly before this one ends
  const loopMs = melodyDur * 1000;
  bgmTimeout = window.setTimeout(loopBgm, loopMs);
}

export function startBgm() {
  if (bgmPlaying) return;
  bgmPlaying = true;
  loopBgm();
}

export function stopBgm() {
  bgmPlaying = false;
  if (bgmTimeout !== null) {
    clearTimeout(bgmTimeout);
    bgmTimeout = null;
  }
}

export function isBgmPlaying() {
  return bgmPlaying;
}
