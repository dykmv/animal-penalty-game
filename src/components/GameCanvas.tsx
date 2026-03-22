import { useEffect, useRef } from 'react';
import type { Character } from '../game/types';
import { W, H } from '../game/types';
import { PenaltyEngine } from '../game/engine';
import { playClick, initAudio } from '../game/sound';

interface GameCanvasProps {
  player: Character;
  onFinish: (playerScore: number, aiScore: number) => void;
  onBack: () => void;
  musicOn: boolean;
  onToggleMusic: () => void;
}

export default function GameCanvas({ player, onFinish, onBack, musicOn, onToggleMusic }: GameCanvasProps) {
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

    initAudio();

    const engine = new PenaltyEngine(canvas, player, onFinish);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [player, onFinish]);

  const handleBack = () => {
    playClick();
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    onBack();
  };

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="game-overlay-btns">
        <button className="game-overlay-btn" onClick={onToggleMusic} title={musicOn ? 'Выключить музыку' : 'Включить музыку'}>
          {musicOn ? '♪' : '♪̸'}
        </button>
        <button className="game-overlay-btn" onClick={handleBack} title="В меню">
          ✕
        </button>
      </div>
    </div>
  );
}
