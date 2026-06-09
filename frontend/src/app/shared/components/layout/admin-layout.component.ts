import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive,
            MatToolbarModule, MatIconModule, MatButtonModule,
            MatSidenavModule, MatListModule],
  template: `
    <mat-sidenav-container style="height:100vh">
      <mat-sidenav #sidenav mode="over" style="width:260px">
        <div style="padding:16px 16px 8px; font-weight:600; color:#1565c0; font-size:18px">
          DiappTrack Admin
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active-link" (click)="sidenav.close()">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/admin/patients" routerLinkActive="active-link" (click)="sidenav.close()">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Pacientes</span>
          </a>
          <a mat-list-item routerLink="/admin/education" routerLinkActive="active-link" (click)="sidenav.close()">
            <mat-icon matListItemIcon>menu_book</mat-icon>
            <span matListItemTitle>Contenido Educativo</span>
          </a>
          <a mat-list-item routerLink="/admin/questionnaires" routerLinkActive="active-link" (click)="sidenav.close()">
            <mat-icon matListItemIcon>quiz</mat-icon>
            <span matListItemTitle>Cuestionarios</span>
          </a>
          <mat-divider />
          <a mat-list-item (click)="logout(); sidenav.close()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Cerrar sesión</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="page-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>DiappTrack</span>
          <span style="flex:1"></span>
          <span style="font-size:13px; opacity:.8">{{ auth.currentUser()?.fullName }}</span>
        </mat-toolbar>
        <div style="padding:16px; max-width:1200px; margin:0 auto">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`.active-link { background: rgba(21,101,192,.1); color: #1565c0; }`]
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  logout() { this.auth.logout().subscribe(); }
}
