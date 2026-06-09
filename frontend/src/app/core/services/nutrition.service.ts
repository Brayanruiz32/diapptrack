import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NutritionLog, NutritionLogRequest } from '../models/nutrition.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/nutrition`;

  /** Devuelve null si no hay registro hoy (404 silencioso), lanza en cualquier otro error */
  getToday() {
    return this.http.get<NutritionLog>(`${this.api}/today`, { withCredentials: true }).pipe(
      catchError(err => {
        if (err.status === 404) return of(null);
        throw err;
      })
    );
  }

  getHistory(page = 0, size = 20, from?: string, to?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (from) params = params.set('from', from);
    if (to)   params = params.set('to', to);
    return this.http.get<PageResponse<NutritionLog>>(this.api, { params, withCredentials: true });
  }

  create(data: NutritionLogRequest) { return this.http.post<NutritionLog>(this.api, data, { withCredentials: true }); }
  update(id: number, data: NutritionLogRequest) { return this.http.put<NutritionLog>(`${this.api}/${id}`, data, { withCredentials: true }); }
}
