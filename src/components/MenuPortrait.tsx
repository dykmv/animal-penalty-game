import { useRef, useEffect } from 'react';
import type { Character } from '../game/types';
import { getPortrait } from '../game/portraits';

export default function MenuPortrait({ ch }: { ch: Character }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = 32;
    cv.height = 32;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(getPortrait(ch, 'neutral'), 0, 0, 32, 32);
  }, [ch]);

  return <canvas ref={ref} className="menu-portrait-canvas" />;
}
