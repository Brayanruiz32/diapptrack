import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivityService } from '../../core/services/activity.service';
import { PhysicalActivity } from '../../core/models/activity.model';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Actividad Física</span>
    </mat-toolbar>

    <div class="page-container">
      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="!loading && activities.length === 0" class="empty-state">
        <mat-icon>directions_run</mat-icon>
        <p>Sin actividades registradas</p>
        <button mat-raised-button color="primary" routerLink="/activities/new">Registrar actividad</button>
      </div>

      <div *ngIf="!loading" class="card-list">
        <mat-card *ngFor="let a of activities">
          <mat-card-content>
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:44px;height:44px;background:#e8f5e9;border-radius:12px;display:flex;align-items:center;justify-content:center">
                <mat-icon style="color:#2e7d32">directions_run</mat-icon>
              </div>
              <div style="flex:1">
                <div style="font-weight:500">{{ a.activityTypeName }}</div>
                <div class="text-muted">
                  {{ a.activityDate | date:'dd/MM/yyyy' }} · {{ a.durationMin }} min
                  <span *ngIf="a.calories != null"> · 🔥 {{ a.calories }} kcal</span>
                </div>
              </div>
              <a mat-icon-button [routerLink]="['/activities', a.id, 'edit']"><mat-icon>edit</mat-icon></a>
              <button mat-icon-button color="warn" (click)="delete(a)"><mat-icon>delete</mat-icon></button>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="!lastPage" class="text-center mt-16">
          <button mat-stroked-button (click)="loadMore()" [disabled]="loadingMore">
            {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
          </button>
        </div>
      </div>

      <!-- Botón flotante: registrar nueva actividad (permite varias por día) -->
      <a *ngIf="!loading" mat-fab color="primary" routerLink="/activities/new"
         aria-label="Registrar actividad"
         style="position:fixed;right:20px;bottom:80px;z-index:100">
        <mat-icon>add</mat-icon>
      </a>
    </div>
  `
})
export class ActivityListComponent implements OnInit {
  private svc    = inject(ActivityService);
  private snack  = inject(MatSnackBar);

  activities  : PhysicalActivity[] = [];
  loading      = true;
  loadingMore  = false;
  lastPage     = false;
  page         = 0;

  ngOnInit() { this.load(); }

  load() {
    this.svc.getHistory(this.page).subscribe({
      next: res => {
        this.activities = [...this.activities, ...res.content];
        this.lastPage   = res.last;
        this.loading    = this.loadingMore = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadMore() { this.loadingMore = true; this.page++; this.load(); }

  delete(a: PhysicalActivity) {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.svc.delete(a.id).subscribe({
      next: () => { this.activities = this.activities.filter(x => x.id !== a.id); this.snack.open('Eliminado', '', { duration: 2000 }); },
      error: () => this.snack.open('Error', '', { duration: 2500 })
    });
  }
}
