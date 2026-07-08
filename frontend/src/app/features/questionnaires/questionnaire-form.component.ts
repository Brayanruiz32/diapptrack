import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuestionnaireService } from '../../core/services/questionnaire.service';
import { Questionnaire } from '../../core/models/questionnaire.model';

@Component({
  selector: 'app-questionnaire-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatRadioModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/questionnaires"><mat-icon>arrow_back</mat-icon></button>
      <span>{{ questionnaire?.label || 'Cuestionario' }}</span>
    </mat-toolbar>

    <div class="page-container">
      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading && questionnaire">
        <mat-card class="mb-16">
          <mat-card-content>
            <div style="display:flex;align-items:center;gap:8px;color:rgba(0,0,0,.6);font-size:13px">
              <mat-icon style="font-size:18px;width:18px;height:18px">info</mat-icon>
              <span>{{ legend }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngFor="let q of questionnaire.questions; let i = index" class="mb-16">
          <mat-card-content>
            <div style="font-weight:500;margin-bottom:12px">{{ i + 1 }}. {{ q.text }}</div>
            <mat-radio-group [(ngModel)]="values[q.id]" [name]="'q' + q.id" class="scale-row">
              <mat-radio-button *ngFor="let v of range(q.minValue, q.maxValue)" [value]="v" color="primary">
                {{ v }}
              </mat-radio-button>
            </mat-radio-group>
          </mat-card-content>
        </mat-card>

        <button mat-raised-button color="primary" class="full-width mt-8" [disabled]="saving" (click)="submit()">
          {{ saving ? 'Enviando...' : 'Enviar respuestas' }}
        </button>
        <p class="text-muted text-center" style="font-size:12px;margin-top:8px">
          Una vez enviado no podrás modificar tus respuestas.
        </p>
      </ng-container>
    </div>
  `,
  styles: [`
    .scale-row { display:flex; flex-wrap:wrap; gap:14px; }
  `]
})
export class QuestionnaireFormComponent implements OnInit {
  private svc    = inject(QuestionnaireService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  questionnaire: Questionnaire | null = null;
  values: Record<number, number | null> = {};
  loading = true;
  saving  = false;
  key = '';

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') ?? '';
    this.svc.getAvailable().subscribe({
      next: list => {
        this.questionnaire = list.find(q => q.key === this.key) ?? null;
        this.loading = false;
        if (!this.questionnaire) {
          this.snack.open('El cuestionario no está disponible', '', { duration: 3000 });
          this.router.navigate(['/questionnaires']);
        }
      },
      error: () => { this.loading = false; this.router.navigate(['/questionnaires']); }
    });
  }

  get legend(): string {
    if (this.key.startsWith('Q1')) return 'Responde con el número de días (0 = ningún día, 7 = todos los días).';
    return 'Escala 1 a 7  ·  1 = Totalmente en desacuerdo, 7 = Totalmente de acuerdo.';
  }

  range(min: number, max: number): number[] {
    const arr: number[] = [];
    for (let i = min; i <= max; i++) arr.push(i);
    return arr;
  }

  submit() {
    if (!this.questionnaire) return;
    const answers = this.questionnaire.questions.map(q => ({ questionId: q.id, value: this.values[q.id] }));
    if (answers.some(a => a.value == null)) {
      this.snack.open('Responde todas las preguntas antes de enviar', '', { duration: 2500 });
      return;
    }
    this.saving = true;
    this.svc.submit(this.key, { answers: answers as { questionId: number; value: number }[] }).subscribe({
      next: () => {
        this.snack.open('Respuestas enviadas. ¡Gracias!', '', { duration: 2500 });
        this.router.navigate(['/questionnaires']);
      },
      error: e => { this.snack.open(e.error?.message ?? 'Error al enviar', '', { duration: 3000 }); this.saving = false; }
    });
  }
}
