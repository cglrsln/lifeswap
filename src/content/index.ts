import type { Career } from '@/engine/types';
import dancer from './dancer';
import firefighter from './firefighter';
import teacher from './teacher';

export const careers: Career[] = [dancer, teacher, firefighter];

export function getCareer(id: string): Career | undefined {
  return careers.find((career) => career.id === id);
}

export const TOTAL_ENDINGS = careers.reduce((sum, career) => sum + career.endings.length, 0);
