import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Auth (sin guard)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Paciente
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/patient-layout.component').then(m => m.PatientLayoutComponent),
    children: [
      { path: 'home',          loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'profile',       loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'glucose',       loadComponent: () => import('./features/glucose/glucose-list.component').then(m => m.GlucoseListComponent) },
      { path: 'glucose/new',   loadComponent: () => import('./features/glucose/glucose-form.component').then(m => m.GlucoseFormComponent) },
      { path: 'glucose/:id/edit', loadComponent: () => import('./features/glucose/glucose-form.component').then(m => m.GlucoseFormComponent) },
      { path: 'medications',   loadComponent: () => import('./features/medication/medication.component').then(m => m.MedicationComponent) },
      { path: 'activities',    loadComponent: () => import('./features/activity/activity-list.component').then(m => m.ActivityListComponent) },
      { path: 'activities/new',loadComponent: () => import('./features/activity/activity-form.component').then(m => m.ActivityFormComponent) },
      { path: 'activities/:id/edit', loadComponent: () => import('./features/activity/activity-form.component').then(m => m.ActivityFormComponent) },
      { path: 'nutrition',     loadComponent: () => import('./features/nutrition/nutrition.component').then(m => m.NutritionComponent) },
      { path: 'education',     loadComponent: () => import('./features/education/education-list.component').then(m => m.EducationListComponent) },
      { path: 'education/:id', loadComponent: () => import('./features/education/education-detail.component').then(m => m.EducationDetailComponent) },
      { path: 'questionnaires',      loadComponent: () => import('./features/questionnaires/questionnaire-list.component').then(m => m.QuestionnaireListComponent) },
      { path: 'questionnaires/:key', loadComponent: () => import('./features/questionnaires/questionnaire-form.component').then(m => m.QuestionnaireFormComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
    ]
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./shared/components/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'patients',     loadComponent: () => import('./features/admin/patients/patient-list.component').then(m => m.PatientListComponent) },
      { path: 'patients/new', loadComponent: () => import('./features/admin/patients/patient-form.component').then(m => m.PatientFormComponent) },
      { path: 'patients/:id', loadComponent: () => import('./features/admin/patients/patient-detail.component').then(m => m.PatientDetailComponent) },
      { path: 'patients/:id/edit', loadComponent: () => import('./features/admin/patients/patient-form.component').then(m => m.PatientFormComponent) },
      { path: 'education',    loadComponent: () => import('./features/admin/education/admin-education.component').then(m => m.AdminEducationComponent) },
      { path: 'questionnaires', loadComponent: () => import('./features/admin/questionnaires/admin-questionnaires.component').then(m => m.AdminQuestionnairesComponent) },
    ]
  },

  { path: '**', redirectTo: 'home' }
];
