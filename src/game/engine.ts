import type { Character, GameState, DiveDir } from './types';
import { W, H, GOAL_L, GOAL_R, GOAL_T, GOAL_B, GOAL_W, CHARACTERS } from './types';
import { renderScene } from './draw';

const CONFETTI_COLORS = ['#FFD700', '#FF69B4', '#C850C0', '#6BCB77', '#FF6B6B', '#FFF'];
const KICK_DURATION = 0.55; // seconds
const RESULT_DURATION = 1.6;
const TRANSITION_DURATION = 0.8;

export class PenaltyEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private playerChar: Character;
  private opponentChar: Character;
  private state: GameState;
  private rafId: number = 0;
  private lastTime: number = 0;
  private onFinish: (playerScore: number, aiScore: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    playerChar: Character,
    onFinish: (playerScore: number, aiScore: number) => void,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.playerChar = playerChar;
    this.onFinish = onFinish;

    // Pick a random opponent
    const others = CHARACTERS.filter((c) => c.id !== playerChar.id);
    this.opponentChar = others[Math.floor(Math.random() * others.length)];

    this.state = {
      shotPhase: 'aiming',
      round: 1,
      maxRounds: 5,
      playerScore: 0,
      aiScore: 0,
      isPlayerShooting: true,
      shotTarget: null,
      shotZone: null,
      keeperDive: null,
      lastResult: null,
      animTime: 0,
      animDuration: 0,
      resultTimer: 0,
      shake: 0,
      particles: [],
      hoverX: 0,
      hoverY: 0,
    };

    // Event handlers
    this.handleClick = this.handleClick.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.loop = this.loop.bind(this);
  }

  start() {
    this.canvas.addEventListener('click', this.handleClick);
    this.canvas.addEventListener('mousemove', this.handleMove);
    this.canvas.addEventListener('touchstart', this.handleTouch, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    this.canvas.removeEventListener('click', this.handleClick);
    this.canvas.removeEventListener('mousemove', this.handleMove);
    this.canvas.removeEventListener('touchstart', this.handleTouch);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
  }

  // ── Coordinate conversion ──
  private toCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  }

  // ── Input ──
  private handleMove(e: MouseEvent) {
    const p = this.toCanvas(e.clientX, e.clientY);
    this.state.hoverX = p.x;
    this.state.hoverY = p.y;
  }

  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    const p = this.toCanvas(t.clientX, t.clientY);
    this.state.hoverX = p.x;
    this.state.hoverY = p.y;
  }

  private handleTouch(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    const p = this.toCanvas(t.clientX, t.clientY);
    this.state.hoverX = p.x;
    this.state.hoverY = p.y;
    this.processClick(p.x, p.y);
  }

  private handleClick(e: MouseEvent) {
    const p = this.toCanvas(e.clientX, e.clientY);
    this.processClick(p.x, p.y);
  }

  private processClick(cx: number, cy: number) {
    if (this.state.shotPhase !== 'aiming') return;

    const inGoal = cx >= GOAL_L && cx <= GOAL_R && cy >= GOAL_T && cy <= GOAL_B;

    if (this.state.isPlayerShooting) {
      if (!inGoal) return;

      // Determine shot zone
      const nx = (cx - GOAL_L) / GOAL_W;
      const zone: DiveDir = nx < 0.33 ? 'left' : nx < 0.66 ? 'center' : 'right';

      // AI keeper dives (slightly biased to make kid win more)
      const aiDive = this.randomDive(true);

      this.state.shotTarget = { x: cx, y: cy };
      this.state.shotZone = zone;
      this.state.keeperDive = aiDive;
      this.state.shotPhase = 'kicking';
      this.state.animTime = 0;
      this.state.animDuration = KICK_DURATION;

      // Check result
      this.state.lastResult = zone === aiDive ? 'save' : 'goal';
    } else {
      // Player is goalkeeper — click to choose dive direction
      if (!inGoal) return;

      const nx = (cx - GOAL_L) / GOAL_W;
      const playerDive: DiveDir = nx < 0.33 ? 'left' : nx < 0.66 ? 'center' : 'right';

      // AI shoots randomly
      const aiShot = this.randomDive(false);
      const aiTarget = this.zoneToTarget(aiShot);

      this.state.shotTarget = aiTarget;
      this.state.shotZone = aiShot;
      this.state.keeperDive = playerDive;
      this.state.shotPhase = 'kicking';
      this.state.animTime = 0;
      this.state.animDuration = KICK_DURATION;

      this.state.lastResult = aiShot === playerDive ? 'save' : 'goal';
    }
  }

  private randomDive(dumb: boolean): DiveDir {
    const dirs: DiveDir[] = ['left', 'center', 'right'];
    if (dumb) {
      // AI keeper: only picks correctly ~28% of the time
      // Biased towards center (kids tend to shoot to sides)
      const weights = [0.3, 0.4, 0.3];
      const r = Math.random();
      if (r < weights[0]) return 'left';
      if (r < weights[0] + weights[1]) return 'center';
      return 'right';
    }
    return dirs[Math.floor(Math.random() * 3)];
  }

  private zoneToTarget(zone: DiveDir): { x: number; y: number } {
    const y = GOAL_T + GOAL_B / 2 - 10 + Math.random() * 10;
    switch (zone) {
      case 'left': return { x: GOAL_L + GOAL_W * 0.17, y };
      case 'center': return { x: GOAL_L + GOAL_W * 0.5, y };
      case 'right': return { x: GOAL_L + GOAL_W * 0.83, y };
    }
  }

  // ── Particles ──
  private spawnConfetti(x: number, y: number) {
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        life: 1,
      });
    }
  }

  // ── Game loop ──
  private loop(now: number) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    const s = this.state;

    // Shake decay
    if (s.shake > 0) {
      s.shake = Math.max(0, s.shake - dt * 4);
    }

    // Particle update
    for (const p of s.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity
      p.life -= dt * 0.8;
    }
    s.particles = s.particles.filter((p) => p.life > 0);

    if (s.shotPhase === 'kicking') {
      s.animTime += dt;
      if (s.animTime >= s.animDuration) {
        // Kick animation done → show result
        s.shotPhase = 'result';
        s.resultTimer = 0;

        if (s.lastResult === 'goal') {
          if (s.isPlayerShooting) {
            s.playerScore++;
          } else {
            s.aiScore++;
          }
          s.shake = 1;
          if (s.shotTarget) {
            this.spawnConfetti(s.shotTarget.x, s.shotTarget.y);
          }
        }
      }
    }

    if (s.shotPhase === 'result') {
      s.resultTimer += dt;
      if (s.resultTimer >= RESULT_DURATION) {
        s.shotPhase = 'transition';
        s.animTime = 0;
      }
    }

    if (s.shotPhase === 'transition') {
      s.animTime += dt;
      if (s.animTime >= TRANSITION_DURATION) {
        this.nextTurn();
      }
    }
  }

  private nextTurn() {
    const s = this.state;

    if (s.isPlayerShooting) {
      // Switch to player defending
      s.isPlayerShooting = false;
    } else {
      // Both have shot this round
      if (s.round >= s.maxRounds) {
        // Game over
        this.destroy();
        this.onFinish(s.playerScore, s.aiScore);
        return;
      }
      s.round++;
      s.isPlayerShooting = true;
    }

    // Reset shot state
    s.shotPhase = 'aiming';
    s.shotTarget = null;
    s.shotZone = null;
    s.keeperDive = null;
    s.lastResult = null;
    s.animTime = 0;
    s.animDuration = 0;
    s.resultTimer = 0;
  }

  private render() {
    this.ctx.clearRect(0, 0, W, H);
    renderScene(this.ctx, this.state, this.playerChar, this.opponentChar);
  }
}
