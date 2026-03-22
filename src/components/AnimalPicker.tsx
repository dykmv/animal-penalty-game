import { ANIMALS } from '../game/types';
import type { AnimalInfo } from '../game/types';

interface AnimalPickerProps {
  onPick: (animal: AnimalInfo) => void;
}

export default function AnimalPicker({ onPick }: AnimalPickerProps) {
  return (
    <div className="picker">
      <h2>Выбери своего игрока!</h2>
      <div className="animal-grid">
        {ANIMALS.map((animal) => (
          <button
            key={animal.id}
            className="animal-card"
            style={{ borderColor: animal.color }}
            onClick={() => onPick(animal)}
          >
            <span className="animal-emoji">{animal.emoji}</span>
            <span className="animal-name">{animal.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
