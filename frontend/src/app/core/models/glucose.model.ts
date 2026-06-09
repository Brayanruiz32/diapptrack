export type GlucoseAlert = 'LOW' | 'NORMAL' | 'HIGH';

export interface GlucoseRecord {
  id: number;
  measuredAt: string;
  valueMgdl: number;
  notes?: string;
  alert: GlucoseAlert;
  createdAt: string;
}

export interface GlucoseRequest {
  measuredAt: string;
  valueMgdl: number;
  notes?: string;
}
