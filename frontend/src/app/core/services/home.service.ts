import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HomeSummary } from '../models/home.model';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);

  getSummary() {
    return this.http.get<HomeSummary>(`${environment.apiUrl}/home`, { withCredentials: true });
  }
}
