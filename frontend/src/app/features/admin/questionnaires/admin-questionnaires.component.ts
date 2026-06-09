import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';
import {
  QuestionnaireSetting, PatientQuestionnaireStatus, InstanceStatus, QuestionnaireResponseDetail
} from '../../../core/models/questionnaire.model';

@Component({
  selector: 'app-admin-questionnaires',
  standalone: true,
  imports: [CommonModule,
            MatCardModule, MatSlideToggleModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <h2 style="margin:0 0 16px">Cuestionarios</h2>

    <!-- Disponibilidad -->
    <mat-card class="mb-16">
      <mat-card-header><mat-card-title style="font-size:16px">Disponibilidad</mat-card-title></mat-card-header>
      <mat-card-content>
        <p class="text-muted" style="font-size:13px">Los pacientes solo ven los cuestionarios habilitados.</p>
        <div *ngFor="let s of settings" class="setting-row">
          <span>{{ s.label }}</span>
          <mat-slide-toggle color="primary" [checked]="s.enabled" (change)="toggle(s, $event.checked)">
            {{ s.enabled ? 'Habilitado' : 'Deshabilitado' }}
          </mat-slide-toggle>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Seguimiento -->
    <mat-card>
      <mat-card-header><mat-card-title style="font-size:16px">Estado por paciente</mat-card-title></mat-card-header>
      <mat-card-content>
        <div *ngIf="loading" class="text-center mt-16"><mat-spinner diameter="32" style="margin:0 auto"></mat-spinner></div>

        <div *ngIf="!loading" style="overflow-x:auto">
          <table class="grid">
            <thead>
              <tr>
                <th>Paciente</th><th>DNI</th>
                <th>C1 · Pretest</th><th>C1 · Postest</th><th>Cuestionario 2</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of overview">
                <td>{{ p.fullName }}</td>
                <td>{{ p.dni || '—' }}</td>
                <td *ngFor="let inst of p.instances">
                  <button *ngIf="inst.completed" class="cell-btn" (click)="viewDetail(p, inst)">
                    <span class="badge-normal">Completado</span>
                    <div class="text-muted" style="font-size:11px;margin-top:2px">{{ inst.submittedAt | date:'dd/MM/yy HH:mm' }}</div>
                  </button>
                  <span *ngIf="!inst.completed" class="badge-high">Pendiente</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="overview.length === 0" class="empty-state"><mat-icon>quiz</mat-icon><p>Sin pacientes</p></div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Detalle de respuestas -->
    <div *ngIf="detail" class="overlay" (click)="detail = null">
      <mat-card style="width:92%;max-width:560px;max-height:85vh;overflow:auto" (click)="$event.stopPropagation()">
        <mat-card-header>
          <mat-card-title style="font-size:16px">{{ detailPatient }} — {{ detail.label }}</mat-card-title>
          <mat-card-subtitle>Respondido el {{ detail.submittedAt | date:'dd/MM/yyyy HH:mm' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let a of detail.answers" class="answer-row">
            <div style="font-size:13px">{{ a.orderNum }}. {{ a.text }}</div>
            <div class="answer-val">{{ a.value }}</div>
          </div>
        </mat-card-content>
        <mat-card-actions><button mat-button (click)="detail = null">Cerrar</button></mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .setting-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(0,0,0,.06); }
    .setting-row:last-child { border-bottom:none; }
    .grid { width:100%; border-collapse:collapse; background:white; }
    .grid th, .grid td { text-align:left; padding:10px 12px; border-bottom:1px solid rgba(0,0,0,.08); font-size:14px; vertical-align:top; }
    .grid th { font-size:12px; color:rgba(0,0,0,.6); }
    .cell-btn { background:none; border:none; cursor:pointer; padding:0; text-align:left; }
    .overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:300; display:flex; align-items:center; justify-content:center; }
    .answer-row { display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid rgba(0,0,0,.06); }
    .answer-val { margin-left:auto; min-width:34px; height:34px; border-radius:50%; background:#ede7f6; color:#5e35b1; display:flex; align-items:center; justify-content:center; font-weight:600; }
  `]
})
export class AdminQuestionnairesComponent implements OnInit {
  private svc   = inject(QuestionnaireService);
  private snack = inject(MatSnackBar);

  settings : QuestionnaireSetting[] = [];
  overview : PatientQuestionnaireStatus[] = [];
  loading = true;
  detail : QuestionnaireResponseDetail | null = null;
  detailPatient = '';

  ngOnInit() {
    this.svc.getSettings().subscribe(s => this.settings = s);
    this.svc.getResponsesOverview().subscribe({
      next: o => { this.overview = o; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggle(s: QuestionnaireSetting, enabled: boolean) {
    this.svc.updateSetting(s.key, enabled).subscribe({
      next: updated => {
        s.enabled = updated.enabled;
        this.snack.open(`${s.label}: ${updated.enabled ? 'habilitado' : 'deshabilitado'}`, '', { duration: 2000 });
      },
      error: () => { this.snack.open('Error al actualizar', '', { duration: 2500 }); s.enabled = !enabled; }
    });
  }

  viewDetail(p: PatientQuestionnaireStatus, inst: InstanceStatus) {
    this.detailPatient = p.fullName;
    this.svc.getResponseDetail(p.userId, inst.key).subscribe({
      next: d => this.detail = d,
      error: () => this.snack.open('No se pudo cargar el detalle', '', { duration: 2500 })
    });
  }
}
