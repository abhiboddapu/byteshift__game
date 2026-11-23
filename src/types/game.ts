export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_QUIZ'
  | 'GAME_OVER';

export type QuizTopic =
  | 'Hardware & Basics'
  | 'Web & Internet'
  | 'Operating Systems'
  | 'Cybersecurity'
  | 'Coding & Data';

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  difficulty: 1 | 2 | 3;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface BiomeConfig {
  id: string;
  name: string;
  grassBase: string;
  grassStripe: string;
  shoulderColor: string;
  roadBase: string;
  roadStripe: string;
  curbA: string;
  curbB: string;
  treePrimary: string;
  treeSecondary: string;
  accentColor: string;
  isNight: boolean;
}

export interface HudSnapshot {
  level: number;
  score: number;
  shields: number;
  maxShields: number;
  distance: number;
  targetDistance: number;
  nitro: number; // 0 to 100
  speedKmh: number;
  biomeName: string;
}

export interface QuizStats {
  answered: number;
  correct: number;
}
