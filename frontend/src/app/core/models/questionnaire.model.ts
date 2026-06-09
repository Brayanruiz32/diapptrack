export type QuestionnaireKey = 'Q1_PRETEST' | 'Q1_POSTEST' | 'Q2';

export interface Question {
  id: number;
  orderNum: number;
  text: string;
  minValue: number;
  maxValue: number;
}

export interface Questionnaire {
  key: QuestionnaireKey;
  label: string;
  scaleMin: number;
  scaleMax: number;
  questions: Question[];
}

export interface AnswerInput {
  questionId: number;
  value: number;
}

export interface SubmitQuestionnaireRequest {
  answers: AnswerInput[];
}

export interface AnswerDetail {
  orderNum: number;
  text: string;
  value: number;
}

export interface QuestionnaireResponseDetail {
  key: string;
  label: string;
  submittedAt: string;
  answers: AnswerDetail[];
}

// --- Admin ---
export interface QuestionnaireSetting {
  key: string;
  label: string;
  enabled: boolean;
}

export interface InstanceStatus {
  key: string;
  label: string;
  completed: boolean;
  submittedAt?: string;
}

export interface PatientQuestionnaireStatus {
  userId: number;
  fullName: string;
  dni?: string;
  instances: InstanceStatus[];
}
