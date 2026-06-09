import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminDashboard, PatientReport } from '../models/admin.model';
import { User, UpdateProfileRequest } from '../models/user.model';
import { GlucoseRecord } from '../models/glucose.model';
import { MedicationLog } from '../models/medication.model';
import { PhysicalActivity } from '../models/activity.model';
import { NutritionLog } from '../models/nutrition.model';
import { EducationContent } from '../models/education.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/admin`;

  getDashboard()           { return this.http.get<AdminDashboard>(`${this.api}/dashboard`, { withCredentials: true }); }

  // Pacientes
  listPatients()           { return this.http.get<User[]>(`${this.api}/patients`, { withCredentials: true }); }
  getPatient(id: number)   { return this.http.get<User>(`${this.api}/patients/${id}`, { withCredentials: true }); }
  createPatient(data: any) { return this.http.post<User>(`${this.api}/patients`, data, { withCredentials: true }); }
  updatePatient(id: number, data: UpdateProfileRequest) { return this.http.put<User>(`${this.api}/patients/${id}`, data, { withCredentials: true }); }
  deletePatient(id: number){ return this.http.delete<void>(`${this.api}/patients/${id}`, { withCredentials: true }); }

  // Datos del paciente
  private params(page: number, size: number, from?: string, to?: string) {
    let p = new HttpParams().set('page', page).set('size', size);
    if (from) p = p.set('from', from);
    if (to)   p = p.set('to', to);
    return p;
  }

  getPatientGlucose(id: number, from?: string, to?: string, page = 0, size = 20) {
    return this.http.get<PageResponse<GlucoseRecord>>(`${this.api}/patients/${id}/glucose`,
      { params: this.params(page, size, from, to), withCredentials: true });
  }

  getPatientMedications(id: number, from?: string, to?: string, page = 0, size = 20) {
    return this.http.get<PageResponse<MedicationLog>>(`${this.api}/patients/${id}/medications`,
      { params: this.params(page, size, from, to), withCredentials: true });
  }

  getPatientActivities(id: number, from?: string, to?: string, page = 0, size = 20) {
    return this.http.get<PageResponse<PhysicalActivity>>(`${this.api}/patients/${id}/activities`,
      { params: this.params(page, size, from, to), withCredentials: true });
  }

  getPatientNutrition(id: number, from?: string, to?: string, page = 0, size = 20) {
    return this.http.get<PageResponse<NutritionLog>>(`${this.api}/patients/${id}/nutrition`,
      { params: this.params(page, size, from, to), withCredentials: true });
  }

  getPatientEducation(id: number) {
    return this.http.get<EducationContent[]>(`${this.api}/patients/${id}/education`, { withCredentials: true });
  }

  getPatientReport(id: number, from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<PatientReport>(`${this.api}/patients/${id}/report`, { params, withCredentials: true });
  }

  // Exportación a Excel (.xlsx)
  exportPatient(id: number) {
    return this.http.get(`${this.api}/patients/${id}/export`, { responseType: 'blob', withCredentials: true });
  }
  exportAll() {
    return this.http.get(`${this.api}/export`, { responseType: 'blob', withCredentials: true });
  }

  /** Dispara la descarga de un Blob con el nombre indicado. */
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
