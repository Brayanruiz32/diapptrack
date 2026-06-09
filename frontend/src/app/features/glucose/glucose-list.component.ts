import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { GlucoseService } from '../../core/services/glucose.service';
import { GlucoseRecord } from '../../core/models/glucose.model';

@Component({
  selector: 'app-glucose-list',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule,
            MatSnackBarModule, MatDialogModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Glucosa</span>
    </mat-toolbar>

    <div class="page-container">
      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="!loading && records.length === 0" class="empty-state">
        <mat-icon>water_drop</mat-icon>
        <p>Sin registros de glucosa</p>
        <button mat-raised-button color="primary" routerLink="/glucose/new">Agregar primer registro</button>
      </div>

      <div *ngIf="!loading" class="card-list">
        <mat-card *ngFor="let r of records" class="record-card">
          <mat-card-content>
            <div class="record-row">
              <div class="record-main">
                <div class="record-value">
                  {{ r.valueMgdl }} <span style="font-size:14px;font-weight:400">mg/dL</span>
                  <span [class]="alertClass(r.alert)" style="margin-left:8px">{{ alertLabel(r.alert) }}</span>
                </div>
                <div class="record-date">{{ r.measuredAt | date:'dd/MM/yyyy HH:mm' }}</div>
                <div *ngIf="r.notes" class="record-notes">{{ r.notes }}</div>
              </div>
              <div class="record-actions">
                <a mat-icon-button [routerLink]="['/glucose', r.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="delete(r)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="!lastPage" class="text-center mt-16">
          <button mat-stroked-button (click)="loadMore()" [disabled]="loadingMore">
            {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
          </button>
        </div>
      </div>

      <!-- Botón flotante: agregar nueva medición (permite varias por día) -->
      <a *ngIf="!loading" mat-fab color="primary" class="fab-add"
         routerLink="/glucose/new" aria-label="Agregar registro" style="bottom:80px">
        <mat-icon>add</mat-icon>
      </a>
    </div>
  `,
  styles: [`
    .record-card { margin-bottom: 10px; }
    .record-row { display: flex; align-items: flex-start; justify-content: space-between; }
    .record-main { flex: 1; }
    .record-value { font-size: 22px; font-weight: 600; color: #1565c0; }
    .record-date { font-size: 12px; color: rgba(0,0,0,.54); margin-top: 2px; }
    .record-notes { font-size: 13px; color: rgba(0,0,0,.6); margin-top: 4px; font-style: italic; }
    .record-actions { display: flex; }
    .fab-add { position: fixed; right: 20px; bottom: 20px; z-index: 100; }
  `]
})
export class GlucoseListComponent implements OnInit {
  private svc     = inject(GlucoseService);
  private snack   = inject(MatSnackBar);

  records     : GlucoseRecord[] = [];
  loading      = true;
  loadingMore  = false;
  lastPage     = false;
  page         = 0;

  ngOnInit() { this.load(); }

  load() {
    this.svc.getHistory(this.page).subscribe({
      next: res => {
        this.records  = [...this.records, ...res.content];
        this.lastPage = res.last;
        this.loading  = false;
        this.loadingMore = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.page++;
    this.load();
  }

  delete(record: GlucoseRecord) {
    if (!confirm(`¿Eliminar el registro de ${record.valueMgdl} mg/dL?`)) return;
    this.svc.delete(record.id).subscribe({
      next: () => {
        this.records = this.records.filter(r => r.id !== record.id);
        this.snack.open('Registro eliminado', '', { duration: 2500 });
      },
      error: () => this.snack.open('Error al eliminar', '', { duration: 2500 })
    });
  }

  alertClass(alert: string) {
    return { LOW: 'badge-low', NORMAL: 'badge-normal', HIGH: 'badge-high' }[alert] ?? 'badge-normal';
  }
  alertLabel(alert: string) {
    return { LOW: 'Baja', NORMAL: 'Normal', HIGH: 'Alta' }[alert] ?? '';
  }
}
