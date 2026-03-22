import type { AnimalInfo } from '../game/types';

interface FinalScreenProps {
  player: AnimalInfo;
  playerScore: number;
  opponentScore: number;
  onReplay: () => void;
  onMenu: () => void;
}

export default function FinalScreen({
  player,
  playerScore,
  opponentScore,
  onReplay,
  onMenu,
}: FinalScreenProps) {
  const won = playerScore > opponentScore;
  const draw = playerScore === opponentScore;

  return (
    <div className="final">
      <div className="final-emoji">
        {won ? '🏆' : draw ? '🤝' : '💪'}
      </div>
      <h1 className="final-title">
        {won
          ? `${player.emoji} Победа!`
          : draw
            ? 'Ничья!'
            : 'В следующий раз повезёт!'}
      </h1>
      <div className="final-score">
        {playerScore} : {opponentScore}
      </div>
      <p className="final-text">
        {won
          ? 'Ты отлично играешь! 🎉'
          : draw
            ? 'Вы сыграли вничью! Попробуй ещё раз!'
            : 'Не сдавайся, попробуй ещё! 💪'}
      </p>
      <div className="final-buttons">
        <button className="btn btn-play" onClick={onReplay}>
          Играть ещё! 🔄
        </button>
        <button className="btn btn-pick" onClick={onMenu}>
          В меню 🏠
        </button>
      </div>
    </div>
  );
}
