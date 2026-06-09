import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EducationContent, EducationContentRequest, Topic, ContentType } from '../models/education.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/education`;

  getAll(page = 0, size = 20, topic?: Topic, type?: ContentType) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (topic) params = params.set('topic', topic);
    if (type)  params = params.set('type', type);
    return this.http.get<PageResponse<EducationContent>>(this.api, { params, withCredentials: true });
  }

  getById(id: number)    { return this.http.get<EducationContent>(`${this.api}/${id}`, { withCredentials: true }); }
  markAsRead(id: number) { return this.http.post<void>(`${this.api}/${id}/view`, {}, { withCredentials: true }); }
  getUnreadCount()       { return this.http.get<{ unreadCount: number }>(`${this.api}/unread-count`, { withCredentials: true }); }

  // Admin
  create(data: EducationContentRequest) { return this.http.post<EducationContent>(`${environment.apiUrl}/admin/education`, data, { withCredentials: true }); }
  update(id: number, data: EducationContentRequest) { return this.http.put<EducationContent>(`${environment.apiUrl}/admin/education/${id}`, data, { withCredentials: true }); }
  delete(id: number) { return this.http.delete<void>(`${environment.apiUrl}/admin/education/${id}`, { withCredentials: true }); }

  uploadImage(id: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<EducationContent>(`${environment.apiUrl}/admin/education/${id}/image`, form, { withCredentials: true });
  }

  /** Construye la URL completa de la imagen servida por el backend. */
  imageUrl(path?: string): string | null {
    return path ? `${environment.apiUrl}${path}` : null;
  }
}
