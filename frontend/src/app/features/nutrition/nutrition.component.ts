import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NutritionService } from '../../core/services/nutrition.service';
import { NutritionLog } from '../../core/models/nutrition.model';
import { localDateStr } from '../../core/utils/date.utils';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
            MatToolbarModule, MatCardModule, MatCheckboxModule,
            MatButtonModule, MatIconModule, MatDividerModule,
            MatSnackBarModule, MatTabsModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Alimentación</span>
    </mat-toolbar>

    <mat-tab-group class="page-container" style="background:transparent">
      <!-- Tab: Hoy -->
      <mat-tab label="Hoy">
        <div style="padding-top:16px">

          <!-- Cargando -->
          <div *ngIf="loading" class="text-center mt-24 text-muted">Cargando...</div>

          <!-- RESUMEN: ya registró hoy y no está editando -->
          <mat-card *ngIf="!loading && todayLog && !editing">
            <mat-card-header>
              <mat-card-title style="font-size:16px">Tu registro de hoy</mat-card-title>
              <mat-card-subtitle>{{ today | date:'EEEE, d MMMM':'':'es' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-row"><span>🍎 Frutas</span> <b>{{ todayLog.ateFruits ? 'Sí' : 'No' }}</b></div>
              <mat-divider></mat-divider>
              <div class="summary-row"><span>🥦 Verduras</span> <b>{{ todayLog.ateVegetables ? 'Sí' : 'No' }}</b></div>
              <mat-divider></mat-divider>
              <div class="summary-row"><span>🥤 Bebidas azucaradas</span> <b>{{ todayLog.drankSugary ? 'Sí' : 'No' }}</b></div>
              <mat-divider></mat-divider>
              <div class="summary-row"><span>🍔 Comida rápida</span> <b>{{ todayLog.ateFastFood ? 'Sí' : 'No' }}</b></div>
              <mat-divider></mat-divider>
              <div class="summary-row"><span>⏰ Respetó horarios</span> <b>{{ todayLog.respectedSchedule ? 'Sí' : 'No' }}</b></div>

              <div class="status-row mt-16">
                <span [class]="todayLog.isHealthy ? 'badge-normal' : 'badge-high'" style="font-size:14px;padding:4px 12px">
                  {{ todayLog.isHealthy ? '✓ Alimentación saludable' : '⚠ Requiere mejorar' }}
                </span>
              </div>

              <button mat-stroked-button color="primary" class="full-width mt-16" (click)="startEdit()">
                <mat-icon>edit</mat-icon> Editar registro
              </button>
            </mat-card-content>
          </mat-card>

          <!-- FORMULARIO: no hay registro o se está editando -->
          <mat-card *ngIf="!loading && (!todayLog || editing)">
            <mat-card-header>
              <mat-card-title style="font-size:16px">
                {{ todayLog ? 'Editar registro de hoy' : 'Registro de hoy' }}
              </mat-card-title>
              <mat-card-subtitle>{{ today | date:'EEEE, d MMMM':'':'es' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="form" (ngSubmit)="save()" class="form-container" style="gap:4px">
                <div class="question-item">
                  <mat-checkbox formControlName="ateFruits" color="primary">¿Consumió frutas hoy?</mat-checkbox>
                </div>
                <mat-divider></mat-divider>
                <div class="question-item">
                  <mat-checkbox formControlName="ateVegetables" color="primary">¿Consumió verduras hoy?</mat-checkbox>
                </div>
                <mat-divider></mat-divider>
                <div class="question-item">
                  <mat-checkbox formControlName="drankSugary" color="warn">¿Consumió bebidas azucaradas hoy?</mat-checkbox>
                </div>
                <mat-divider></mat-divider>
                <div class="question-item">
                  <mat-checkbox formControlName="ateFastFood" color="warn">¿Consumió comida rápida hoy?</mat-checkbox>
                </div>
                <mat-divider></mat-divider>
                <div class="question-item">
                  <mat-checkbox formControlName="respectedSchedule" color="primary">¿Respetó sus horarios de alimentación?</mat-checkbox>
                </div>

                <button mat-raised-button color="primary" type="submit"
                        class="full-width mt-16" [disabled]="saving">
                  {{ saving ? 'Guardando...' : (todayLog ? 'Actualizar' : 'Guardar') }}
                </button>
                <button *ngIf="editing" mat-button type="button" class="full-width" (click)="cancelEdit()">
                  Cancelar
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- Tab: Historial -->
      <mat-tab label="Historial">
        <div style="padding-top:16px">
          <div *ngIf="history.length === 0" class="empty-state">
            <mat-icon>restaurant</mat-icon>
            <p>Sin historial de alimentación</p>
          </div>
          <mat-card *ngFor="let h of history" style="margin-bottom:10px">
            <mat-card-content>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div>
                  <div style="font-weight:500">{{ h.logDate | date:'dd/MM/yyyy' }}</div>
                  <div class="text-muted" style="font-size:12px">
                    Frutas: {{ h.ateFruits ? 'Sí' : 'No' }} ·
                    Verduras: {{ h.ateVegetables ? 'Sí' : 'No' }} ·
                    Azúcar: {{ h.drankSugary ? 'Sí' : 'No' }}
                  </div>
                </div>
                <span [class]="h.isHealthy ? 'badge-normal' : 'badge-high'">
                  {{ h.isHealthy ? 'Saludable' : 'Mejorable' }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>

          <div *ngIf="!lastPage" class="text-center mt-16">
            <button mat-stroked-button (click)="loadMore()" [disabled]="loadingMore">
              {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
            </button>
          </div>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .question-item { padding: 12px 0; }
    .status-row { display:flex; justify-content:center; }
    .summary-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; }
  `]
})
export class NutritionComponent implements OnInit {
  private svc    = inject(NutritionService);
  private fb     = inject(FormBuilder);
  private snack  = inject(MatSnackBar);
  private router = inject(Router);

  todayLog   : NutritionLog | null = null;
  history    : NutritionLog[]      = [];
  loading     = true;
  editing     = false;
  saving      = false;
  loadingMore = false;
  lastPage    = false;
  page        = 0;
  today       = new Date();
  todayStr    = localDateStr();

  form = this.fb.group({
    ateFruits:         [false],
    ateVegetables:     [false],
    drankSugary:       [false],
    ateFastFood:       [false],
    respectedSchedule: [false]
  });

  ngOnInit() {
    // Validar ingreso único por día: si ya registró hoy, mostramos el resumen.
    this.svc.getToday().subscribe({
      next: log => { this.todayLog = log; this.loading = false; },   // hay registro -> resumen
      error: () => { this.todayLog = null; this.loading = false; }    // 404 -> formulario
    });
    this.loadHistory();
  }

  startEdit() {
    this.editing = true;
    const log = this.todayLog;
    if (!log) return;
    // Rellena los checkboxes DESPUÉS de que el formulario se renderiza,
    // para que reflejen de forma fiable los valores previamente guardados.
    setTimeout(() => this.form.patchValue({
      ateFruits:         log.ateFruits,
      ateVegetables:     log.ateVegetables,
      drankSugary:       log.drankSugary,
      ateFastFood:       log.ateFastFood,
      respectedSchedule: log.respectedSchedule
    }));
  }

  cancelEdit() {
    this.editing = false;
  }

  loadHistory() {
    this.svc.getHistory(this.page).subscribe(res => {
      this.history     = [...this.history, ...res.content];
      this.lastPage    = res.last;
      this.loadingMore = false;
    });
  }

  loadMore() { this.loadingMore = true; this.page++; this.loadHistory(); }

  save() {
    this.saving = true;
    const data  = { logDate: this.todayStr, ...this.form.value } as any;
    const obs   = this.todayLog
      ? this.svc.update(this.todayLog.id, data)
      : this.svc.create(data);

    obs.subscribe({
      next: () => {
        this.snack.open('Registro guardado', '', { duration: 2000 });
        this.saving = false;
        // Redirección posterior al registro exitoso
        this.router.navigate(['/home']);
      },
      error: () => { this.snack.open('Error al guardar', '', { duration: 2500 }); this.saving = false; }
    });
  }
}
