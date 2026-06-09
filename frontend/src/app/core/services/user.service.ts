import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, UpdateProfileRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/users`;

  getMe()                            { return this.http.get<User>(`${this.api}/me`, { withCredentials: true }); }
  updateMe(data: UpdateProfileRequest){ return this.http.put<User>(`${this.api}/me`, data, { withCredentials: true }); }
}
