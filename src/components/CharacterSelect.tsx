import { CHARACTERS } from '../game/types';
import type { Character } from '../game/types';

interface Props {
  onPick: (ch: Character) => void;
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
            onClick={() => onPick(ch)}
          >
            <span className="char-emoji">{ch.emoji}</span>
            <span className="char-name">{ch.name}</span>
            <span className="char-title">{ch.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
