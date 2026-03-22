import { useState, useCallback, useRef } from 'react';
import './index.css';
import type { Character, AppPhase } from './game/types';
import CharacterSelect from './components/CharacterSelect';
import GameCanvas from './components/GameCanvas';
import AwardCeremony from './components/AwardCeremony';
import MenuPortrait from './components/MenuPortrait';
import { playClick, initAudio, startBgm, stopBgm, isBgmPlaying } from './game/sound';

function App() {
  const [phase, setPhase] = useState<AppPhase>('menu');
  const [player, setPlayer] = useState<Character | null>(null);
  const [finalScore, setFinalScore] = useState({ p: 0, ai: 0 });
  const [musicOn, setMusicOn] = useState(false);
  const opponentRef = useRef<Character | null>(null);

  const toggleMusic = useCallback(() => {
    initAudio();
    if (isBgmPlaying()) {
      stopBgm();
      setMusicOn(false);
    } else {
      startBgm();
      setMusicOn(true);
    }
  }, []);

  const handlePick = useCallback((ch: Character) => {
    setPlayer(ch);
    setPhase('menu');
  }, []);

  const handleFinish = useCallback((p: number, ai: number, opponent?: Character) => {
    setFinalScore({ p, ai });
    if (opponent) opponentRef.current = opponent;
    setPhase('final');
  }, []);

  const handleBack = useCallback(() => {
    setPhase('menu');
  }, []);

  // ── Menu ──
  if (phase === 'menu') {
    return (
      <div className="screen menu-screen">
        <div className="menu-glow" />
        <h1 className="retro-title main-title">Звериные<br/>Пенальти</h1>
        <p className="retro-sub">Fantasy Penalty Shootout</p>

        <button className="retro-btn pick-btn" onClick={() => { initAudio(); if (!isBgmPlaying()) { startBgm(); setMusicOn(true); } playClick(); setPhase('select'); }}>
          {player ? (
            <>
              <MenuPortrait ch={player} />
              {player.name}
              <span className="btn-hint">нажми чтобы сменить</span>
            </>
          ) : (
            'Выбери героя'
          )}
        </button>

        {player && (
          <button className="retro-btn play-btn" onClick={() => { playClick(); setPhase('playing'); }}>
            Играть!
          </button>
        )}

        <button className="music-toggle" onClick={toggleMusic} title={musicOn ? 'Выключить музыку' : 'Включить музыку'}>
          {musicOn ? '♪' : '♪̸'}
        </button>

        <div className="menu-footer">5 пенальти · бей и лови</div>
      </div>
    );
  }

  // ── Character Select ──
  if (phase === 'select') {
    return <CharacterSelect onPick={handlePick} />;
  }

  // ── Playing ──
  if (phase === 'playing' && player) {
    return <GameCanvas key={Date.now()} player={player} onFinish={handleFinish} onBack={handleBack} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  }

  // ── Final — Award Ceremony ──
  if (phase === 'final' && player) {
    return (
      <AwardCeremony
        player={player}
        opponent={opponentRef.current}
        playerScore={finalScore.p}
        aiScore={finalScore.ai}
        onReplay={() => { playClick(); setPhase('playing'); }}
        onMenu={() => { playClick(); setPhase('menu'); }}
      />
    );
  }

  return null;
}

export default App;
