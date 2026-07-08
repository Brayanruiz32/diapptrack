import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,
            MatCardModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-container">
      <div class="auth-header">
      <mat-icon style="font-size:48px;width:48px;height:48px;color:transparent;border:7px solid #1976d2;border-radius:100%">brightness_1</mat-icon>
        <h1>DIAPP<span style="font-weight: 400;">TRACK</span></h1>
        <p class="text-muted">Crear nueva cuenta</p>
      </div>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="fullName">
              <mat-error *ngIf="form.get('fullName')?.hasError('required')">Campo requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-error *ngIf="form.get('email')?.hasError('email')">Correo inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePass ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePass=!hidePass">
                <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Mínimo 8 caracteres</mat-hint>
              <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 8 caracteres</mat-error>
            </mat-form-field>

            <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>
            <div *ngIf="successMsg" class="success-msg">{{ successMsg }}</div>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
              Registrarse
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="text-center mt-16">
        <span class="text-muted">¿Ya tienes cuenta? </span>
        <a routerLink="/auth/login" style="color:#1565c0">Iniciar sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 16px; max-width: 420px; margin: 0 auto; }
    .auth-header { text-align: center; margin-bottom: 24px; h1 { margin: 8px 0 4px; font-size: 28px; color: #1565c0; } }
    .error-msg   { color: #c62828; font-size: 13px; background: #ffebee; padding: 8px 12px; border-radius: 6px; }
    .success-msg { color: #2e7d32; font-size: 13px; background: #e8f5e9; padding: 8px 12px; border-radius: 6px; }
  `]
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  hidePass   = true;
  loading    = false;
  errorMsg   = '';
  successMsg = '';

  form = this.fb.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading  = true;
    this.errorMsg = '';
    const { fullName, email, password } = this.form.value;

    this.auth.register({ fullName: fullName!, email: email!, password: password! }).subscribe({
      next: () => {
        this.successMsg = '¡Cuenta creada! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.errorMsg = err.error?.message ?? 'Error al registrarse';
        this.loading  = false;
      }
    });
  }
}
