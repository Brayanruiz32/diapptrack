export interface ActivityType {
  id: number;
  name: string;
  icon: string;
  met: number;
}

export interface PhysicalActivity {
  id: number;
  activityTypeId: number;
  activityTypeName: string;
  activityTypeIcon: string;
  activityDate: string;
  durationMin: number;
  calories?: number;
  createdAt: string;
}

export interface PhysicalActivityRequest {
  activityTypeId: number;
  activityDate: string;
  durationMin: number;
}
