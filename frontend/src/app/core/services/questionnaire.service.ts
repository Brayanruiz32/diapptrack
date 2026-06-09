import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Questionnaire, QuestionnaireResponseDetail, SubmitQuestionnaireRequest,
  QuestionnaireSetting, PatientQuestionnaireStatus
} from '../models/questionnaire.model';

@Injectable({ providedIn: 'root' })
export class QuestionnaireService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/questionnaires`;
  private admin = `${environment.apiUrl}/admin/questionnaires`;

  // --- Paciente ---
  getAvailable() { return this.http.get<Questionnaire[]>(`${this.api}/available`, { withCredentials: true }); }
  getMine()      { return this.http.get<QuestionnaireResponseDetail[]>(`${this.api}/mine`, { withCredentials: true }); }
  submit(key: string, data: SubmitQuestionnaireRequest) {
    return this.http.post<void>(`${this.api}/${key}/submit`, data, { withCredentials: true });
  }

  // --- Admin ---
  getSettings() { return this.http.get<QuestionnaireSetting[]>(`${this.admin}/settings`, { withCredentials: true }); }
  updateSetting(key: string, enabled: boolean) {
    return this.http.put<QuestionnaireSetting>(`${this.admin}/settings/${key}`, { enabled }, { withCredentials: true });
  }
  getResponsesOverview() { return this.http.get<PatientQuestionnaireStatus[]>(`${this.admin}/responses`, { withCredentials: true }); }
  getResponseDetail(userId: number, key: string) {
    return this.http.get<QuestionnaireResponseDetail>(`${this.admin}/responses/${userId}/${key}`, { withCredentials: true });
  }
}
