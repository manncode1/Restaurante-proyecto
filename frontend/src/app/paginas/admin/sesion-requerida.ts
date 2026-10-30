import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Auth } from '../../services/auth';

/** Deja pasar solo con sesión iniciada; si no, manda al login (/admin). */
export const sesionRequerida: CanActivateFn = () => {
  const router = inject(Router);
  const alLogin = router.createUrlTree(['/admin']);

  return inject(Auth)
    .usuarioActual()
    .pipe(
      map((usuario) => (usuario ? true : alLogin)),
      catchError(() => of(alLogin)),
    );
};
