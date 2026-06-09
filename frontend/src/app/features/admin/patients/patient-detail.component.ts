import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { PatientReport } from '../../../core/models/admin.model';
import { GlucoseRecord } from '../../../core/models/glucose.model';
import { MedicationLog } from '../../../core/models/medication.model';
import { PhysicalActivity } from '../../../core/models/activity.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatTabsModule, MatCardModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule, MatTableModule, MatSnackBarModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <a mat-icon-button routerLink="/admin/patients"><mat-icon>arrow_back</mat-icon></a>
      <div>
        <h2 style="margin:0">{{ patient?.fullName }}</h2>
        <div class="text-muted">{{ patient?.email }}</div>
      </div>
      <span style="flex:1"></span>
      <button mat-stroked-button (click)="exportExcel()" [disabled]="exporting">
        <mat-icon>download</mat-icon> {{ exporting ? 'Exportando...' : 'Exportar Excel' }}
      </button>
      <a mat-stroked-button [routerLink]="['/admin/patients', patientId, 'edit']">
        <mat-icon>edit</mat-icon> Editar
      </a>
    </div>

    <!-- Datos del paciente: DNI, diagnóstico y último acceso -->
    <mat-card *ngIf="patient" style="margin-bottom:16px">
      <mat-card-content style="display:flex;flex-wrap:wrap;gap:28px;padding:14px 16px">
        <div>
          <div class="text-muted" style="font-size:12px">DNI</div>
          <div style="font-weight:500">{{ patient.dni || '—' }}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Fecha de diagnóstico</div>
          <div style="font-weight:500">{{ patient.diagnosisDate ? (patient.diagnosisDate | date:'dd/MM/yyyy') : '—' }}</div>
        </div>
        <div>
          <div class="text-muted" style="font-size:12px">Último acceso</div>
          <div style="font-weight:500">{{ patient.lastLoginAt ? (patient.lastLoginAt | date:'dd/MM/yyyy hh:mm a') : 'Nunca' }}</div>
        </div>
      </mat-card-content>
    </mat-card>

    <mat-tab-group>
      <!-- Reporte -->
      <mat-tab label="Reporte">
        <div style="padding:16px 0" *ngIf="report">
          <div class="metric-grid" style="max-width:600px;margin-bottom:16px">
            <div class="metric-card">
              <div class="metric-value" [style.color]="scoreColor(report.overallSelfCarePercent)">
                {{ report.overallSelfCarePercent | number:'1.0-1' }}%
              </div>
              <div class="metric-label">Autocuidado general</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ report.medicationPercent | number:'1.0-1' }}%</div>
              <div class="metric-label">Adherencia medicación</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ report.activityPercent | number:'1.0-1' }}%</div>
              <div class="metric-label">Días con actividad</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ report.nutritionPercent | number:'1.0-1' }}%</div>
              <div class="metric-label">Días alimentación saludable</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ report.educationPercent | number:'1.0-1' }}%</div>
              <div class="metric-label">Contenido educativo visto</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ report.totalActivityMinutes }}'</div>
              <div class="metric-label">Minutos actividad total</div>
            </div>
          </div>
          <div class="text-muted">Período: {{ report.from | date:'dd/MM/yyyy' }} — {{ report.to | date:'dd/MM/yyyy' }}</div>
        </div>
        <div *ngIf="!report" class="text-center mt-24"><mat-spinner diameter="32" style="margin:0 auto"></mat-spinner></div>
      </mat-tab>

      <!-- Glucosa -->
      <mat-tab label="Glucosa">
        <div style="padding:16px 0">
          <div *ngIf="glucoseRecords.length === 0" class="empty-state"><mat-icon>water_drop</mat-icon><p>Sin registros</p></div>
          <table *ngIf="glucoseRecords.length > 0" mat-table [dataSource]="glucoseRecords" style="width:100%;background:white;border-radius:12px">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let r">{{ r.measuredAt | date:'dd/MM/yyyy HH:mm' }}</td></ng-container>
            <ng-container matColumnDef="value"><th mat-header-cell *matHeaderCellDef>mg/dL</th><td mat-cell *matCellDef="let r"><span [class]="alertClass(r.alert)">{{ r.valueMgdl }}</span></td></ng-container>
            <ng-container matColumnDef="notes"><th mat-header-cell *matHeaderCellDef>Observaciones</th><td mat-cell *matCellDef="let r">{{ r.notes }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="['date','value','notes']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['date','value','notes']"></tr>
          </table>
        </div>
      </mat-tab>

      <!-- Medicación -->
      <mat-tab label="Medicación">
        <div style="padding:16px 0">
          <div *ngIf="medLogs.length === 0" class="empty-state"><mat-icon>medication</mat-icon><p>Sin registros</p></div>
          <table *ngIf="medLogs.length > 0" mat-table [dataSource]="medLogs" style="width:100%;background:white;border-radius:12px">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let r">{{ r.logDate | date:'dd/MM/yyyy' }}</td></ng-container>
            <ng-container matColumnDef="med"><th mat-header-cell *matHeaderCellDef>Medicamento</th><td mat-cell *matCellDef="let r">{{ r.medicationName }} · {{ r.dose }}</td></ng-container>
            <ng-container matColumnDef="taken"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let r"><span [class]="r.taken ? 'badge-normal' : 'badge-high'">{{ r.taken ? 'Tomado' : 'Omitido' }}</span></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="['date','med','taken']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['date','med','taken']"></tr>
          </table>
        </div>
      </mat-tab>

      <!-- Actividad -->
      <mat-tab label="Actividad">
        <div style="padding:16px 0">
          <div *ngIf="activities.length === 0" class="empty-state"><mat-icon>directions_run</mat-icon><p>Sin registros</p></div>
          <table *ngIf="activities.length > 0" mat-table [dataSource]="activities" style="width:100%;background:white;border-radius:12px">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let r">{{ r.activityDate | date:'dd/MM/yyyy' }}</td></ng-container>
            <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Actividad</th><td mat-cell *matCellDef="let r">{{ r.activityTypeName }}</td></ng-container>
            <ng-container matColumnDef="min"><th mat-header-cell *matHeaderCellDef>Duración</th><td mat-cell *matCellDef="let r">{{ r.durationMin }} min</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="['date','type','min']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['date','type','min']"></tr>
          </table>
        </div>
      </mat-tab>
    </mat-tab-group>
  `
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc   = inject(AdminService);
  private snack = inject(MatSnackBar);

  patientId     = 0;
  exporting     = false;
  patient      : User | null          = null;
  report       : PatientReport | null = null;
  glucoseRecords: GlucoseRecord[]     = [];
  medLogs      : MedicationLog[]      = [];
  activities   : PhysicalActivity[]   = [];

  ngOnInit() {
    this.patientId = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getPatient(this.patientId).subscribe(p => this.patient = p);
    this.svc.getPatientReport(this.patientId).subscribe(r => this.report = r);
    this.svc.getPatientGlucose(this.patientId).subscribe(r => this.glucoseRecords = r.content);
    this.svc.getPatientMedications(this.patientId).subscribe(r => this.medLogs = r.content);
    this.svc.getPatientActivities(this.patientId).subscribe(r => this.activities = r.content);
  }

  exportExcel() {
    this.exporting = true;
    this.svc.exportPatient(this.patientId).subscribe({
      next: b => { this.svc.downloadBlob(b, `paciente_${this.patientId}.xlsx`); this.exporting = false; },
      error: () => { this.snack.open('Error al exportar', '', { duration: 2500 }); this.exporting = false; }
    });
  }

  alertClass(alert: string) { return { LOW: 'badge-low', NORMAL: 'badge-normal', HIGH: 'badge-high' }[alert] ?? 'badge-normal'; }
  scoreColor(v: number) { return v >= 75 ? '#2e7d32' : v >= 50 ? '#e65100' : '#c62828'; }
}
