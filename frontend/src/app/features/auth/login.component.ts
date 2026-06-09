import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,
            MatCardModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatCheckboxModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-container">
      <div class="auth-header">
        <mat-icon style="font-size:48px;width:48px;height:48px;color:#1565c0">favorite</mat-icon>
        <h1>DiappTrack</h1>
        <p class="text-muted">Sistema de autocuidado para diabetes</p>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              <mat-error *ngIf="form.get('email')?.hasError('required')">Campo requerido</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Correo inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePass ? 'password' : 'text'" formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePass=!hidePass">
                <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Campo requerido</mat-error>
            </mat-form-field>

            <mat-checkbox formControlName="rememberMe">Recordar sesión</mat-checkbox>

            <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
              Iniciar sesión
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="text-center mt-16">
        <span class="text-muted">¿No tienes cuenta? </span>
        <a routerLink="/auth/register" style="color:#1565c0">Regístrate</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 16px; max-width: 420px; margin: 0 auto; }
    .auth-header { text-align: center; margin-bottom: 24px; h1 { margin: 8px 0 4px; font-size: 28px; color: #1565c0; } }
    .error-msg { color: #c62828; font-size: 13px; background: #ffebee; padding: 8px 12px; border-radius: 6px; }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  hidePass = true;
  loading  = false;
  errorMsg = '';

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    rememberMe: [false]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading  = true;
    this.errorMsg = '';
    const { email, password, rememberMe } = this.form.value;

    this.auth.login({ email: email!, password: password!, rememberMe: rememberMe! }).subscribe({
      next: (user) => {
        this.router.navigate([user?.role === 'ADMIN' ? '/admin' : '/home']);
      },
      error: () => {
        this.errorMsg = 'Correo o contraseña incorrectos';
        this.loading  = false;
      }
    });
  }
}
