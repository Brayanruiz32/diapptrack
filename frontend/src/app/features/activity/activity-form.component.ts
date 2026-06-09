import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { ActivityType } from '../../core/models/activity.model';
import { localDateStr } from '../../core/utils/date.utils';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatSelectModule, MatButtonModule,
            MatIconModule, MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/activities"><mat-icon>arrow_back</mat-icon></button>
      <span>{{ isEdit ? 'Editar' : 'Nueva' }} actividad</span>
    </mat-toolbar>

    <div class="page-container">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo de actividad</mat-label>
              <mat-select formControlName="activityTypeId">
                <mat-option *ngFor="let t of types" [value]="t.id">
                  {{ t.name }}
                </mat-option>
              </mat-select>
              <mat-error>Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha</mat-label>
              <input matInput type="date" formControlName="activityDate">
              <mat-error>Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Duración (minutos)</mat-label>
              <input matInput type="number" formControlName="durationMin" min="1" max="1440">
              <span matTextSuffix>min</span>
              <mat-error>Ingresa un valor entre 1 y 1440</mat-error>
            </mat-form-field>

            <!-- Calorías quemadas: solo lectura, se recalcula automáticamente -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Calorías quemadas (aprox.)</mat-label>
              <input matInput [value]="estimatedCalories ?? '—'" readonly>
              <span matTextSuffix>kcal</span>
              <mat-hint>Calculado según actividad, duración y tu peso ({{ weightKg }} kg).</mat-hint>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width mt-16" [disabled]="form.invalid || loading">
              {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar') }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ActivityFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(ActivityService);
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  types  : ActivityType[] = [];
  isEdit  = false;
  editId  = 0;
  loading = false;

  form = this.fb.group({
    activityTypeId: [null as number | null, Validators.required],
    activityDate:   [localDateStr(), Validators.required],
    durationMin:    [null as number | null, [Validators.required, Validators.min(1), Validators.max(1440)]]
  });

  get weightKg(): number | null {
    return this.auth.currentUser()?.weightKg ?? null;
  }

  /** Fórmula ACSM: kcal = MET × 3.5 × peso(kg) / 200 × duración(min) */
  get estimatedCalories(): number | null {
    const typeId   = this.form.value.activityTypeId;
    const duration = this.form.value.durationMin;
    const weight   = this.weightKg;
    if (!typeId || !duration || !weight) return null;
    const type = this.types.find(t => t.id === typeId);
    if (!type) return null;
    return Math.round(type.met * 3.5 * weight / 200 * duration);
  }

  ngOnInit() {
    // Peso obligatorio: sin peso no se puede calcular calorías ni registrar actividad.
    if (!this.weightKg) {
      this.snack.open('Primero registra tu peso en el perfil', '', { duration: 3500 });
      this.router.navigate(['/profile']);
      return;
    }

    this.svc.getTypes().subscribe(t => this.types = t);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      // Cargar los datos guardados e inyectarlos en el formulario reactivo
      this.svc.getById(this.editId).subscribe({
        next: a => this.form.patchValue({
          activityTypeId: a.activityTypeId,
          activityDate:   a.activityDate,
          durationMin:    a.durationMin
        }),
        error: () => {
          this.snack.open('No se pudo cargar la actividad', '', { duration: 2500 });
          this.router.navigate(['/activities']);
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const data = this.form.value as any;

    const obs = this.isEdit
      ? this.svc.update(this.editId, data)
      : this.svc.create(data);

    obs.subscribe({
      next:  () => { this.snack.open('Guardado', '', { duration: 2000 }); this.router.navigate(['/activities']); },
      error: () => { this.snack.open('Error al guardar', '', { duration: 2500 }); this.loading = false; }
    });
  }
}
