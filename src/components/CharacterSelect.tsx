import { useRef, useEffect } from 'react';
import { CHARACTERS } from '../game/types';
import type { Character } from '../game/types';
import { getPortrait } from '../game/portraits';
import { playClick } from '../game/sound';

interface Props {
  onPick: (ch: Character) => void;
}

function CharPortrait({ ch }: { ch: Character }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = 32;
    cv.height = 32;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const portrait = getPortrait(ch, 'neutral');
    ctx.drawImage(portrait, 0, 0, 32, 32);
  }, [ch]);

  return <canvas ref={canvasRef} className="char-portrait-canvas" />;
}

export default function CharacterSelect({ onPick }: Props) {
  return (
    <div className="screen select-screen">
      <h2 className="retro-title">Выбери героя</h2>
      <div className="char-grid">
        {CHARACTERS.map((ch) => (
          <button
            key={ch.id}
            className="char-card"
            style={{
              borderColor: ch.colors.primary,
              background: `linear-gradient(135deg, ${ch.colors.primary}33, ${ch.colors.secondary}33)`,
            }}
            onClick={() => { playClick(); onPick(ch); }}
          >
            <CharPortrait ch={ch} />
            <span className="char-name">{ch.name}</span>
            <span className="char-title">{ch.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
