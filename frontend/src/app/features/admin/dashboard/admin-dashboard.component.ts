import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboard } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatCardModule, MatIconModule,
            MatProgressSpinnerModule, MatButtonModule],
  template: `
    <h2 style="margin:0 0 20px">Dashboard</h2>

    <div *ngIf="loading" class="text-center mt-24">
      <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
    </div>

    <div *ngIf="!loading && data" class="metric-grid" style="max-width:800px">
      <div class="metric-card">
        <mat-icon style="color:#1565c0">people</mat-icon>
        <div class="metric-value">{{ data.totalPatients }}</div>
        <div class="metric-label">Pacientes registrados</div>
      </div>
      <div class="metric-card">
        <mat-icon style="color:#2e7d32">person_check</mat-icon>
        <div class="metric-value">{{ data.activePatients }}</div>
        <div class="metric-label">Pacientes activos (7 días)</div>
      </div>
      <div class="metric-card">
        <mat-icon style="color:#7b1fa2">medication</mat-icon>
        <div class="metric-value">{{ data.avgMedicationAdherence | number:'1.0-1' }}%</div>
        <div class="metric-label">Adherencia medicación (prom.)</div>
      </div>
      <div class="metric-card">
        <mat-icon style="color:#2e7d32">directions_run</mat-icon>
        <div class="metric-value">{{ data.avgActivityMinutesPerWeek | number:'1.0-0' }}'</div>
        <div class="metric-label">Min. actividad/semana (prom.)</div>
      </div>
      <div class="metric-card">
        <mat-icon style="color:#e65100">restaurant</mat-icon>
        <div class="metric-value">{{ data.avgHealthyNutritionPercent | number:'1.0-1' }}%</div>
        <div class="metric-label">Alimentación saludable (prom.)</div>
      </div>
      <div class="metric-card">
        <mat-icon style="color:#0277bd">menu_book</mat-icon>
        <div class="metric-value">{{ data.totalEducationViews }}</div>
        <div class="metric-label">Visualizaciones educativas</div>
      </div>
    </div>

    <div style="margin-top:24px;display:flex;gap:12px">
      <a mat-raised-button color="primary" routerLink="/admin/patients">
        <mat-icon>people</mat-icon> Ver pacientes
      </a>
      <a mat-stroked-button routerLink="/admin/education">
        <mat-icon>menu_book</mat-icon> Gestionar contenido
      </a>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private svc = inject(AdminService);
  data   : AdminDashboard | null = null;
  loading = true;

  ngOnInit() {
    this.svc.getDashboard().subscribe({
      next:  d => { this.data = d; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
