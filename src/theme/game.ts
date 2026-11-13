import type { Expression, LifeStage, StatKey } from '@/engine/types';

export const STAGE_LABEL: Record<LifeStage, string> = {
  training: 'Training',
  first_job: 'First job',
  mid_career: 'Mid-career',
  crisis: 'Crisis',
  late_career: 'Late career',
};

export const STAT_META: { key: StatKey; label: string; color: string }[] = [
  { key: 'money', label: 'Money', color: '#E39B12' },
  { key: 'health', label: 'Health', color: '#E23B4A' },
  { key: 'happiness', label: 'Happiness', color: '#7A5CFF' },
  { key: 'reputation', label: 'Reputation', color: '#2F6BFF' },
  { key: 'relationships', label: 'Relationships', color: '#12996A' },
];

export const fonts = {
  display: 'Fredoka_700Bold',
  displaySoft: 'Fredoka_600SemiBold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
  bodyReg: 'Nunito_500Medium',
};

export function expressionLabel(expression: Expression): string {
  switch (expression) {
    case 'happy':
      return 'happy';
    case 'stressed':
      return 'stressed';
    case 'hurt':
      return 'hurt';
    case 'proud':
      return 'proud';
    case 'sad':
      return 'sad';
    case 'determined':
      return 'determined';
    case 'tired':
      return 'tired';
    case 'angry':
      return 'angry';
    case 'hopeful':
      return 'hopeful';
    default:
      return 'steady';
  }
}
