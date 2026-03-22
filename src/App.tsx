import { useState, useCallback } from 'react';
import './index.css';
import type { Character, AppPhase } from './game/types';
import CharacterSelect from './components/CharacterSelect';
import GameCanvas from './components/GameCanvas';

function App() {
  const [phase, setPhase] = useState<AppPhase>('menu');
  const [player, setPlayer] = useState<Character | null>(null);
  const [finalScore, setFinalScore] = useState({ p: 0, ai: 0 });

  const handlePick = useCallback((ch: Character) => {
    setPlayer(ch);
    setPhase('menu');
  }, []);

  const handleFinish = useCallback((p: number, ai: number) => {
    setFinalScore({ p, ai });
    setPhase('final');
  }, []);

  // ── Menu ──
  if (phase === 'menu') {
    return (
      <div className="screen menu-screen">
        <div className="menu-glow" />
        <h1 className="retro-title main-title">Звериные<br/>Пенальти</h1>
        <p className="retro-sub">Fantasy Penalty Shootout</p>

        <button className="retro-btn pick-btn" onClick={() => setPhase('select')}>
          {player ? (
            <>
              {player.emoji} {player.name}
              <span className="btn-hint">нажми чтобы сменить</span>
            </>
          ) : (
            'Выбери героя'
          )}
        </button>

        {player && (
          <button className="retro-btn play-btn" onClick={() => setPhase('playing')}>
            Играть!
          </button>
        )}

        <div className="menu-footer">⚽ 5 пенальти · бей и лови ⚽</div>
      </div>
    );
  }

  // ── Character Select ──
  if (phase === 'select') {
    return <CharacterSelect onPick={handlePick} />;
  }

  // ── Playing ──
  if (phase === 'playing' && player) {
    return <GameCanvas key={Date.now()} player={player} onFinish={handleFinish} />;
  }

  // ── Final ──
  if (phase === 'final' && player) {
    const won = finalScore.p > finalScore.ai;
    const draw = finalScore.p === finalScore.ai;
    return (
      <div className="screen final-screen">
        <div className="final-trophy">{won ? '🏆' : draw ? '🤝' : '💪'}</div>
        <h1 className="retro-title">
          {won ? 'Победа!' : draw ? 'Ничья!' : 'В следующий раз!'}
        </h1>
        <div className="final-score-big">
          {player.emoji} {finalScore.p} : {finalScore.ai} 🎯
        </div>
        <p className="retro-sub">
          {won ? 'Отличная игра!' : draw ? 'Попробуй ещё раз!' : 'Не сдавайся!'}
        </p>
        <button className="retro-btn play-btn" onClick={() => setPhase('playing')}>
          Ещё раз!
        </button>
        <button className="retro-btn pick-btn" onClick={() => setPhase('menu')}>
          В меню
        </button>
      </div>
    );
  }

  return null;
}

export default App;
