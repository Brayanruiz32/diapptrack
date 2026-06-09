import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GlucoseService } from '../../core/services/glucose.service';
import { localDateTimeStr } from '../../core/utils/date.utils';

@Component({
  selector: 'app-glucose-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatIconModule,
            MatDatepickerModule, MatNativeDateModule, MatSnackBarModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/glucose"><mat-icon>arrow_back</mat-icon></button>
      <span>{{ isEdit ? 'Editar' : 'Nueva' }} medición</span>
    </mat-toolbar>

    <div class="page-container">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-container">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha y hora</mat-label>
              <input matInput type="datetime-local" formControlName="measuredAt">
              <mat-error>Requerido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Glucosa (mg/dL)</mat-label>
              <input matInput type="number" formControlName="valueMgdl" min="10" max="900">
              <span matTextSuffix>mg/dL</span>
              <mat-error *ngIf="form.get('valueMgdl')?.hasError('required')">Requerido</mat-error>
              <mat-error *ngIf="form.get('valueMgdl')?.hasError('min') || form.get('valueMgdl')?.hasError('max')">
                Valor entre 10 y 900
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observaciones (opcional)</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width" [disabled]="loading">
              {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar') }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class GlucoseFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(GlucoseService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);

  isEdit  = false;
  editId  = 0;
  loading = false;

  form = this.fb.group({
    measuredAt: [this.nowLocal(), Validators.required],
    valueMgdl:  [null as number | null, [Validators.required, Validators.min(10), Validators.max(900)]],
    notes:      ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      this.svc.getById(this.editId).subscribe(r => {
        this.form.patchValue({
          measuredAt: r.measuredAt.slice(0, 16),
          valueMgdl:  r.valueMgdl,
          notes:      r.notes ?? ''
        });
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { measuredAt, valueMgdl, notes } = this.form.value;
    const payload = { measuredAt: measuredAt + ':00', valueMgdl: valueMgdl!, notes: notes ?? '' };

    const obs = this.isEdit
      ? this.svc.update(this.editId, payload)
      : this.svc.create(payload);

    obs.subscribe({
      next:  () => { this.snack.open('Guardado', '', { duration: 2000 }); this.router.navigate(['/glucose']); },
      error: () => { this.snack.open('Error al guardar', '', { duration: 2500 }); this.loading = false; }
    });
  }

  private nowLocal(): string {
    const d = new Date();
    d.setSeconds(0, 0);
    return localDateTimeStr(d);
  }
}
