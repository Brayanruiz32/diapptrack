export interface AdminDashboard {
  totalPatients: number;
  activePatients: number;
  avgMedicationAdherence: number;
  avgActivityMinutesPerWeek: number;
  avgHealthyNutritionPercent: number;
  totalEducationViews: number;
}

export interface PatientReport {
  patientId: number;
  patientName: string;
  from: string;
  to: string;
  medicationPercent: number;
  activityPercent: number;
  nutritionPercent: number;
  educationPercent: number;
  overallSelfCarePercent: number;
  totalMedicationsScheduled: number;
  totalMedicationsTaken: number;
  totalActivityMinutes: number;
  totalActivityDays: number;
  totalNutritionDays: number;
  healthyNutritionDays: number;
  totalEducationContent: number;
  viewedEducationContent: number;
}

export interface NotificationSettings {
  glucoseEnabled: boolean;
  glucoseTime?: string;
  medicationEnabled: boolean;
  activityEnabled: boolean;
  activityTime?: string;
  educationEnabled: boolean;
}
