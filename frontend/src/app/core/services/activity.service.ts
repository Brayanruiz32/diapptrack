import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ActivityType, PhysicalActivity, PhysicalActivityRequest } from '../models/activity.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/activities`;

  getTypes() {
    return this.http.get<ActivityType[]>(`${environment.apiUrl}/catalog/activity-types`, { withCredentials: true });
  }

  getHistory(page = 0, size = 20, from?: string, to?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<PageResponse<PhysicalActivity>>(this.api, { params, withCredentials: true });
  }

  getById(id: number) { return this.http.get<PhysicalActivity>(`${this.api}/${id}`, { withCredentials: true }); }
  create(data: PhysicalActivityRequest) { return this.http.post<PhysicalActivity>(this.api, data, { withCredentials: true }); }
  update(id: number, data: PhysicalActivityRequest) { return this.http.put<PhysicalActivity>(`${this.api}/${id}`, data, { withCredentials: true }); }
  delete(id: number) { return this.http.delete<void>(`${this.api}/${id}`, { withCredentials: true }); }
}
