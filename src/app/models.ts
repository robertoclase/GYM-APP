export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
}

export interface TrainingEntry {
  id: string;
  exerciseId: string;
  weight: number;
  reps?: number;
  date: string; // ISO string (yyyy-MM-dd)
}

export type Trend = 'up' | 'down' | 'equal' | 'solo';

export const COLORS = {
  cream: '#E9E3D2',
  blue: '#A8BEE1',
  green: '#C7E0CB',
  lavender: '#D3BFDE',
  peach: '#DFBAAD',
  pink: '#E1B4C5',
  grayLavender: '#CFCAD7',
  white: '#FFFFFF'
} as const;
