import { SHOT_ZONES } from './types';
import type { ShotZone } from './types';

/** Check if goalkeeper guessed the same zone as the shot */
export function isSaved(shot: ShotZone, dive: ShotZone): boolean {
  return shot === dive;
}

/** AI picks a random zone to shoot at */
export function aiShoot(): ShotZone {
  return SHOT_ZONES[Math.floor(Math.random() * SHOT_ZONES.length)];
}

/** AI picks a random zone to dive to — slightly "dumb" so the kid wins more often */
export function aiDive(): ShotZone {
  // AI only covers 4 of 6 zones effectively — biased towards bottom
  const biased: ShotZone[] = [
    'bottom-left', 'bottom-center', 'bottom-right', 'top-center',
  ];
  return biased[Math.floor(Math.random() * biased.length)];
}

/** Convert a click position (0-1 normalized x,y within the goal) to a zone */
export function positionToZone(nx: number, ny: number): ShotZone {
  const row = ny < 0.5 ? 'top' : 'bottom';
  let col: string;
  if (nx < 0.33) col = 'left';
  else if (nx < 0.66) col = 'center';
  else col = 'right';
  return `${row}-${col}` as ShotZone;
}

/** Get x,y center of a zone (0-1 normalized) for rendering */
export function zoneToPosition(zone: ShotZone): { x: number; y: number } {
  const parts = zone.split('-');
  const row = parts[0];
  const col = parts[1];
  const y = row === 'top' ? 0.25 : 0.75;
  let x: number;
  if (col === 'left') x = 0.17;
  else if (col === 'center') x = 0.5;
  else x = 0.83;
  return { x, y };
}
