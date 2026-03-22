import type { Character, DiveDir, GameState, Particle } from './types';
import {
  W, H,
  GOAL_L, GOAL_R, GOAL_T, GOAL_B, GOAL_W, GOAL_H,
  BALL_START_X, BALL_START_Y,
  SHOOTER_X, SHOOTER_Y,
  KEEPER_X, KEEPER_Y,
} from './types';

// ─── Helpers ───────────────────────────────────────
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOut(t: number) {
  return 1 - (1 - t) * (1 - t);
}

// ═══════════════════════════════════════════════════
//  BACKGROUND — dreamy pink/purple sky
// ═══════════════════════════════════════════════════
const STARS = [
  [30, 12], [80, 25], [150, 8], [200, 30], [280, 15], [340, 22],
  [55, 40], [310, 38], [175, 20], [250, 10], [120, 35], [360, 45],
  [15, 50], [230, 18], [70, 55], [290, 42], [185, 48], [45, 28],
];

export function drawBackground(ctx: CanvasRenderingContext2D) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 100);
  grad.addColorStop(0, '#FF6B9D');
  grad.addColorStop(0.25, '#C850C0');
  grad.addColorStop(0.55, '#6A0572');
  grad.addColorStop(1, '#2D1B69');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 100);

  // Stars
  for (const [sx, sy] of STARS) {
    const bright = ((sx * 7 + sy * 13) % 3 === 0) ? '#FFFFFF' : '#FFE4FF';
    const size = ((sx + sy) % 5 === 0) ? 2 : 1;
    px(ctx, sx, sy, size, size, bright);
  }

  // Crescent moon
  ctx.fillStyle = '#FFF0F5';
  ctx.beginPath();
  ctx.arc(320, 28, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6A0572';
  ctx.beginPath();
  ctx.arc(324, 25, 9, 0, Math.PI * 2);
  ctx.fill();

  // Mountains silhouette
  ctx.fillStyle = '#1A0A2E';
  drawMountain(ctx, -20, 100, 100, 48);
  drawMountain(ctx, 70, 100, 180, 58);
  drawMountain(ctx, 200, 100, 150, 45);
  drawMountain(ctx, 300, 100, 120, 40);

  // Castle silhouette on the tallest mountain
  ctx.fillStyle = '#1A0A2E';
  px(ctx, 148, 42, 28, 30, '#1A0A2E');
  // towers
  px(ctx, 144, 34, 6, 16, '#1A0A2E');
  px(ctx, 168, 32, 6, 18, '#1A0A2E');
  px(ctx, 155, 36, 4, 12, '#1A0A2E');
  // tower tips
  px(ctx, 145, 32, 4, 3, '#1A0A2E');
  px(ctx, 169, 30, 4, 3, '#1A0A2E');
  px(ctx, 156, 34, 2, 3, '#1A0A2E');
  // windows (glowing)
  px(ctx, 152, 52, 2, 3, '#FFB6C1');
  px(ctx, 160, 48, 2, 3, '#FFB6C1');
  px(ctx, 167, 52, 2, 3, '#FFB6C1');

  // Horizon glow
  const glow = ctx.createLinearGradient(0, 85, 0, 100);
  glow.addColorStop(0, 'rgba(255, 150, 200, 0.3)');
  glow.addColorStop(1, 'rgba(255, 150, 200, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 85, W, 15);
}

function drawMountain(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x + w * 0.4, base - h);
  ctx.lineTo(x + w * 0.6, base - h + 5);
  ctx.lineTo(x + w, base);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════
//  FIELD
// ═══════════════════════════════════════════════════
export function drawField(ctx: CanvasRenderingContext2D) {
  // Green field with gradient
  const fg = ctx.createLinearGradient(0, 95, 0, H);
  fg.addColorStop(0, '#1B5E20');
  fg.addColorStop(0.5, '#2E7D32');
  fg.addColorStop(1, '#1B5E20');
  ctx.fillStyle = fg;
  ctx.fillRect(0, 95, W, H - 95);

  // Darker horizontal stripes
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 98; y < H; y += 10) {
    ctx.fillRect(0, y, W, 5);
  }

  // Penalty area (perspective trapezoid)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(105, 100);
  ctx.lineTo(82, 214);
  ctx.lineTo(302, 214);
  ctx.lineTo(279, 100);
  ctx.closePath();
  ctx.stroke();

  // Penalty spot
  px(ctx, 190, 176, 4, 4, '#FFFFFF');
}

// ═══════════════════════════════════════════════════
//  GOAL
// ═══════════════════════════════════════════════════
export function drawGoal(ctx: CanvasRenderingContext2D) {
  // Net background
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(GOAL_L + 3, GOAL_T - 8, GOAL_W - 6, 10);

  // Net lines
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let x = GOAL_L + 10; x < GOAL_R; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, GOAL_T + 4);
    ctx.lineTo(x, GOAL_B);
    ctx.stroke();
  }
  for (let y = GOAL_T + 10; y < GOAL_B; y += 8) {
    ctx.beginPath();
    ctx.moveTo(GOAL_L + 4, y);
    ctx.lineTo(GOAL_R - 4, y);
    ctx.stroke();
  }

  // Posts
  px(ctx, GOAL_L, GOAL_T, 4, GOAL_H, '#FFFFFF');
  px(ctx, GOAL_R - 4, GOAL_T, 4, GOAL_H, '#FFFFFF');
  // Crossbar
  px(ctx, GOAL_L, GOAL_T, GOAL_W, 4, '#FFFFFF');

  // Post shine
  px(ctx, GOAL_L + 1, GOAL_T + 1, 1, GOAL_H - 2, 'rgba(255,255,255,0.4)');
  px(ctx, GOAL_R - 2, GOAL_T + 1, 1, GOAL_H - 2, 'rgba(255,255,255,0.4)');
}

// ═══════════════════════════════════════════════════
//  CHARACTER DRAWING — Generic pixel-art sprites
// ═══════════════════════════════════════════════════

// ── Back view (shooter) ──
export function drawCharBack(
  ctx: CanvasRenderingContext2D,
  ch: Character,
  x: number,
  y: number,
  kickProgress: number, // 0=idle, 0-1=kicking
) {
  const c = ch.colors;
  const kicking = kickProgress > 0;
  const leanY = kicking ? -Math.sin(kickProgress * Math.PI) * 4 : 0;

  // Legs
  px(ctx, x - 5, y + 2, 4, 12, c.primary === c.skin ? '#333' : '#333');
  px(ctx, x + 1, y + 2 + (kicking ? -4 : 0), 4, 12 + (kicking ? -2 : 0), '#333');

  // Body
  const bodyW = 16;
  const bodyH = 16;
  px(ctx, x - bodyW / 2, y - bodyH + leanY, bodyW, bodyH, c.primary);
  // Secondary trim
  if (ch.bodyType === 'dress') {
    px(ctx, x - bodyW / 2, y - 4 + leanY, bodyW, 6, c.secondary);
  } else if (ch.bodyType === 'armor') {
    px(ctx, x - bodyW / 2 + 2, y - bodyH + 2 + leanY, bodyW - 4, 4, c.accent);
  } else {
    px(ctx, x - bodyW / 2 + 1, y - bodyH + leanY, bodyW - 2, 3, c.secondary);
  }

  // Arms
  px(ctx, x - bodyW / 2 - 3, y - bodyH + 4 + leanY, 3, 10, c.skin);
  px(ctx, x + bodyW / 2, y - bodyH + 4 + leanY, 3, 10, c.skin);

  // Tail
  if (ch.hasTail) {
    px(ctx, x + bodyW / 2 + 1, y - 6 + leanY, 3, 2, c.skin);
    px(ctx, x + bodyW / 2 + 3, y - 8 + leanY, 2, 3, c.skin);
  }

  // Neck
  px(ctx, x - 3, y - bodyH - 2 + leanY, 6, 3, c.skin);

  // Head
  const headY = y - bodyH - 12 + leanY;
  px(ctx, x - 6, headY, 12, 10, c.skin);

  // Hair / back of head detail
  px(ctx, x - 6, headY, 12, 4, c.ear);

  // Ears
  drawEarsBack(ctx, ch, x, headY);

  // Headgear
  drawHeadgearBack(ctx, ch, x, headY);

  // Jersey number
  ctx.fillStyle = '#FFF';
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('10', x, y - 6 + leanY);
}

function drawEarsBack(ctx: CanvasRenderingContext2D, ch: Character, x: number, headY: number) {
  const c = ch.colors;
  switch (ch.earType) {
    case 'cat':
      // Triangular cat ears
      px(ctx, x - 7, headY - 4, 4, 5, c.skin);
      px(ctx, x + 3, headY - 4, 4, 5, c.skin);
      px(ctx, x - 6, headY - 3, 2, 3, c.ear);
      px(ctx, x + 4, headY - 3, 2, 3, c.ear);
      break;
    case 'bunny':
      // Long bunny ears
      px(ctx, x - 5, headY - 12, 3, 13, c.skin);
      px(ctx, x + 2, headY - 12, 3, 13, c.skin);
      px(ctx, x - 4, headY - 10, 1, 8, c.ear);
      px(ctx, x + 3, headY - 10, 1, 8, c.ear);
      break;
    case 'bear':
      // Round bear ears
      px(ctx, x - 7, headY - 2, 4, 4, c.skin);
      px(ctx, x + 3, headY - 2, 4, 4, c.skin);
      px(ctx, x - 6, headY - 1, 2, 2, c.ear);
      px(ctx, x + 4, headY - 1, 2, 2, c.ear);
      break;
    case 'wolf':
      // Pointed wolf ears
      px(ctx, x - 7, headY - 5, 3, 6, c.skin);
      px(ctx, x + 4, headY - 5, 3, 6, c.skin);
      px(ctx, x - 6, headY - 3, 1, 3, c.ear);
      px(ctx, x + 5, headY - 3, 1, 3, c.ear);
      break;
    case 'fox':
      // Large pointed fox ears
      px(ctx, x - 7, headY - 6, 4, 7, c.ear);
      px(ctx, x + 3, headY - 6, 4, 7, c.ear);
      px(ctx, x - 6, headY - 4, 2, 4, c.skin);
      px(ctx, x + 4, headY - 4, 2, 4, c.skin);
      break;
    case 'owl':
      // No visible ears, tufts
      px(ctx, x - 6, headY - 2, 2, 3, c.ear);
      px(ctx, x + 4, headY - 2, 2, 3, c.ear);
      break;
  }
}

function drawHeadgearBack(ctx: CanvasRenderingContext2D, ch: Character, x: number, headY: number) {
  const c = ch.colors;
  switch (ch.headgear) {
    case 'tiara':
      px(ctx, x - 4, headY - 1, 8, 2, c.accent);
      px(ctx, x - 1, headY - 3, 2, 2, c.accent);
      break;
    case 'crown':
      px(ctx, x - 5, headY - 2, 10, 3, c.accent);
      px(ctx, x - 4, headY - 4, 2, 2, c.accent);
      px(ctx, x - 1, headY - 5, 2, 3, c.accent);
      px(ctx, x + 2, headY - 4, 2, 2, c.accent);
      break;
    case 'helmet':
      px(ctx, x - 7, headY - 1, 14, 6, c.accent);
      px(ctx, x - 2, headY - 3, 4, 3, c.accent);
      break;
    case 'hood':
      px(ctx, x - 7, headY - 1, 14, 8, c.primary);
      px(ctx, x - 3, headY - 3, 6, 3, c.primary);
      break;
    case 'hat':
      px(ctx, x - 5, headY - 1, 10, 3, c.primary);
      px(ctx, x - 3, headY - 6, 6, 6, c.primary);
      px(ctx, x - 1, headY - 8, 2, 3, c.accent);
      break;
    case 'none':
      break;
  }
}

// ── Front view (goalkeeper) — smaller since farther away ──
export function drawCharFront(
  ctx: CanvasRenderingContext2D,
  ch: Character,
  x: number,
  y: number,
  diveDir: DiveDir | null,
  diveProgress: number,
) {
  const c = ch.colors;
  const S = 0.65; // scale factor (goalkeeper is smaller / farther)

  let offsetX = 0;
  let offsetY = 0;
  if (diveDir && diveProgress > 0) {
    const t = easeOut(Math.min(diveProgress, 1));
    if (diveDir === 'left') offsetX = -t * 28;
    else if (diveDir === 'right') offsetX = t * 28;
    offsetY = -t * 6;
    // arms spread during dive
  }

  const dx = x + offsetX;
  const dy = y + offsetY;

  // Legs
  px(ctx, dx - 3 * S, dy + 1, 3 * S, 7 * S, '#333');
  px(ctx, dx + 1, dy + 1, 3 * S, 7 * S, '#333');

  // Body
  const bw = 10 * S;
  const bh = 10 * S;
  px(ctx, dx - bw / 2, dy - bh, bw, bh, c.primary);

  // Goalkeeper gloves
  const armSpread = diveDir && diveProgress > 0 ? easeOut(diveProgress) * 6 : 0;
  px(ctx, dx - bw / 2 - 2 - armSpread, dy - bh + 2, 3, 6 * S, '#FFD700');
  px(ctx, dx + bw / 2 - 1 + armSpread, dy - bh + 2, 3, 6 * S, '#FFD700');

  // Head
  const headS = 8 * S;
  const headY = dy - bh - headS + 1;
  px(ctx, dx - headS / 2, headY, headS, headS, c.skin);

  // Eyes
  px(ctx, dx - 2, headY + 3, 2, 2, '#111');
  px(ctx, dx + 1, headY + 3, 2, 2, '#111');

  // Ears (simplified front view)
  switch (ch.earType) {
    case 'cat':
    case 'fox':
      px(ctx, dx - headS / 2 - 2, headY - 1, 3, 4, c.ear);
      px(ctx, dx + headS / 2 - 1, headY - 1, 3, 4, c.ear);
      break;
    case 'bunny':
      px(ctx, dx - 3, headY - 8, 2, 9, c.skin);
      px(ctx, dx + 1, headY - 8, 2, 9, c.skin);
      break;
    case 'bear':
      px(ctx, dx - headS / 2 - 1, headY, 3, 3, c.ear);
      px(ctx, dx + headS / 2 - 2, headY, 3, 3, c.ear);
      break;
    case 'wolf':
      px(ctx, dx - headS / 2 - 1, headY - 2, 3, 4, c.ear);
      px(ctx, dx + headS / 2 - 2, headY - 2, 3, 4, c.ear);
      break;
    case 'owl':
      px(ctx, dx - headS / 2 - 1, headY + 1, 2, 2, c.ear);
      px(ctx, dx + headS / 2 - 1, headY + 1, 2, 2, c.ear);
      break;
  }
}

// ═══════════════════════════════════════════════════
//  BALL
// ═══════════════════════════════════════════════════
export function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 4) {
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), size, 0, Math.PI * 2);
  ctx.fill();
  // Pentagon pattern
  ctx.fillStyle = '#333';
  px(ctx, x - 1, y - 2, 2, 2, '#333');
  px(ctx, x + 1, y + 1, 1, 1, '#333');
}

// ═══════════════════════════════════════════════════
//  UI OVERLAY
// ═══════════════════════════════════════════════════
export function drawScoreboard(
  ctx: CanvasRenderingContext2D,
  playerEmoji: string,
  aiEmoji: string,
  playerScore: number,
  aiScore: number,
  round: number,
  maxRounds: number,
) {
  // Background bar
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, 20);

  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';

  // Player score (left)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`${playerEmoji} ${playerScore}`, 6, 5);

  // Round (center)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFF';
  ctx.fillText(`${round}/${maxRounds}`, W / 2, 5);

  // AI score (right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`${aiScore} ${aiEmoji}`, W - 6, 5);
}

export function drawInstruction(ctx: CanvasRenderingContext2D, text: string) {
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Background
  const tw = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(W / 2 - tw / 2, 22, tw, 14);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, W / 2, 25);
}

export function drawPhaseLabel(ctx: CanvasRenderingContext2D, isPlayerShooting: boolean) {
  const label = isPlayerShooting ? 'УДАР' : 'ЗАЩИТА';
  const color = isPlayerShooting ? '#FF6B9D' : '#6BCB77';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(label, W / 2, H - 8);
}

// ═══════════════════════════════════════════════════
//  AIM CROSSHAIR — when player is shooting
// ═══════════════════════════════════════════════════
export function drawCrosshair(ctx: CanvasRenderingContext2D, mx: number, my: number, inGoal: boolean) {
  if (!inGoal) return;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1;
  // Cross
  ctx.beginPath();
  ctx.moveTo(mx - 6, my);
  ctx.lineTo(mx + 6, my);
  ctx.moveTo(mx, my - 6);
  ctx.lineTo(mx, my + 6);
  ctx.stroke();
  // Circle
  ctx.beginPath();
  ctx.arc(mx, my, 5, 0, Math.PI * 2);
  ctx.stroke();
}

// ═══════════════════════════════════════════════════
//  DIVE ZONES — when player is goalkeeper
// ═══════════════════════════════════════════════════
export function drawDiveZones(ctx: CanvasRenderingContext2D, hoverZone: DiveDir | null) {
  const zones: { dir: DiveDir; x: number; label: string }[] = [
    { dir: 'left', x: GOAL_L + 4, label: '←' },
    { dir: 'center', x: GOAL_L + GOAL_W / 3 + 2, label: '↑' },
    { dir: 'right', x: GOAL_L + (GOAL_W * 2) / 3, label: '→' },
  ];
  const zw = GOAL_W / 3 - 4;

  for (const z of zones) {
    const hover = hoverZone === z.dir;
    ctx.fillStyle = hover ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.12)';
    ctx.fillRect(z.x, GOAL_T + 4, zw, GOAL_H - 8);

    ctx.strokeStyle = hover ? '#FFD700' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(z.x, GOAL_T + 4, zw, GOAL_H - 8);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = hover ? '#FFD700' : 'rgba(255,255,255,0.5)';
    ctx.fillText(z.label, z.x + zw / 2, GOAL_T + GOAL_H / 2);
  }
}

// ═══════════════════════════════════════════════════
//  RESULT TEXT
// ═══════════════════════════════════════════════════
export function drawResultText(ctx: CanvasRenderingContext2D, result: 'goal' | 'save', isPlayerShooting: boolean) {
  let text: string;
  let color: string;

  if (result === 'goal') {
    text = isPlayerShooting ? 'ГОЛ!' : 'ГОЛ...';
    color = isPlayerShooting ? '#FFD700' : '#FF6B6B';
  } else {
    text = isPlayerShooting ? 'МИМО!' : 'ОТБИЛ!';
    color = isPlayerShooting ? '#FF6B6B' : '#6BCB77';
  }

  // Shadow
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillText(text, W / 2 + 2, H / 2 + 2);
  // Text
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, H / 2);
}

// ═══════════════════════════════════════════════════
//  PARTICLES (goal confetti)
// ═══════════════════════════════════════════════════
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    px(ctx, p.x, p.y, 3, 3, p.color);
  }
  ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════════════
//  FULL SCENE RENDER
// ═══════════════════════════════════════════════════
export function renderScene(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  playerChar: Character,
  opponentChar: Character,
) {
  const { shotPhase, isPlayerShooting, animTime, animDuration, shake } = state;

  // Screen shake offset
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 4 : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 4 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Background layers
  drawBackground(ctx);
  drawField(ctx);
  drawGoal(ctx);

  // Determine who's where
  const shooter = isPlayerShooting ? playerChar : opponentChar;
  const keeper = isPlayerShooting ? opponentChar : playerChar;

  // Animation progress
  const t = animDuration > 0 ? Math.min(animTime / animDuration, 1) : 0;

  // Goalkeeper
  const keeperDive = shotPhase === 'kicking' || shotPhase === 'result' ? state.keeperDive : null;
  const diveT = shotPhase === 'kicking' ? t : shotPhase === 'result' ? 1 : 0;
  drawCharFront(ctx, keeper, KEEPER_X, KEEPER_Y, keeperDive, diveT);

  // Ball
  if (shotPhase === 'aiming') {
    drawBall(ctx, BALL_START_X, BALL_START_Y);
  } else if (shotPhase === 'kicking' && state.shotTarget) {
    const et = easeOut(t);
    const bx = lerp(BALL_START_X, state.shotTarget.x, et);
    const by = lerp(BALL_START_Y, state.shotTarget.y, et) - Math.sin(t * Math.PI) * 20;
    const size = lerp(4, 3, et);
    drawBall(ctx, bx, by, size);
  } else if (shotPhase === 'result' && state.shotTarget && state.lastResult === 'goal') {
    drawBall(ctx, state.shotTarget.x, state.shotTarget.y, 3);
  }

  // Shooter (back view)
  const kickT = shotPhase === 'kicking' ? t : 0;
  drawCharBack(ctx, shooter, SHOOTER_X, SHOOTER_Y, kickT);

  // UI
  drawScoreboard(
    ctx,
    playerChar.emoji,
    opponentChar.emoji,
    state.playerScore,
    state.aiScore,
    state.round,
    state.maxRounds,
  );

  // Phase-specific overlays
  if (shotPhase === 'aiming') {
    if (isPlayerShooting) {
      drawInstruction(ctx, 'Нажми на ворота!');
      const inGoal =
        state.hoverX >= GOAL_L && state.hoverX <= GOAL_R &&
        state.hoverY >= GOAL_T && state.hoverY <= GOAL_B;
      drawCrosshair(ctx, state.hoverX, state.hoverY, inGoal);
    } else {
      drawInstruction(ctx, 'Куда прыгнешь?');
      // Determine hover zone
      let hoverZone: DiveDir | null = null;
      if (state.hoverY >= GOAL_T && state.hoverY <= GOAL_B &&
          state.hoverX >= GOAL_L && state.hoverX <= GOAL_R) {
        const nx = (state.hoverX - GOAL_L) / GOAL_W;
        if (nx < 0.33) hoverZone = 'left';
        else if (nx < 0.66) hoverZone = 'center';
        else hoverZone = 'right';
      }
      drawDiveZones(ctx, hoverZone);
    }
  }

  if (shotPhase === 'result' && state.lastResult) {
    drawResultText(ctx, state.lastResult, isPlayerShooting);
  }

  drawPhaseLabel(ctx, isPlayerShooting);

  // Particles
  if (state.particles.length > 0) {
    drawParticles(ctx, state.particles);
  }

  ctx.restore();
}
