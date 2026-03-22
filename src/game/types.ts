export type Animal = 'cat' | 'dog' | 'panda' | 'bear' | 'bunny' | 'fox';

export interface AnimalInfo {
  id: Animal;
  name: string;
  emoji: string;
  color: string;
}

export const ANIMALS: AnimalInfo[] = [
  { id: 'cat', name: 'Котик', emoji: '🐱', color: '#FF9800' },
  { id: 'dog', name: 'Пёсик', emoji: '🐶', color: '#8D6E63' },
  { id: 'panda', name: 'Панда', emoji: '🐼', color: '#607D8B' },
  { id: 'bear', name: 'Мишка', emoji: '🐻', color: '#795548' },
  { id: 'bunny', name: 'Зайка', emoji: '🐰', color: '#E91E63' },
  { id: 'fox', name: 'Лисичка', emoji: '🦊', color: '#FF5722' },
];

export type GamePhase = 'menu' | 'pick' | 'shooting' | 'saving' | 'result' | 'final';

export type ShotZone = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export const SHOT_ZONES: ShotZone[] = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];
