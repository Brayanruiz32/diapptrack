import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicationService } from '../../core/services/medication.service';
import { Medication, MedicationTodayItem } from '../../core/models/medication.model';

@Component({
  selector: 'app-medication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
            MatToolbarModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatIconModule,
            MatCheckboxModule, MatTabsModule, MatDividerModule,
            MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Medicación</span>
    </mat-toolbar>

    <mat-tab-group class="page-container" style="background:transparent">
      <!-- Tab: Hoy -->
      <mat-tab label="Hoy">
        <div style="padding-top:16px">
          <div *ngIf="todayItems.length === 0" class="empty-state">
            <mat-icon>medication</mat-icon>
            <p>No hay medicamentos programados para hoy</p>
            <small class="text-muted">Agrega medicamentos en la pestaña "Mis Medicamentos"</small>
          </div>

          <mat-card *ngFor="let item of todayItems" style="margin-bottom:10px">
            <mat-card-content>
              <div style="display:flex;align-items:center;gap:12px">
                <mat-checkbox color="primary"
                  [checked]="item.taken"
                  (change)="toggle(item, $event.checked)">
                </mat-checkbox>
                <div style="flex:1">
                  <div style="font-weight:500" [class.taken-text]="item.taken">
                    {{ item.medicationName }} {{ item.dose }}
                  </div>
                  <div class="text-muted">🕐 {{ item.time | slice:0:5 }}</div>
                </div>
                <span [class]="item.taken ? 'badge-normal' : 'badge-high'">
                  {{ item.taken ? 'Tomado' : 'Pendiente' }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>

      <!-- Tab: Mis Medicamentos -->
      <mat-tab label="Mis Medicamentos">
        <div style="padding-top:16px">
          <mat-card *ngFor="let m of medications" style="margin-bottom:10px">
            <mat-card-content>
              <div style="display:flex;align-items:flex-start;gap:12px">
                <div style="flex:1">
                  <div style="font-weight:500">{{ m.name }}</div>
                  <div class="text-muted" style="margin-bottom:4px">{{ m.dose }}</div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <span *ngFor="let s of m.schedules" class="time-chip">{{ s.time | slice:0:5 }}</span>
                  </div>
                </div>
                <button mat-icon-button (click)="editMedication(m)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteMedication(m)"><mat-icon>delete</mat-icon></button>
              </div>
            </mat-card-content>
          </mat-card>

          <div *ngIf="medications.length === 0" class="empty-state">
            <mat-icon>medication</mat-icon>
            <p>Sin medicamentos configurados</p>
          </div>

          <mat-divider style="margin:16px 0"></mat-divider>

          <!-- Formulario agregar / editar -->
          <h3 style="margin:0 0 12px">{{ editingMed ? 'Editar' : 'Agregar' }} medicamento</h3>
          <form [formGroup]="medForm" (ngSubmit)="saveMedication()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre del medicamento</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dosis</mat-label>
              <input matInput formControlName="dose" placeholder="Ej: 850 mg">
            </mat-form-field>

            <!-- Horarios múltiples -->
            <label style="font-size:14px;color:rgba(0,0,0,.6)">Horarios</label>
            <div formArrayName="times">
              <div *ngFor="let ctrl of times.controls; let i = index"
                   style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <mat-form-field appearance="outline" style="flex:1;margin-bottom:-1.25em">
                  <mat-label>Hora {{ i + 1 }}</mat-label>
                  <input matInput type="time" [formControlName]="i">
                </mat-form-field>
                <button mat-icon-button color="warn" type="button"
                        (click)="removeTime(i)" [disabled]="times.length === 1">
                  <mat-icon>remove_circle_outline</mat-icon>
                </button>
              </div>
            </div>
            <button mat-stroked-button type="button" (click)="addTime()" style="align-self:flex-start">
              <mat-icon>add</mat-icon> Agregar horario
            </button>

            <div style="display:flex;gap:8px;margin-top:8px">
              <button mat-raised-button color="primary" type="submit" style="flex:1" [disabled]="medForm.invalid || saving">
                {{ saving ? 'Guardando...' : (editingMed ? 'Actualizar' : 'Agregar') }}
              </button>
              <button *ngIf="editingMed" mat-stroked-button type="button" (click)="cancelEdit()">Cancelar</button>
            </div>
          </form>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .time-chip { background:#ede7f6; color:#5e35b1; border-radius:12px; padding:2px 10px; font-size:12px; font-weight:500; }
    .taken-text { text-decoration: line-through; color: rgba(0,0,0,.45); }
  `]
})
export class MedicationComponent implements OnInit {
  private svc   = inject(MedicationService);
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  medications : Medication[]          = [];
  todayItems  : MedicationTodayItem[] = [];
  editingMed  : Medication | null     = null;
  saving       = false;

  medForm = this.fb.group({
    name:  ['', Validators.required],
    dose:  ['', Validators.required],
    times: this.fb.array([this.newTimeControl()], Validators.required)
  });

  get times(): FormArray { return this.medForm.get('times') as FormArray; }

  private newTimeControl(value = '') {
    return this.fb.control(value, Validators.required);
  }

  addTime() { this.times.push(this.newTimeControl()); }
  removeTime(i: number) { if (this.times.length > 1) this.times.removeAt(i); }

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.svc.getAll().subscribe(m => this.medications = m);
    this.svc.getToday().subscribe(t => this.todayItems = t);
  }

  toggle(item: MedicationTodayItem, taken: boolean) {
    this.svc.setTodayTaken(item.scheduleId, taken).subscribe({
      next: updated => {
        const idx = this.todayItems.findIndex(i => i.scheduleId === item.scheduleId);
        if (idx >= 0) this.todayItems[idx] = updated;
      },
      error: () => this.snack.open('Error al actualizar', '', { duration: 2000 })
    });
  }

  saveMedication() {
    if (this.medForm.invalid) return;
    this.saving = true;
    const data = {
      name:  this.medForm.value.name!,
      dose:  this.medForm.value.dose!,
      times: this.times.value as string[]
    };
    const obs = this.editingMed
      ? this.svc.update(this.editingMed.id, data)
      : this.svc.create(data);

    obs.subscribe({
      next: () => { this.snack.open('Guardado', '', { duration: 2000 }); this.loadAll(); this.cancelEdit(); this.saving = false; },
      error: () => { this.snack.open('Error al guardar', '', { duration: 2500 }); this.saving = false; }
    });
  }

  editMedication(m: Medication) {
    this.editingMed = m;
    // Reconstruir el FormArray de horarios con los del medicamento
    this.times.clear();
    const sorted = [...m.schedules].sort((a, b) => a.time.localeCompare(b.time));
    (sorted.length ? sorted : [{ time: '' } as any]).forEach(s =>
      this.times.push(this.newTimeControl(s.time ? s.time.slice(0, 5) : ''))
    );
    this.medForm.patchValue({ name: m.name, dose: m.dose });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingMed = null;
    this.times.clear();
    this.times.push(this.newTimeControl());
    this.medForm.reset({ name: '', dose: '' });
  }

  deleteMedication(m: Medication) {
    if (!confirm(`¿Eliminar ${m.name}?`)) return;
    this.svc.delete(m.id).subscribe({
      next: () => { this.medications = this.medications.filter(x => x.id !== m.id); this.loadAll(); this.snack.open('Eliminado', '', { duration: 2000 }); },
      error: () => this.snack.open('Error al eliminar', '', { duration: 2500 })
    });
  }
}
