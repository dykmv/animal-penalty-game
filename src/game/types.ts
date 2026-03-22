// ── Canvas constants ──
export const W = 384;
export const H = 256;

// ── Goal geometry ──
export const GOAL_L = 128;
export const GOAL_R = 256;
export const GOAL_T = 72;
export const GOAL_B = 112;
export const GOAL_W = GOAL_R - GOAL_L;
export const GOAL_H = GOAL_B - GOAL_T;
export const GOAL_CX = (GOAL_L + GOAL_R) / 2;
export const GOAL_CY = (GOAL_T + GOAL_B) / 2;

// ── Ball ──
export const BALL_START_X = 192;
export const BALL_START_Y = 178;

// ── Shooter position ──
export const SHOOTER_X = 192;
export const SHOOTER_Y = 228;

// ── Keeper idle position ──
export const KEEPER_X = 192;
export const KEEPER_Y = 104;

// ── Characters ──
export type EarType = 'cat' | 'bunny' | 'bear' | 'wolf' | 'fox' | 'owl';
export type Headgear = 'tiara' | 'crown' | 'helmet' | 'hood' | 'hat' | 'none';
export type BodyType = 'dress' | 'armor' | 'robe';

export interface CharColors {
  primary: string;
  secondary: string;
  skin: string;
  accent: string;
  ear: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  emoji: string;
  earType: EarType;
  headgear: Headgear;
  bodyType: BodyType;
  hasTail: boolean;
  colors: CharColors;
}

export const CHARACTERS: Character[] = [
  {
    id: 'princess-cat',
    name: 'Принцесса Кошка',
    title: 'Princess Cat',
    emoji: '🐱',
    earType: 'cat',
    headgear: 'tiara',
    bodyType: 'dress',
    hasTail: true,
    colors: { primary: '#FF69B4', secondary: '#FFB6C1', skin: '#FFF5EE', accent: '#FFD700', ear: '#FFB6C1' },
  },
  {
    id: 'bunny-princess',
    name: 'Зайка-Принцесса',
    title: 'Bunny Princess',
    emoji: '🐰',
    earType: 'bunny',
    headgear: 'crown',
    bodyType: 'dress',
    hasTail: true,
    colors: { primary: '#DDA0DD', secondary: '#E6E6FA', skin: '#FFFFFF', accent: '#FFD700', ear: '#FFB6C1' },
  },
  {
    id: 'bear-knight',
    name: 'Медведь-Рыцарь',
    title: 'Bear Knight',
    emoji: '🐻',
    earType: 'bear',
    headgear: 'helmet',
    bodyType: 'armor',
    hasTail: false,
    colors: { primary: '#8B6914', secondary: '#D2691E', skin: '#DEB887', accent: '#DAA520', ear: '#C4A265' },
  },
  {
    id: 'wolf-guard',
    name: 'Волк-Страж',
    title: 'Wolf Guard',
    emoji: '🐺',
    earType: 'wolf',
    headgear: 'hood',
    bodyType: 'armor',
    hasTail: true,
    colors: { primary: '#708090', secondary: '#A9A9A9', skin: '#D3D3D3', accent: '#C0C0C0', ear: '#B0B0B0' },
  },
  {
    id: 'fox-mage',
    name: 'Лис-Маг',
    title: 'Fox Mage',
    emoji: '🦊',
    earType: 'fox',
    headgear: 'hat',
    bodyType: 'robe',
    hasTail: true,
    colors: { primary: '#9370DB', secondary: '#7B68EE', skin: '#FFDAB9', accent: '#FF6347', ear: '#FF8C00' },
  },
  {
    id: 'owl-wizard',
    name: 'Сова-Волшебник',
    title: 'Owl Wizard',
    emoji: '🦉',
    earType: 'owl',
    headgear: 'hat',
    bodyType: 'robe',
    hasTail: false,
    colors: { primary: '#4169E1', secondary: '#6495ED', skin: '#F5DEB3', accent: '#FFD700', ear: '#D2B48C' },
  },
];

// ── Game state ──
export type AppPhase = 'menu' | 'select' | 'playing' | 'final';
export type ShotPhase = 'aiming' | 'kicking' | 'result' | 'transition';
export type DiveDir = 'left' | 'center' | 'right';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export interface GameState {
  shotPhase: ShotPhase;
  round: number;
  maxRounds: number;
  playerScore: number;
  aiScore: number;
  isPlayerShooting: boolean;

  // shot data
  shotTarget: { x: number; y: number } | null;
  shotZone: DiveDir | null;
  keeperDive: DiveDir | null;
  lastResult: 'goal' | 'save' | null;

  // animation
  animTime: number;
  animDuration: number;
  resultTimer: number;

  // effects
  shake: number;
  particles: Particle[];

  // input
  hoverX: number;
  hoverY: number;
}
