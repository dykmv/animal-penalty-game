// ═══════════════════════════════════════════════════
//  PIXEL-ART PORTRAITS — face close-ups for each character
//  Used in: character select, scoreboard, emotion reactions, award ceremony
//
//  Each portrait is drawn on a small offscreen canvas and cached.
//  Emotions: 'neutral' | 'happy' | 'sad'
// ═══════════════════════════════════════════════════

import type { Character } from './types';

type Emotion = 'neutral' | 'happy' | 'sad';

const PORTRAIT_SIZE = 32; // px, square
const cache = new Map<string, HTMLCanvasElement>();

function getCacheKey(charId: string, emotion: Emotion): string {
  return `${charId}:${emotion}`;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

// ── Generic face builder ──
function buildPortrait(ch: Character, emotion: Emotion): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = PORTRAIT_SIZE;
  cv.height = PORTRAIT_SIZE;
  const ctx = cv.getContext('2d')!;
  const c = ch.colors;
  const S = PORTRAIT_SIZE;

  // Background circle / frame
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = c.primary + '44';
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 14, 0, Math.PI * 2);
  ctx.fill();

  // Head (large, centered)
  const hx = 8, hy = 8, hw = 16, hh = 16;
  px(ctx, hx, hy, hw, hh, c.skin);

  // Ears
  drawEars(ctx, ch, hx, hy, hw);

  // Headgear
  drawHeadgear(ctx, ch, hx, hy, hw);

  // Eyes
  drawEyes(ctx, emotion, hx, hy, hw, hh);

  // Mouth
  drawMouth(ctx, emotion, hx, hy, hw, hh);

  // Nose (small dot)
  if (ch.earType === 'cat' || ch.earType === 'fox') {
    px(ctx, 15, 17, 2, 1, '#FF8888');
  } else if (ch.earType === 'bear') {
    px(ctx, 14, 17, 4, 2, c.ear);
  } else if (ch.earType === 'owl') {
    px(ctx, 15, 17, 2, 2, '#DAA520');
  }

  // Whiskers for cat/fox
  if (ch.earType === 'cat' || ch.earType === 'fox') {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    px(ctx, 6, 18, 4, 1, 'rgba(255,255,255,0.3)');
    px(ctx, 22, 18, 4, 1, 'rgba(255,255,255,0.3)');
    px(ctx, 7, 20, 3, 1, 'rgba(255,255,255,0.3)');
    px(ctx, 22, 20, 3, 1, 'rgba(255,255,255,0.3)');
  }

  // Border glow
  ctx.strokeStyle = c.primary;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, 15, 0, Math.PI * 2);
  ctx.stroke();

  return cv;
}

function drawEars(ctx: CanvasRenderingContext2D, ch: Character, hx: number, hy: number, hw: number) {
  const c = ch.colors;
  switch (ch.earType) {
    case 'cat':
      // Triangular
      px(ctx, hx - 2, hy - 4, 5, 6, c.skin);
      px(ctx, hx + hw - 3, hy - 4, 5, 6, c.skin);
      px(ctx, hx - 1, hy - 3, 3, 4, c.ear);
      px(ctx, hx + hw - 2, hy - 3, 3, 4, c.ear);
      break;
    case 'bunny':
      // Long
      px(ctx, hx + 2, hy - 10, 4, 12, c.skin);
      px(ctx, hx + hw - 6, hy - 10, 4, 12, c.skin);
      px(ctx, hx + 3, hy - 8, 2, 8, c.ear);
      px(ctx, hx + hw - 5, hy - 8, 2, 8, c.ear);
      break;
    case 'bear':
      // Round
      px(ctx, hx - 3, hy - 1, 5, 5, c.skin);
      px(ctx, hx + hw - 2, hy - 1, 5, 5, c.skin);
      px(ctx, hx - 2, hy, 3, 3, c.ear);
      px(ctx, hx + hw - 1, hy, 3, 3, c.ear);
      break;
    case 'wolf':
      // Pointed
      px(ctx, hx - 2, hy - 5, 4, 7, c.skin);
      px(ctx, hx + hw - 2, hy - 5, 4, 7, c.skin);
      px(ctx, hx - 1, hy - 3, 2, 4, c.ear);
      px(ctx, hx + hw - 1, hy - 3, 2, 4, c.ear);
      break;
    case 'fox':
      // Large pointed
      px(ctx, hx - 3, hy - 5, 5, 7, c.ear);
      px(ctx, hx + hw - 2, hy - 5, 5, 7, c.ear);
      px(ctx, hx - 2, hy - 3, 3, 4, c.skin);
      px(ctx, hx + hw - 1, hy - 3, 3, 4, c.skin);
      break;
    case 'owl':
      // Tufts
      px(ctx, hx - 1, hy - 3, 3, 4, c.ear);
      px(ctx, hx + hw - 2, hy - 3, 3, 4, c.ear);
      break;
  }
}

function drawHeadgear(ctx: CanvasRenderingContext2D, ch: Character, hx: number, hy: number, hw: number) {
  const c = ch.colors;
  switch (ch.headgear) {
    case 'tiara':
      px(ctx, hx + 3, hy - 1, hw - 6, 2, c.accent);
      px(ctx, hx + hw / 2 - 1, hy - 3, 2, 3, c.accent);
      break;
    case 'crown':
      px(ctx, hx + 1, hy - 2, hw - 2, 3, c.accent);
      px(ctx, hx + 2, hy - 4, 2, 2, c.accent);
      px(ctx, hx + hw / 2 - 1, hy - 5, 2, 3, c.accent);
      px(ctx, hx + hw - 4, hy - 4, 2, 2, c.accent);
      break;
    case 'helmet':
      px(ctx, hx - 1, hy - 1, hw + 2, 6, c.accent);
      px(ctx, hx + hw / 2 - 2, hy - 3, 4, 3, c.accent);
      break;
    case 'hood':
      px(ctx, hx - 1, hy - 1, hw + 2, 7, c.primary);
      break;
    case 'hat':
      px(ctx, hx, hy - 1, hw, 3, c.primary);
      px(ctx, hx + 3, hy - 5, hw - 6, 5, c.primary);
      px(ctx, hx + hw / 2 - 1, hy - 7, 2, 3, c.accent);
      break;
    case 'none':
      break;
  }
}

function drawEyes(ctx: CanvasRenderingContext2D, emotion: Emotion, hx: number, hy: number, hw: number, _hh: number) {
  const ex1 = hx + 3;
  const ex2 = hx + hw - 6;
  const ey = hy + 6;

  if (emotion === 'happy') {
    // Happy: ^ ^ arched closed eyes
    px(ctx, ex1, ey, 3, 1, '#111');
    px(ctx, ex1, ey - 1, 1, 1, '#111');
    px(ctx, ex1 + 2, ey - 1, 1, 1, '#111');
    px(ctx, ex2, ey, 3, 1, '#111');
    px(ctx, ex2, ey - 1, 1, 1, '#111');
    px(ctx, ex2 + 2, ey - 1, 1, 1, '#111');
  } else if (emotion === 'sad') {
    // Sad: open eyes with tear
    px(ctx, ex1, ey, 3, 3, '#FFF');
    px(ctx, ex1 + 1, ey + 1, 2, 2, '#111');
    px(ctx, ex2, ey, 3, 3, '#FFF');
    px(ctx, ex2 + 1, ey + 1, 2, 2, '#111');
    // Tear drop
    px(ctx, ex1 + 3, ey + 3, 1, 2, '#88CCFF');
    px(ctx, ex1 + 3, ey + 5, 1, 1, '#88CCFF');
  } else {
    // Neutral: open round eyes
    px(ctx, ex1, ey, 3, 3, '#FFF');
    px(ctx, ex1 + 1, ey + 1, 2, 2, '#111');
    px(ctx, ex2, ey, 3, 3, '#FFF');
    px(ctx, ex2 + 1, ey + 1, 2, 2, '#111');
    // Eye shine
    px(ctx, ex1 + 1, ey, 1, 1, '#FFF');
    px(ctx, ex2 + 1, ey, 1, 1, '#FFF');
  }
}

function drawMouth(ctx: CanvasRenderingContext2D, emotion: Emotion, hx: number, _hy: number, hw: number, _hh: number) {
  const mx = hx + hw / 2;
  const my = 21;

  if (emotion === 'happy') {
    // Big smile
    px(ctx, mx - 3, my, 6, 1, '#111');
    px(ctx, mx - 4, my - 1, 1, 1, '#111');
    px(ctx, mx + 3, my - 1, 1, 1, '#111');
    // Tongue
    px(ctx, mx - 1, my + 1, 2, 1, '#FF6B6B');
  } else if (emotion === 'sad') {
    // Frown
    px(ctx, mx - 2, my + 1, 4, 1, '#111');
    px(ctx, mx - 3, my, 1, 1, '#111');
    px(ctx, mx + 2, my, 1, 1, '#111');
  } else {
    // Neutral small mouth
    px(ctx, mx - 1, my, 3, 1, '#111');
  }
}

// ═══════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════

/** Get cached portrait canvas for a character + emotion */
export function getPortrait(ch: Character, emotion: Emotion = 'neutral'): HTMLCanvasElement {
  const key = getCacheKey(ch.id, emotion);
  let cv = cache.get(key);
  if (!cv) {
    cv = buildPortrait(ch, emotion);
    cache.set(key, cv);
  }
  return cv;
}

/** Draw portrait at position, scaled */
export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  ch: Character,
  x: number,
  y: number,
  size: number,
  emotion: Emotion = 'neutral',
) {
  const cv = getPortrait(ch, emotion);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, Math.round(x), Math.round(y), Math.round(size), Math.round(size));
}

/** Draw large close-up emotion face (centered on screen) */
export function drawEmotionCloseup(
  ctx: CanvasRenderingContext2D,
  ch: Character,
  emotion: Emotion,
  canvasW: number,
  canvasH: number,
  alpha: number = 1,
) {
  const size = 80;
  const x = (canvasW - size) / 2;
  const y = (canvasH - size) / 2 - 16;

  ctx.globalAlpha = alpha;

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Glow behind portrait
  const glow = ctx.createRadialGradient(canvasW / 2, canvasH / 2 - 16, 10, canvasW / 2, canvasH / 2 - 16, 60);
  glow.addColorStop(0, ch.colors.primary + '66');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvasW, canvasH);

  drawPortrait(ctx, ch, x, y, size, emotion);

  ctx.globalAlpha = 1;
}

/** Draw the award ceremony scene */
export function drawAwardCeremony(
  ctx: CanvasRenderingContext2D,
  winner: Character,
  loser: Character,
  canvasW: number,
  canvasH: number,
  animProgress: number, // 0 to 1
) {
  // Dark purple gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg.addColorStop(0, '#2D1B69');
  bg.addColorStop(0.5, '#1A0A2E');
  bg.addColorStop(1, '#0D0518');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Sparkle particles
  const sparkleCount = 20;
  const time = animProgress * 6;
  ctx.fillStyle = '#FFD700';
  for (let i = 0; i < sparkleCount; i++) {
    const sx = ((i * 97 + time * 40) % canvasW);
    const sy = ((i * 53 + Math.sin(time + i) * 20) % (canvasH - 40)) + 10;
    const sz = (Math.sin(time * 2 + i * 0.7) + 1) * 1.5;
    if (sz > 0.5) {
      px(ctx, sx, sy, Math.ceil(sz), Math.ceil(sz), i % 3 === 0 ? '#FFD700' : '#FFF');
    }
  }

  // Podium
  const podiumY = canvasH - 60;

  // 1st place podium (center, tall)
  const p1x = canvasW / 2 - 30;
  px(ctx, p1x, podiumY - 40, 60, 50, '#FFD700');
  px(ctx, p1x + 2, podiumY - 38, 56, 46, '#DAA520');
  // "1" label
  ctx.fillStyle = '#FFF';
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('1', canvasW / 2, podiumY - 4);

  // 2nd place podium (right, shorter)
  const p2x = canvasW / 2 + 34;
  px(ctx, p2x, podiumY - 16, 50, 26, '#C0C0C0');
  px(ctx, p2x + 2, podiumY - 14, 46, 22, '#A9A9A9');
  ctx.fillText('2', p2x + 25, podiumY - 2);

  // Trophy above winner (animated drop-in)
  const trophyDrop = Math.min(animProgress * 2, 1);
  const trophyY = podiumY - 40 - 50 + (1 - easeOutBounce(trophyDrop)) * -60;
  if (animProgress > 0.1) {
    drawTrophy(ctx, canvasW / 2 - 10, trophyY, 20, Math.min(animProgress * 1.5, 1));
  }

  // Winner on 1st place
  const winnerScale = Math.min(animProgress * 3, 1);
  if (winnerScale > 0) {
    const ws = 48 * winnerScale;
    drawPortrait(ctx, winner, canvasW / 2 - ws / 2, podiumY - 40 - ws - 4, ws, 'happy');
  }

  // Loser on 2nd place
  const loserScale = Math.min(Math.max(animProgress - 0.3, 0) * 3, 1);
  if (loserScale > 0) {
    const ls = 36 * loserScale;
    drawPortrait(ctx, loser, p2x + 25 - ls / 2, podiumY - 16 - ls - 2, ls, 'sad');
  }

  // Title text (fade in)
  const textAlpha = Math.min(Math.max(animProgress - 0.5, 0) * 3, 1);
  if (textAlpha > 0) {
    ctx.globalAlpha = textAlpha;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('ЧЕМПИОН!', canvasW / 2, 24);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#C850C0';
    ctx.fillText(winner.name, canvasW / 2, 40);
    ctx.globalAlpha = 1;
  }
}

function drawTrophy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
  ctx.globalAlpha = alpha;
  const s = size / 20; // scale factor

  // Cup body
  ctx.fillStyle = '#FFD700';
  px(ctx, x + 4 * s, y, 12 * s, 3 * s, '#FFD700');      // rim
  px(ctx, x + 3 * s, y + 3 * s, 14 * s, 8 * s, '#FFD700'); // bowl
  px(ctx, x + 5 * s, y + 11 * s, 10 * s, 2 * s, '#FFD700'); // taper
  px(ctx, x + 7 * s, y + 13 * s, 6 * s, 2 * s, '#FFD700');  // stem

  // Handles
  px(ctx, x + 1 * s, y + 4 * s, 3 * s, 5 * s, '#FFD700');
  px(ctx, x + 16 * s, y + 4 * s, 3 * s, 5 * s, '#FFD700');

  // Base
  px(ctx, x + 5 * s, y + 15 * s, 10 * s, 2 * s, '#DAA520');
  px(ctx, x + 3 * s, y + 17 * s, 14 * s, 3 * s, '#DAA520');

  // Shine
  px(ctx, x + 6 * s, y + 4 * s, 2 * s, 5 * s, '#FFEC8B');

  // Star on cup
  px(ctx, x + 9 * s, y + 5 * s, 2 * s, 2 * s, '#FFF');

  ctx.globalAlpha = 1;
}

function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    const t2 = t - 1.5 / 2.75;
    return 7.5625 * t2 * t2 + 0.75;
  } else if (t < 2.5 / 2.75) {
    const t2 = t - 2.25 / 2.75;
    return 7.5625 * t2 * t2 + 0.9375;
  } else {
    const t2 = t - 2.625 / 2.75;
    return 7.5625 * t2 * t2 + 0.984375;
  }
}

export { PORTRAIT_SIZE };
export type { Emotion };
