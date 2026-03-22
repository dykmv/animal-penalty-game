import { useRef, useEffect, useState } from 'react';
import type { Character } from '../game/types';
import { W, H } from '../game/types';
import { drawAwardCeremony, drawPortrait } from '../game/portraits';
import { playClick } from '../game/sound';

interface Props {
  player: Character;
  opponent: Character | null;
  playerScore: number;
  aiScore: number;
  onReplay: () => void;
  onMenu: () => void;
}

export default function AwardCeremony({ player, opponent, playerScore, aiScore, onReplay, onMenu }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showButtons, setShowButtons] = useState(false);

  const won = playerScore > aiScore;
  const draw = playerScore === aiScore;

  // Determine winner/loser for ceremony
  const winner = won ? player : (opponent ?? player);
  const loser = won ? (opponent ?? player) : player;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    let startTime = performance.now();
    let rafId = 0;
    const ANIM_TOTAL = 3.0; // seconds for full ceremony animation

    function loop(now: number) {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / ANIM_TOTAL, 1);

      ctx.clearRect(0, 0, W, H);

      if (draw) {
        drawDrawScene(ctx, player, opponent ?? player, progress);
      } else {
        drawAwardCeremony(ctx, winner, loser, W, H, progress);
      }

      // Show score
      if (progress > 0.6) {
        const alpha = Math.min((progress - 0.6) * 4, 1);
        ctx.globalAlpha = alpha;
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.fillText(`${playerScore} : ${aiScore}`, W / 2, H - 20);
        ctx.globalAlpha = 1;
      }

      if (progress >= 1) {
        setShowButtons(true);
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [player, opponent, winner, loser, draw, playerScore, aiScore]);

  return (
    <div className="canvas-wrapper ceremony-wrapper">
      <canvas ref={canvasRef} className="game-canvas" />
      {showButtons && (
        <div className="ceremony-buttons">
          <button className="retro-btn play-btn" onClick={() => { playClick(); onReplay(); }}>
            Ещё раз!
          </button>
          <button className="retro-btn pick-btn" onClick={() => { playClick(); onMenu(); }}>
            В меню
          </button>
        </div>
      )}
    </div>
  );
}

/** Draw scene for a draw/tie result */
function drawDrawScene(
  ctx: CanvasRenderingContext2D,
  char1: Character,
  char2: Character,
  progress: number,
) {
  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2D1B69');
  bg.addColorStop(0.5, '#1A0A2E');
  bg.addColorStop(1, '#0D0518');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Sparkles
  const time = progress * 4;
  for (let i = 0; i < 15; i++) {
    const sx = ((i * 97 + time * 30) % W);
    const sy = ((i * 53 + Math.sin(time + i) * 15) % (H - 40)) + 10;
    const sz = (Math.sin(time * 2 + i) + 1);
    if (sz > 0.5) {
      ctx.fillStyle = i % 2 === 0 ? '#C0C0C0' : '#FFF';
      ctx.fillRect(sx, sy, Math.ceil(sz), Math.ceil(sz));
    }
  }

  // Two podiums same height
  const podiumY = H - 50;
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(W / 2 - 70, podiumY - 24, 60, 34);
  ctx.fillRect(W / 2 + 10, podiumY - 24, 60, 34);
  ctx.fillStyle = '#A9A9A9';
  ctx.fillRect(W / 2 - 68, podiumY - 22, 56, 30);
  ctx.fillRect(W / 2 + 12, podiumY - 22, 56, 30);

  // Characters
  const scale = Math.min(progress * 3, 1);
  if (scale > 0) {
    const s = 42 * scale;
    drawPortrait(ctx, char1, W / 2 - 40 - s / 2 + 10, podiumY - 24 - s - 2, s, 'neutral');
    drawPortrait(ctx, char2, W / 2 + 40 - s / 2 - 10, podiumY - 24 - s - 2, s, 'neutral');
  }

  // Title
  const textAlpha = Math.min(Math.max(progress - 0.4, 0) * 3, 1);
  if (textAlpha > 0) {
    ctx.globalAlpha = textAlpha;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillText('НИЧЬЯ!', W / 2, 30);
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#C850C0';
    ctx.fillText('Дружеская игра!', W / 2, 48);
    ctx.globalAlpha = 1;
  }
}
