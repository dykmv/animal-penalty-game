import type { AnimalInfo } from '../game/types';

interface MenuProps {
  playerAnimal: AnimalInfo | null;
  onStart: () => void;
  onPick: () => void;
}

export default function Menu({ playerAnimal, onStart, onPick }: MenuProps) {
  return (
    <div className="menu">
      <h1 className="title">⚽ Звериные пенальти ⚽</h1>
      <p className="subtitle">Выбери своё животное и забей гол!</p>

      <button className="btn btn-pick" onClick={onPick}>
        {playerAnimal ? (
          <span>
            Твой игрок: {playerAnimal.emoji} {playerAnimal.name}
            <br />
            <small>нажми чтобы поменять</small>
          </span>
        ) : (
          'Выбери животное 🐾'
        )}
      </button>

      {playerAnimal && (
        <button className="btn btn-play" onClick={onStart}>
          Играть! 🏆
        </button>
      )}
    </div>
  );
}
