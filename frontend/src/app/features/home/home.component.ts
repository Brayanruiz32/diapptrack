import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { HomeService } from '../../core/services/home.service';
import { AuthService } from '../../core/services/auth.service';
import { QuestionnaireService } from '../../core/services/questionnaire.service';
import { HomeSummary } from '../../core/models/home.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule, MatRippleModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <span>DiappTrack</span>
      <span style="flex:1"></span>
      <a mat-icon-button routerLink="/profile">
        <mat-icon>account_circle</mat-icon>
      </a>
      <a mat-icon-button routerLink="/notifications">
        <mat-icon>notifications</mat-icon>
      </a>
    </mat-toolbar>

    <div class="page-container">
      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="!loading && summary">
        <h2 style="margin:0 0 16px; font-size:18px; color:rgba(0,0,0,.7)">
          Hola, {{ auth.currentUser()?.fullName?.split(' ')?.[0] }} 👋
        </h2>

        <!-- Glucosa -->
        <a routerLink="/glucose" style="text-decoration:none">
          <mat-card matRipple class="widget-card mb-16">
            <mat-card-content>
              <div class="widget-row">
                <div class="widget-icon glucose-icon">
                  <mat-icon>water_drop</mat-icon>
                </div>
                <div class="widget-info">
                  <div class="widget-title">Última glucosa</div>
                  <div *ngIf="summary.lastGlucose" class="widget-value">
                    {{ summary.lastGlucose.valueMgdl }} mg/dL
                    <span [class]="alertClass(summary.lastGlucose.alert)">
                      {{ alertLabel(summary.lastGlucose.alert) }}
                    </span>
                  </div>
                  <div *ngIf="!summary.lastGlucose" class="widget-empty">Sin registros</div>
                </div>
                <mat-icon class="widget-arrow">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>

        <!-- Medicación -->
        <a routerLink="/medications" style="text-decoration:none">
          <mat-card matRipple class="widget-card mb-16">
            <mat-card-content>
              <div class="widget-row">
                <div class="widget-icon med-icon">
                  <mat-icon>medication</mat-icon>
                </div>
                <div class="widget-info">
                  <div class="widget-title">Medicación hoy</div>
                  <div class="widget-value">
                    {{ summary.medicationToday.taken }}/{{ summary.medicationToday.total }} tomados
                    <span *ngIf="summary.medicationToday.pending > 0" style="color:#e65100; font-size:12px; margin-left:4px">
                      ({{ summary.medicationToday.pending }} pendiente{{ summary.medicationToday.pending > 1 ? 's' : '' }})
                    </span>
                  </div>
                  <div *ngIf="summary.medicationToday.total === 0" class="widget-empty">Sin medicamentos registrados</div>
                </div>
                <mat-icon class="widget-arrow">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>

        <!-- Actividad -->
        <a routerLink="/activities" style="text-decoration:none">
          <mat-card matRipple class="widget-card mb-16">
            <mat-card-content>
              <div class="widget-row">
                <div class="widget-icon act-icon">
                  <mat-icon>directions_run</mat-icon>
                </div>
                <div class="widget-info">
                  <div class="widget-title">Actividad física hoy</div>
                  <div class="widget-value">{{ summary.activityToday.totalMinutes }} min</div>
                  <div *ngIf="summary.activityToday.totalMinutes === 0" class="widget-empty">Sin actividad registrada</div>
                </div>
                <mat-icon class="widget-arrow">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>

        <!-- Alimentación -->
        <a routerLink="/nutrition" style="text-decoration:none">
          <mat-card matRipple class="widget-card mb-16">
            <mat-card-content>
              <div class="widget-row">
                <div class="widget-icon nut-icon">
                  <mat-icon>restaurant</mat-icon>
                </div>
                <div class="widget-info">
                  <div class="widget-title">Alimentación hoy</div>
                  <div *ngIf="summary.nutritionToday.registered" class="widget-value">
                    <span [class]="summary.nutritionToday.isHealthy ? 'badge-normal' : 'badge-high'">
                      {{ summary.nutritionToday.isHealthy ? 'Saludable' : 'Mejorable' }}
                    </span>
                  </div>
                  <div *ngIf="!summary.nutritionToday.registered" class="widget-empty">Sin registro hoy</div>
                </div>
                <mat-icon class="widget-arrow">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>

        <!-- Educación -->
        <a routerLink="/education" style="text-decoration:none">
          <mat-card matRipple class="widget-card">
            <mat-card-content>
              <div class="widget-row">
                <div class="widget-icon edu-icon">
                  <mat-icon>menu_book</mat-icon>
                </div>
                <div class="widget-info">
                  <div class="widget-title">Educación</div>
                  <div class="widget-value">
                    <span *ngIf="summary.education.unreadCount > 0" class="badge-high">
                      {{ summary.education.unreadCount }} sin leer
                    </span>
                    <span *ngIf="summary.education.unreadCount === 0" class="badge-normal">
                      Al día ✓
                    </span>
                  </div>
                </div>
                <mat-icon class="widget-arrow">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>

        <!-- Cuestionarios -->
        <a routerLink="/questionnaires" style="text-decoration:none">
          <mat-card matRipple class="widget-card" style="margin-top:12px">
            <mat-card-content>
              <div class="widget-row">
                <div class="widget-icon q-icon">
                  <mat-icon>quiz</mat-icon>
                </div>
                <div class="widget-info">
                  <div class="widget-title">Cuestionarios</div>
                  <div class="widget-value">
                    <span *ngIf="pendingQuestionnaires > 0" class="badge-high">
                      {{ pendingQuestionnaires }} pendiente{{ pendingQuestionnaires > 1 ? 's' : '' }}
                    </span>
                    <span *ngIf="pendingQuestionnaires === 0" class="badge-normal">Al día ✓</span>
                  </div>
                </div>
                <mat-icon class="widget-arrow">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .widget-card { cursor: pointer; margin-bottom: 12px; transition: box-shadow .2s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15) !important; } }
    /* Mantiene estable el padding inferior aunque matRipple inserte el elemento de
       onda como último hijo (que haría perder el ':last-child' y encoger la tarjeta). */
    ::ng-deep .widget-card .mat-mdc-card-content { padding-bottom: 16px; }
    .widget-row { display: flex; align-items: center; gap: 14px; }
    .widget-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: white; font-size: 22px; width: 22px; height: 22px; } }
    .glucose-icon { background: #1565c0; }
    .med-icon     { background: #7b1fa2; }
    .act-icon     { background: #2e7d32; }
    .nut-icon     { background: #e65100; }
    .edu-icon     { background: #0277bd; }
    .q-icon       { background: #5e35b1; }
    .widget-info  { flex: 1; min-width: 0; }
    .widget-title { font-size: 12px; color: rgba(0,0,0,.54); margin-bottom: 2px; }
    .widget-value { font-size: 16px; font-weight: 500; }
    .widget-empty { font-size: 13px; color: rgba(0,0,0,.38); font-style: italic; }
    .widget-arrow { color: rgba(0,0,0,.3); }
  `]
})
export class HomeComponent implements OnInit {
  homeService          = inject(HomeService);
  auth                 = inject(AuthService);
  private questionnaireService = inject(QuestionnaireService);

  summary: HomeSummary | null = null;
  loading = true;
  pendingQuestionnaires = 0;

  ngOnInit() {
    this.homeService.getSummary().subscribe({
      next:  s => { this.summary = s; this.loading = false; },
      error: () => this.loading = false
    });
    this.questionnaireService.getAvailable().subscribe({
      next: q => this.pendingQuestionnaires = q.length,
      error: () => {}
    });
  }

  alertClass(alert: string) {
    return { LOW: 'badge-low', NORMAL: 'badge-normal', HIGH: 'badge-high' }[alert] ?? 'badge-normal';
  }
  alertLabel(alert: string) {
    return { LOW: 'Baja', NORMAL: 'Normal', HIGH: 'Alta' }[alert] ?? '';
  }
}
