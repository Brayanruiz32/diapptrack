import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationSettings } from '../models/admin.model';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/notifications`;

  getSettings()                             { return this.http.get<NotificationSettings>(`${this.api}/settings`, { withCredentials: true }); }
  updateSettings(data: NotificationSettings){ return this.http.put<NotificationSettings>(`${this.api}/settings`, data, { withCredentials: true }); }

  async initFirebase(): Promise<void> {
    if (!environment.firebase.apiKey || environment.firebase.apiKey === 'YOUR_API_KEY') return;

    try {
      const app = initializeApp(environment.firebase);
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const token = await getToken(messaging, { vapidKey: environment.firebase.vapidKey });
      if (token) {
        await this.saveFcmToken(token).toPromise();
      }

      onMessage(messaging, payload => {
        if (payload.notification) {
          new Notification(payload.notification.title ?? 'DiabTrack', {
            body: payload.notification.body,
            icon: '/assets/icons/icon-192x192.png'
          });
        }
      });
    } catch (err) {
      console.warn('Firebase messaging no disponible:', err);
    }
  }

  saveFcmToken(token: string) {
    return this.http.post<void>(`${this.api}/fcm-token`, { token }, { withCredentials: true });
  }
}
