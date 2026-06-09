import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private api    = environment.apiUrl;

  currentUser = signal<User | null>(null);

  login(data: LoginRequest) {
    const body = new URLSearchParams();
    body.set('email', data.email);
    body.set('password', data.password);
    if (data.rememberMe) body.set('rememberMe', 'true');

    return this.http.post<void>(`${this.api}/auth/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true
    }).pipe(
      // Espera a cargar el usuario (con su rol) ANTES de completar el login,
      // para que la navegación posterior tenga el rol disponible.
      switchMap(() => this.loadCurrentUser())
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<User>(`${this.api}/auth/register`, data, { withCredentials: true });
  }

  logout() {
    return this.http.post<void>(`${this.api}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
        return of(null);
      })
    );
  }

  loadCurrentUser() {
    return this.http.get<User>(`${this.api}/users/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }
}
