import { useState, useCallback } from 'react';
import { ANIMALS } from '../game/types';
import type { AnimalInfo, ShotZone } from '../game/types';
import { positionToZone, zoneToPosition, aiShoot, aiDive, isSaved } from '../game/logic';

interface PenaltyGameProps {
  player: AnimalInfo;
  onFinish: (playerScore: number, opponentScore: number) => void;
}

type RoundRole = 'shoot' | 'save';
type RoundResult = 'goal' | 'saved' | 'waiting' | null;

const TOTAL_ROUNDS = 5;

export default function PenaltyGame({ player, onFinish }: PenaltyGameProps) {
  // pick a random opponent different from player
  const [opponent] = useState<AnimalInfo>(() => {
    const others = ANIMALS.filter((a) => a.id !== player.id);
    return others[Math.floor(Math.random() * others.length)];
  });

  const [round, setRound] = useState(1);
  const [role, setRole] = useState<RoundRole>('shoot');
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [result, setResult] = useState<RoundResult>(null);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [divePos, setDivePos] = useState<{ x: number; y: number } | null>(null);
  const [locked, setLocked] = useState(false);

  const nextTurn = useCallback(() => {
    setBallPos(null);
    setDivePos(null);
    setResult(null);
    setLocked(false);

    if (role === 'shoot') {
      // after shooting, switch to saving
      setRole('save');
    } else {
      // after saving, go to next round
      if (round >= TOTAL_ROUNDS) {
        // game over — small delay then finish
        setTimeout(() => onFinish(playerScore, opponentScore), 100);
        return;
      }
      setRound((r) => r + 1);
      setRole('shoot');
    }
  }, [role, round, playerScore, opponentScore, onFinish]);

  const handleGoalClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (locked) return;
      setLocked(true);

      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const zone: ShotZone = positionToZone(nx, ny);

      if (role === 'shoot') {
        // Player shoots, AI dives
        const diveZone = aiDive();
        const shotPos = zoneToPosition(zone);
        const dPos = zoneToPosition(diveZone);
        setBallPos(shotPos);
        setDivePos(dPos);

        if (isSaved(zone, diveZone)) {
          setResult('saved');
        } else {
          setResult('goal');
          setPlayerScore((s) => s + 1);
        }
      } else {
        // Player dives, AI shoots
        const shotZone = aiShoot();
        const shotPos = zoneToPosition(shotZone);
        const dPos = zoneToPosition(zone);
        setBallPos(shotPos);
        setDivePos(dPos);

        if (isSaved(shotZone, zone)) {
          setResult('saved');
        } else {
          setResult('goal');
          setOpponentScore((s) => s + 1);
        }
      }

      // auto advance after a delay
      setTimeout(nextTurn, 1800);
    },
    [locked, role, nextTurn],
  );

  const roleText = role === 'shoot' ? 'Ты бьёшь! Нажми куда хочешь ударить ⚽' : 'Ты ловишь! Нажми куда хочешь прыгнуть 🧤';

  const resultEmoji =
    result === 'goal'
      ? role === 'shoot'
        ? '🎉 Гооол!'
        : '😢 Гол пропущен...'
      : result === 'saved'
        ? role === 'shoot'
          ? '😿 Вратарь поймал!'
          : '🙌 Отбил!'
        : null;

  return (
    <div className="game">
      {/* Scoreboard */}
      <div className="scoreboard">
        <div className="score-team">
          <span className="score-emoji">{player.emoji}</span>
          <span className="score-num">{playerScore}</span>
        </div>
        <div className="score-info">
          <span>Раунд {round}/{TOTAL_ROUNDS}</span>
          <span className="role-label">{role === 'shoot' ? '⚽ Удар' : '🧤 Защита'}</span>
        </div>
        <div className="score-team">
          <span className="score-num">{opponentScore}</span>
          <span className="score-emoji">{opponent.emoji}</span>
        </div>
      </div>

      {/* Instruction */}
      <p className="instruction">{roleText}</p>

      {/* Goal area */}
      <div className="field">
        <div className="goal-area" onClick={handleGoalClick}>
          {/* Net lines */}
          <div className="net" />

          {/* Ball */}
          {ballPos && (
            <div
              className="ball"
              style={{
                left: `${ballPos.x * 100}%`,
                top: `${ballPos.y * 100}%`,
              }}
            >
              ⚽
            </div>
          )}

          {/* Goalkeeper dive */}
          {divePos && (
            <div
              className="goalkeeper"
              style={{
                left: `${divePos.x * 100}%`,
                top: `${divePos.y * 100}%`,
              }}
            >
              {role === 'shoot' ? opponent.emoji : player.emoji}
            </div>
          )}

          {/* Shooter */}
          {!ballPos && (
            <div className="shooter">
              {role === 'shoot' ? player.emoji : opponent.emoji}
            </div>
          )}
        </div>

        {/* Result overlay */}
        {resultEmoji && (
          <div className={`result-overlay ${result === 'goal' && role === 'shoot' ? 'result-good' : result === 'saved' && role === 'save' ? 'result-good' : 'result-bad'}`}>
            {resultEmoji}
          </div>
        )}
      </div>
    </div>
  );
}
