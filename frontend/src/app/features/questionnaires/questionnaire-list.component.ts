import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuestionnaireService } from '../../core/services/questionnaire.service';
import { Questionnaire, QuestionnaireResponseDetail } from '../../core/models/questionnaire.model';

@Component({
  selector: 'app-questionnaire-list',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Cuestionarios</span>
    </mat-toolbar>

    <div class="page-container">
      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Pendientes -->
        <h3 style="margin:0 0 12px">Pendientes</h3>
        <div *ngIf="available.length === 0" class="empty-state" style="padding:24px 0">
          <mat-icon>task_alt</mat-icon>
          <p>No tienes cuestionarios pendientes</p>
        </div>

        <a *ngFor="let q of available" [routerLink]="['/questionnaires', q.key]" style="text-decoration:none">
          <mat-card class="q-card mb-16">
            <mat-card-content>
              <div style="display:flex;align-items:center;gap:14px">
                <div class="q-icon"><mat-icon>quiz</mat-icon></div>
                <div style="flex:1">
                  <div style="font-weight:500">{{ q.label }}</div>
                  <div class="text-muted" style="font-size:13px">{{ q.questions.length }} preguntas</div>
                </div>
                <mat-icon style="color:rgba(0,0,0,.3)">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>

        <!-- Completados -->
        <ng-container *ngIf="completed.length > 0">
          <h3 style="margin:24px 0 12px">Completados</h3>
          <mat-card *ngFor="let c of completed" class="mb-16">
            <mat-card-content>
              <div style="display:flex;align-items:center;gap:14px">
                <mat-icon style="color:#2e7d32">check_circle</mat-icon>
                <div style="flex:1">
                  <div style="font-weight:500">{{ c.label }}</div>
                  <div class="text-muted" style="font-size:12px">
                    Respondido el {{ c.submittedAt | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </div>
                <span class="badge-normal">Completado</span>
              </div>
            </mat-card-content>
          </mat-card>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .q-card { cursor:pointer; transition: box-shadow .2s; }
    .q-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.15) !important; }
    .q-icon { width:44px; height:44px; border-radius:12px; background:#5e35b1; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .q-icon mat-icon { color:white; }
  `]
})
export class QuestionnaireListComponent implements OnInit {
  private svc = inject(QuestionnaireService);

  available : Questionnaire[] = [];
  completed : QuestionnaireResponseDetail[] = [];
  loading = true;

  ngOnInit() {
    this.svc.getAvailable().subscribe({
      next: a => { this.available = a; this.checkLoaded(); },
      error: () => this.checkLoaded()
    });
    this.svc.getMine().subscribe({
      next: m => { this.completed = m; this.checkLoaded(); },
      error: () => this.checkLoaded()
    });
  }

  private pending = 2;
  private checkLoaded() { if (--this.pending <= 0) this.loading = false; }
}
