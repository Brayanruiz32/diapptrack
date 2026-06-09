import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule,
            MatTableModule, MatButtonModule, MatIconModule,
            MatProgressSpinnerModule, MatInputModule,
            MatFormFieldModule, MatSnackBarModule],
  template: `
    <div class="pl-header">
      <h2 style="margin:0">Pacientes</h2>
      <div class="pl-actions">
        <button mat-stroked-button (click)="exportAll()" [disabled]="exporting">
          <mat-icon>download</mat-icon> {{ exporting ? 'Exportando...' : 'Exportar Excel' }}
        </button>
        <a mat-raised-button color="primary" routerLink="/admin/patients/new">
          <mat-icon>person_add</mat-icon> Nuevo paciente
        </a>
      </div>
    </div>

    <mat-form-field appearance="outline" style="width:100%;max-width:360px;margin-bottom:16px">
      <mat-label>Buscar paciente</mat-label>
      <input matInput [(ngModel)]="searchTerm" placeholder="Nombre o correo">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <div *ngIf="loading" class="text-center mt-24">
      <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
    </div>

    <div *ngIf="!loading">
      <!-- Tabla: pantallas anchas -->
      <div class="table-view">
        <table mat-table [dataSource]="filtered" style="width:100%;background:white;border-radius:12px">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let p">{{ p.fullName }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Correo</th>
            <td mat-cell *matCellDef="let p">{{ p.email }}</td>
          </ng-container>
          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let p">
              <span [class]="p.active ? 'badge-normal' : 'badge-high'">{{ p.active ? 'Activo' : 'Inactivo' }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="lastLogin">
            <th mat-header-cell *matHeaderCellDef>Último acceso</th>
            <td mat-cell *matCellDef="let p">{{ p.lastLoginAt ? (p.lastLoginAt | date:'dd/MM/yyyy hh:mm a') : '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let p">
              <a mat-icon-button [routerLink]="['/admin/patients', p.id]" matTooltip="Ver detalle">
                <mat-icon>visibility</mat-icon>
              </a>
              <a mat-icon-button [routerLink]="['/admin/patients', p.id, 'edit']">
                <mat-icon>edit</mat-icon>
              </a>
              <button mat-icon-button color="warn" (click)="delete(p)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      <!-- Tarjetas: pantallas pequeñas (sin desbordamiento horizontal) -->
      <div class="cards-view">
        <div *ngFor="let p of filtered" class="patient-card">
          <div class="pc-head">
            <div class="pc-name">{{ p.fullName }}</div>
            <span [class]="p.active ? 'badge-normal' : 'badge-high'">{{ p.active ? 'Activo' : 'Inactivo' }}</span>
          </div>
          <div class="pc-row"><mat-icon class="pc-ico">mail</mat-icon><span>{{ p.email }}</span></div>
          <div class="pc-row">
            <mat-icon class="pc-ico">schedule</mat-icon>
            <span>{{ p.lastLoginAt ? (p.lastLoginAt | date:'dd/MM/yyyy hh:mm a') : 'Sin acceso' }}</span>
          </div>
          <div class="pc-actions">
            <a mat-stroked-button [routerLink]="['/admin/patients', p.id]"><mat-icon>visibility</mat-icon> Ver</a>
            <a mat-icon-button [routerLink]="['/admin/patients', p.id, 'edit']" aria-label="Editar"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button color="warn" (click)="delete(p)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
          </div>
        </div>
      </div>

      <div *ngIf="filtered.length === 0" class="empty-state">
        <mat-icon>people</mat-icon>
        <p>Sin pacientes registrados</p>
      </div>
    </div>
  `,
  styles: [`
    .pl-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px; }
    .pl-actions { display:flex; gap:8px; flex-wrap:wrap; }

    .table-view { overflow-x:auto; }
    .cards-view { display:none; }

    .patient-card { background:#fff; border-radius:12px; padding:14px 16px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
    .pc-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
    .pc-name { font-weight:600; font-size:15px; word-break:break-word; }
    .pc-row { display:flex; align-items:center; gap:8px; color:rgba(0,0,0,.7); font-size:13px; margin-bottom:4px; }
    .pc-row span { word-break:break-word; min-width:0; }
    .pc-ico { font-size:18px; width:18px; height:18px; color:rgba(0,0,0,.45); flex-shrink:0; }
    .pc-actions { display:flex; align-items:center; gap:8px; margin-top:10px; }

    @media (max-width: 700px) {
      .table-view { display:none; }
      .cards-view { display:block; }
      .pl-actions { width:100%; }
      .pl-actions a, .pl-actions button { flex:1; }
    }
  `]
})
export class PatientListComponent implements OnInit {
  private svc   = inject(AdminService);
  private snack = inject(MatSnackBar);

  patients  : User[] = [];
  loading    = true;
  exporting  = false;
  searchTerm = '';
  columns    = ['name', 'email', 'active', 'lastLogin', 'actions'];

  exportAll() {
    this.exporting = true;
    this.svc.exportAll().subscribe({
      next: b => { this.svc.downloadBlob(b, 'pacientes_todos.xlsx'); this.exporting = false; },
      error: () => { this.snack.open('Error al exportar', '', { duration: 2500 }); this.exporting = false; }
    });
  }

  get filtered() {
    const term = this.searchTerm.toLowerCase();
    return this.patients.filter(p =>
      p.fullName.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)
    );
  }

  ngOnInit() {
    this.svc.listPatients().subscribe({
      next:  p => { this.patients = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  delete(p: User) {
    if (!confirm(`¿Desactivar a ${p.fullName}?`)) return;
    this.svc.deletePatient(p.id).subscribe({
      next: () => { p.active = false; this.snack.open('Paciente desactivado', '', { duration: 2500 }); },
      error: () => this.snack.open('Error', '', { duration: 2500 })
    });
  }
}
