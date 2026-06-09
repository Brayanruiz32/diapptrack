import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
            MatToolbarModule, MatCardModule, MatSlideToggleModule,
            MatFormFieldModule, MatInputModule, MatButtonModule,
            MatIconModule, MatDividerModule, MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Notificaciones</span>
    </mat-toolbar>

    <div class="page-container">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="form-container">

            <!-- Glucosa -->
            <div class="notif-row">
              <div class="notif-label">
                <mat-icon style="color:#1565c0">water_drop</mat-icon>
                <span>Glucosa</span>
              </div>
              <mat-slide-toggle formControlName="glucoseEnabled" color="primary"></mat-slide-toggle>
            </div>
            <mat-form-field *ngIf="form.get('glucoseEnabled')?.value" appearance="outline" class="full-width">
              <mat-label>Hora de recordatorio</mat-label>
              <input matInput type="time" formControlName="glucoseTime">
            </mat-form-field>

            <mat-divider></mat-divider>

            <!-- Medicación -->
            <div class="notif-row">
              <div class="notif-label">
                <mat-icon style="color:#7b1fa2">medication</mat-icon>
                <span>Medicación</span>
              </div>
              <mat-slide-toggle formControlName="medicationEnabled" color="primary"></mat-slide-toggle>
            </div>
            <p *ngIf="form.get('medicationEnabled')?.value" class="text-muted" style="margin:0 0 8px">
              Los recordatorios se enviarán según el horario de cada medicamento
            </p>

            <mat-divider></mat-divider>

            <!-- Actividad -->
            <div class="notif-row">
              <div class="notif-label">
                <mat-icon style="color:#2e7d32">directions_run</mat-icon>
                <span>Actividad física</span>
              </div>
              <mat-slide-toggle formControlName="activityEnabled" color="primary"></mat-slide-toggle>
            </div>
            <mat-form-field *ngIf="form.get('activityEnabled')?.value" appearance="outline" class="full-width">
              <mat-label>Hora de recordatorio</mat-label>
              <input matInput type="time" formControlName="activityTime">
            </mat-form-field>

            <mat-divider></mat-divider>

            <!-- Educación -->
            <div class="notif-row">
              <div class="notif-label">
                <mat-icon style="color:#0277bd">menu_book</mat-icon>
                <span>Nuevo contenido educativo</span>
              </div>
              <mat-slide-toggle formControlName="educationEnabled" color="primary"></mat-slide-toggle>
            </div>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width mt-16" [disabled]="saving">
              {{ saving ? 'Guardando...' : 'Guardar preferencias' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .notif-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
    .notif-label { display: flex; align-items: center; gap: 10px; font-size: 15px; }
  `]
})
export class NotificationsComponent implements OnInit {
  private svc   = inject(NotificationService);
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  saving = false;

  form = this.fb.group({
    glucoseEnabled:    [false],
    glucoseTime:       [''],
    medicationEnabled: [false],
    activityEnabled:   [false],
    activityTime:      [''],
    educationEnabled:  [false]
  });

  ngOnInit() {
    this.svc.getSettings().subscribe({
      next: s => this.form.patchValue(s as any),
      error: () => {}
    });
  }

  save() {
    this.saving = true;
    this.svc.updateSettings(this.form.value as any).subscribe({
      next: () => { this.snack.open('Preferencias guardadas', '', { duration: 2000 }); this.saving = false; },
      error: () => { this.snack.open('Error al guardar', '', { duration: 2500 }); this.saving = false; }
    });
  }
}
