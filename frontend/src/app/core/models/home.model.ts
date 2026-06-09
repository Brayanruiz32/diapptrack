import { GlucoseAlert } from './glucose.model';

export interface HomeSummary {
  lastGlucose?: {
    valueMgdl: number;
    measuredAt: string;
    alert: GlucoseAlert;
  };
  medicationToday: {
    total: number;
    taken: number;
    pending: number;
  };
  activityToday: {
    totalMinutes: number;
    sessions: number;
  };
  nutritionToday: {
    registered: boolean;
    isHealthy: boolean;
  };
  education: {
    unreadCount: number;
  };
}
