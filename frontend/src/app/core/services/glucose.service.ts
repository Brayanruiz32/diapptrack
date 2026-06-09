import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GlucoseRecord, GlucoseRequest } from '../models/glucose.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class GlucoseService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/glucose`;

  getHistory(page = 0, size = 20, from?: string, to?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<PageResponse<GlucoseRecord>>(this.api, { params, withCredentials: true });
  }

  getById(id: number) {
    return this.http.get<GlucoseRecord>(`${this.api}/${id}`, { withCredentials: true });
  }

  create(data: GlucoseRequest) {
    return this.http.post<GlucoseRecord>(this.api, data, { withCredentials: true });
  }

  update(id: number, data: GlucoseRequest) {
    return this.http.put<GlucoseRecord>(`${this.api}/${id}`, data, { withCredentials: true });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`, { withCredentials: true });
  }
}
