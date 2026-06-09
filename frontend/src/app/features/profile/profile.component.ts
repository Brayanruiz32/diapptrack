import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { localDateStr } from '../../core/utils/date.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatButtonModule,
            MatIconModule, MatDividerModule, MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Mi Perfil</span>
      <span style="flex:1"></span>
      <button mat-icon-button (click)="logout()"><mat-icon>logout</mat-icon></button>
    </mat-toolbar>

    <div class="page-container">
      <!-- Avatar -->
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:80px;height:80px;border-radius:50%;background:#1565c0;display:flex;align-items:center;justify-content:center;margin:0 auto 8px">
          <mat-icon style="color:white;font-size:40px;width:40px;height:40px">person</mat-icon>
        </div>
        <div style="font-weight:600;font-size:18px">{{ auth.currentUser()?.fullName }}</div>
        <div class="text-muted">{{ auth.currentUser()?.email }}</div>
      </div>

      <mat-card>
        <mat-card-header><mat-card-title style="font-size:16px">Datos personales</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="fullName">
              <mat-error>Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>DNI *</mat-label>
              <input matInput formControlName="dni" maxlength="8" inputmode="numeric" placeholder="8 dígitos">
              <mat-error *ngIf="form.get('dni')?.hasError('required')">El DNI es obligatorio</mat-error>
              <mat-error *ngIf="form.get('dni')?.hasError('pattern')">Debe tener 8 dígitos</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha de nacimiento</mat-label>
              <input matInput type="date" formControlName="birthDate">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sexo</mat-label>
              <mat-select formControlName="sex">
                <mat-option value="M">Masculino</mat-option>
                <mat-option value="F">Femenino</mat-option>
                <mat-option value="OTHER">Otro</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-divider style="margin:4px 0 8px"></mat-divider>
            <div style="font-weight:500;color:rgba(0,0,0,.6);font-size:14px">Datos Clínicos</div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha de diagnóstico (Diabetes Tipo 2)</mat-label>
              <input matInput type="date" formControlName="diagnosisDate" [max]="todayStr">
            </mat-form-field>

            <div *ngIf="timeSinceDiagnosis"
                 style="display:flex;align-items:center;gap:8px;background:#e8f5e9;color:#2e7d32;padding:10px 12px;border-radius:8px;font-size:13px;margin-bottom:8px">
              <mat-icon style="font-size:18px;width:18px;height:18px">schedule</mat-icon>
              <span>Tiempo desde el diagnóstico: <b>{{ timeSinceDiagnosis }}</b></span>
            </div>

            <mat-divider style="margin:4px 0 8px"></mat-divider>
            <div style="font-weight:500;color:rgba(0,0,0,.6);font-size:14px">Datos físicos</div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <mat-form-field appearance="outline">
                <mat-label>Peso (kg) *</mat-label>
                <input matInput type="number" formControlName="weightKg" min="20" max="300" step="0.1">
                <span matTextSuffix>kg</span>
                <mat-error>Requerido (20–300 kg)</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Altura (cm)</mat-label>
                <input matInput type="number" formControlName="heightCm" min="50" max="250">
                <span matTextSuffix>cm</span>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width" [disabled]="form.invalid || saving">
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private userSvc = inject(UserService);
  private snack   = inject(MatSnackBar);
  private router  = inject(Router);
  auth            = inject(AuthService);

  saving   = false;
  todayStr = localDateStr();

  form = this.fb.group({
    fullName:      ['', Validators.required],
    dni:           ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    birthDate:     [''],
    diagnosisDate: [''],
    sex:           [''],
    weightKg:      [null as number | null, [Validators.required, Validators.min(20), Validators.max(300)]],
    heightCm:      [null as number | null]
  });

  /** "X años y Y meses" desde la fecha de diagnóstico seleccionada. */
  get timeSinceDiagnosis(): string | null {
    const d = this.form.get('diagnosisDate')?.value;
    if (!d) return null;
    const from = new Date(d);
    const now  = new Date();
    if (isNaN(from.getTime()) || from > now) return null;

    let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
    if (now.getDate() < from.getDate()) months--;
    if (months < 0) return null;

    const years = Math.floor(months / 12);
    const rem   = months % 12;
    const yPart = years > 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
    const mPart = rem  > 0 ? `${rem} mes${rem !== 1 ? 'es' : ''}` : '';
    if (yPart && mPart) return `${yPart} y ${mPart}`;
    return yPart || mPart || 'menos de un mes';
  }

  ngOnInit() {
    const u = this.auth.currentUser();
    if (u) {
      this.form.patchValue({
        fullName:      u.fullName,
        dni:           u.dni ?? '',
        birthDate:     u.birthDate ?? '',
        diagnosisDate: u.diagnosisDate ?? '',
        sex:           u.sex ?? '',
        weightKg:      u.weightKg ?? null,
        heightCm:      u.heightCm ?? null
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const data: any = { ...this.form.value };
    if (!data.birthDate)     delete data.birthDate;
    if (!data.diagnosisDate) delete data.diagnosisDate;
    if (!data.sex)           delete data.sex;

    this.userSvc.updateMe(data).subscribe({
      next: u => {
        this.auth.currentUser.set(u);
        this.snack.open('Perfil actualizado', '', { duration: 2000 });
        this.saving = false;
        // Redirección solo en caso de éxito (HTTP 200 OK)
        this.router.navigate(['/home']);
      },
      error: () => { this.snack.open('Error al guardar', '', { duration: 2500 }); this.saving = false; }
    });
  }

  logout() { this.auth.logout().subscribe(); }
}
