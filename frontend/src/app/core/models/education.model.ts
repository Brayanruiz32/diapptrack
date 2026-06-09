export type ContentType = 'ARTICLE' | 'TIP';
export type Topic = 'NUTRITION' | 'ACTIVITY' | 'GLUCOSE' | 'MEDICATION' | 'PREVENTION';

export interface EducationContent {
  id: number;
  title: string;
  body: string;
  type: ContentType;
  topic: Topic;
  imageUrl?: string;
  readingTimeMinutes?: number;
  publishedAt: string;
  read: boolean;
}

export interface EducationContentRequest {
  title: string;
  body: string;
  type: ContentType;
  topic: Topic;
  readingTimeMinutes?: number;
}

export const TOPIC_LABELS: Record<Topic, string> = {
  NUTRITION:  'Alimentación',
  ACTIVITY:   'Actividad Física',
  GLUCOSE:    'Control de Glucosa',
  MEDICATION: 'Medicación',
  PREVENTION: 'Prevención'
};
