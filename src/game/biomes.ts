import { BiomeConfig } from '../types/game';

export const BIOMES: BiomeConfig[] = [
  {
    id: 'valley',
    name: 'Emerald Valley',
    grassBase: '#1F513B',
    grassStripe: '#255D44',
    shoulderColor: '#475569',
    roadBase: '#1E242B',
    roadStripe: '#E2E8F0',
    curbA: '#EF4444',
    curbB: '#F8FAFC',
    treePrimary: '#15803D',
    treeSecondary: '#22C55E',
    accentColor: '#F59E0B',
    isNight: false,
  },
  {
    id: 'canyon',
    name: 'Redrock Canyon',
    grassBase: '#7C3E24',
    grassStripe: '#8D492B',
    shoulderColor: '#57534E',
    roadBase: '#232022',
    roadStripe: '#FDE68A',
    curbA: '#F59E0B',
    curbB: '#FEF3C7',
    treePrimary: '#4D7C0F',
    treeSecondary: '#84CC16',
    accentColor: '#F97316',
    isNight: false,
  },
  {
    id: 'coastal',
    name: 'Pacific Overpass',
    grassBase: '#0F4C5C',
    grassStripe: '#145D70',
    shoulderColor: '#64748B',
    roadBase: '#1F2937',
    roadStripe: '#F1F5F9',
    curbA: '#0EA5E9',
    curbB: '#F8FAFC',
    treePrimary: '#0D9488',
    treeSecondary: '#2DD4BF',
    accentColor: '#38BDF8',
    isNight: false,
  },
  {
    id: 'night',
    name: 'Midnight Expressway',
    grassBase: '#0F172A',
    grassStripe: '#162038',
    shoulderColor: '#334155',
    roadBase: '#111827',
    roadStripe: '#FBBF24',
    curbA: '#F59E0B',
    curbB: '#334155',
    treePrimary: '#1E293B',
    treeSecondary: '#334155',
    accentColor: '#FBBF24',
    isNight: true,
  },
  {
    id: 'alpine',
    name: 'Alpine Summit',
    grassBase: '#334155',
    grassStripe: '#3F4E63',
    shoulderColor: '#94A3B8',
    roadBase: '#1E293B',
    roadStripe: '#F8FAFC',
    curbA: '#2563EB',
    curbB: '#F8FAFC',
    treePrimary: '#0F766E',
    treeSecondary: '#E2E8F0',
    accentColor: '#60A5FA',
    isNight: false,
  },
];

export function getBiomeForLevel(level: number): BiomeConfig {
  return BIOMES[(level - 1) % BIOMES.length];
}

export function getLevelTargetDistance(level: number): number {
  // Short, engaging ~18–25 second stretches between IT quiz gates
  return 450 + (level - 1) * 90;
}

export function getLevelTrafficSpeedMultiplier(level: number): number {
  return 1 + Math.min((level - 1) * 0.14, 1.1);
}
