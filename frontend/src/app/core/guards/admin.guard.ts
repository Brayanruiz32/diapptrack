import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const decide = (): boolean => {
    if (auth.isAdmin()) return true;
    router.navigate(['/home']);   // logueado pero no admin -> vista de paciente
    return false;
  };

  // Si el usuario ya está cargado, decide de inmediato.
  if (auth.currentUser()) return decide();

  // Si no (ej. recarga directa en /admin), cárgalo primero y luego decide.
  return auth.loadCurrentUser().pipe(
    map(() => decide()),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
