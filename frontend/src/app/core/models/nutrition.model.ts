export interface NutritionLog {
  id: number;
  logDate: string;
  ateFruits: boolean;
  ateVegetables: boolean;
  drankSugary: boolean;
  ateFastFood: boolean;
  respectedSchedule: boolean;
  isHealthy: boolean;
  updatedAt: string;
}

export interface NutritionLogRequest {
  logDate: string;
  ateFruits: boolean;
  ateVegetables: boolean;
  drankSugary: boolean;
  ateFastFood: boolean;
  respectedSchedule: boolean;
}
