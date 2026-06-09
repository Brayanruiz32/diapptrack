import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="has-bottom-nav">
      <router-outlet />
    </div>

    <nav class="bottom-nav">
      <a routerLink="/home" routerLinkActive="active">
        <mat-icon>home</mat-icon>
        <span>Inicio</span>
      </a>
      <a routerLink="/glucose" routerLinkActive="active">
        <mat-icon>water_drop</mat-icon>
        <span>Glucosa</span>
      </a>
      <a routerLink="/medications" routerLinkActive="active">
        <mat-icon>medication</mat-icon>
        <span>Medicación</span>
      </a>
      <a routerLink="/activities" routerLinkActive="active">
        <mat-icon>directions_run</mat-icon>
        <span>Actividad</span>
      </a>
      <a routerLink="/education" routerLinkActive="active">
        <mat-icon>menu_book</mat-icon>
        <span>Educación</span>
      </a>
    </nav>
  `
})
export class PatientLayoutComponent {
  auth = inject(AuthService);
}
