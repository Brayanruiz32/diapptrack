import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,
            MatCardModule, MatFormFieldModule, MatInputModule,
            MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <a mat-icon-button routerLink="/admin/patients"><mat-icon>arrow_back</mat-icon></a>
      <h2 style="margin:0">{{ isEdit ? 'Editar paciente' : 'Nuevo paciente' }}</h2>
    </div>

    <mat-card style="max-width:560px">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre completo</mat-label>
            <input matInput formControlName="fullName">
            <mat-error>Requerido</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>DNI</mat-label>
            <input matInput formControlName="dni" maxlength="8" inputmode="numeric" placeholder="8 dígitos">
            <mat-error *ngIf="form.get('dni')?.hasError('required')">El DNI es obligatorio</mat-error>
            <mat-error *ngIf="form.get('dni')?.hasError('pattern')">Debe tener 8 dígitos</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="email">
          </mat-form-field>
          <mat-form-field *ngIf="!isEdit" appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-hint>Mínimo 8 caracteres</mat-hint>
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
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fecha de diagnóstico (Diabetes Tipo 2)</mat-label>
            <input matInput type="date" formControlName="diagnosisDate">
          </mat-form-field>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <mat-form-field appearance="outline">
              <mat-label>Peso (kg)</mat-label>
              <input matInput type="number" formControlName="weightKg" step="0.1">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Altura (cm)</mat-label>
              <input matInput type="number" formControlName="heightCm">
            </mat-form-field>
          </div>

          <div *ngIf="errorMsg" style="color:#c62828;background:#ffebee;padding:8px 12px;border-radius:6px;font-size:13px">
            {{ errorMsg }}
          </div>

          <div style="display:flex;gap:8px">
            <button mat-raised-button color="primary" type="submit" style="flex:1" [disabled]="form.invalid || saving">
              {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
            </button>
            <a mat-stroked-button routerLink="/admin/patients">Cancelar</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class PatientFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(AdminService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  isEdit   = false;
  patientId = 0;
  saving    = false;
  errorMsg  = '';

  form = this.fb.group({
    fullName:      ['', Validators.required],
    dni:           ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email:         ['', [Validators.required, Validators.email]],
    password:      [''],
    birthDate:     [''],
    diagnosisDate: [''],
    sex:           [''],
    weightKg:      [null as number | null],
    heightCm:      [null as number | null]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(s => s.path === 'edit')) {
      this.isEdit   = true;
      this.patientId = +id;
      this.form.get('password')?.clearValidators();
      this.form.get('email')?.disable();
      this.svc.getPatient(this.patientId).subscribe(p => {
        this.form.patchValue({ fullName: p.fullName, dni: p.dni ?? '', birthDate: p.birthDate ?? '', diagnosisDate: p.diagnosisDate ?? '', sex: p.sex ?? '', weightKg: p.weightKg ?? null, heightCm: p.heightCm ?? null });
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMsg = '';
    const data: any = { ...this.form.getRawValue() };
    if (!data.birthDate)     delete data.birthDate;
    if (!data.diagnosisDate) delete data.diagnosisDate;
    if (!data.sex)           delete data.sex;
    if (!data.weightKg)      delete data.weightKg;
    if (!data.heightCm)      delete data.heightCm;

    const obs = this.isEdit
      ? this.svc.updatePatient(this.patientId, data)
      : this.svc.createPatient(data);

    obs.subscribe({
      next: () => { this.snack.open('Guardado', '', { duration: 2000 }); this.router.navigate(['/admin/patients']); },
      error: (e) => { this.errorMsg = e.error?.message ?? 'Error al guardar'; this.saving = false; }
    });
  }
}
