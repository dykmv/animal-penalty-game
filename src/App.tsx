import { useState, useCallback } from 'react';
import './index.css';
import type { AnimalInfo, GamePhase } from './game/types';
import Menu from './components/Menu';
import AnimalPicker from './components/AnimalPicker';
import PenaltyGame from './components/PenaltyGame';
import FinalScreen from './components/FinalScreen';

function App() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [player, setPlayer] = useState<AnimalInfo | null>(null);
  const [finalScore, setFinalScore] = useState({ player: 0, opponent: 0 });

  const handlePick = useCallback((animal: AnimalInfo) => {
    setPlayer(animal);
    setPhase('menu');
  }, []);

  const handleFinish = useCallback((playerScore: number, opponentScore: number) => {
    setFinalScore({ player: playerScore, opponent: opponentScore });
    setPhase('final');
  }, []);

  const handleReplay = useCallback(() => {
    setPhase('shooting');
  }, []);

  const handleMenu = useCallback(() => {
    setPhase('menu');
  }, []);

  return (
    <>
      {phase === 'menu' && (
        <Menu
          playerAnimal={player}
          onStart={() => setPhase('shooting')}
          onPick={() => setPhase('pick')}
        />
      )}

      {phase === 'pick' && <AnimalPicker onPick={handlePick} />}

      {phase === 'shooting' && player && (
        <PenaltyGame key={Date.now()} player={player} onFinish={handleFinish} />
      )}

      {phase === 'final' && player && (
        <FinalScreen
          player={player}
          playerScore={finalScore.player}
          opponentScore={finalScore.opponent}
          onReplay={handleReplay}
          onMenu={handleMenu}
        />
      )}
    </>
  );
}

export default App;
