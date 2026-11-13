import type { FoodId, HomeId, Stats } from '@/engine/types';

export function resolveHome(careerId: string, stats: Stats, flags: string[], hint?: HomeId): HomeId {
  if (hint) return hint;
  if (flags.includes('suburban') || stats.money >= 72) return 'house';
  if (flags.includes('family_help') && stats.money < 62) return 'family';
  if (flags.includes('opened_studio')) return 'flat';
  if (flags.includes('packed_house') || flags.includes('title_i') || stats.money < 42) return 'shared';
  if (careerId === 'firefighter' && stats.money < 50) return 'bunk';
  return 'flat';
}

export function mealLabel(food: FoodId): string {
  switch (food) {
    case 'rice':
      return 'Rice';
    case 'banana':
      return 'Banana';
    case 'eggs':
      return 'Eggs';
    case 'noodles':
      return 'Noodles';
    case 'salad':
      return 'Salad';
    case 'toast':
      return 'Toast';
    case 'packed':
      return 'Packed lunch';
    case 'leftovers':
      return 'Leftovers';
    case 'cereal':
      return 'Cereal';
    case 'chili':
      return 'Chili';
    case 'coffee':
      return 'Coffee';
    case 'bar':
      return 'Protein bar';
    default:
      return 'A meal';
  }
}
