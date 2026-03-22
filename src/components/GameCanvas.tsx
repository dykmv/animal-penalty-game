import { useEffect, useRef } from 'react';
import type { Character } from '../game/types';
import { W, H } from '../game/types';
import { PenaltyEngine } from '../game/engine';

interface GameCanvasProps {
  player: Character;
  onFinish: (playerScore: number, aiScore: number) => void;
}

export default function GameCanvas({ player, onFinish }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PenaltyEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
    }

    const engine = new PenaltyEngine(canvas, player, onFinish);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [player, onFinish]);

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="game-canvas"
      />
    </div>
  );
}
