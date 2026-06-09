import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Medication, MedicationRequest, MedicationTodayItem, MedicationLog } from '../models/medication.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/medications`;

  getAll()                          { return this.http.get<Medication[]>(this.api, { withCredentials: true }); }
  create(data: MedicationRequest)   { return this.http.post<Medication>(this.api, data, { withCredentials: true }); }
  update(id: number, data: MedicationRequest) { return this.http.put<Medication>(`${this.api}/${id}`, data, { withCredentials: true }); }
  delete(id: number)                { return this.http.delete<void>(`${this.api}/${id}`, { withCredentials: true }); }

  // Apartado "Hoy"
  getToday() {
    return this.http.get<MedicationTodayItem[]>(`${this.api}/today`, { withCredentials: true });
  }

  setTodayTaken(scheduleId: number, taken: boolean) {
    return this.http.put<MedicationTodayItem>(`${this.api}/today/${scheduleId}`, { taken }, { withCredentials: true });
  }

  // Historial
  getLogHistory(page = 0, size = 20, from?: string, to?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<PageResponse<MedicationLog>>(`${this.api}/logs`, { params, withCredentials: true });
  }
}
