export interface MedicationSchedule {
  id: number;
  time: string;   // "HH:mm:ss"
}

export interface Medication {
  id: number;
  name: string;
  dose: string;
  active: boolean;
  createdAt: string;
  schedules: MedicationSchedule[];
}

export interface MedicationRequest {
  name: string;
  dose: string;
  times: string[];   // ["08:00", "14:00", "20:00"]
}

/** Ítem del apartado "Hoy": un horario concreto de un medicamento. */
export interface MedicationTodayItem {
  scheduleId: number;
  medicationId: number;
  medicationName: string;
  dose: string;
  time: string;       // "HH:mm:ss"
  taken: boolean;
}

/** Registro histórico de cumplimiento. */
export interface MedicationLog {
  id: number;
  medicationId: number;
  medicationName: string;
  dose: string;
  scheduledTime: string;
  logDate: string;
  taken: boolean;
  updatedAt: string;
}
