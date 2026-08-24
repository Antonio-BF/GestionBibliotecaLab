import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../constants/app-routes.constants';

/**
 * Protege rutas que además de sesión iniciada requieren un rol específico.
 * Los roles permitidos se declaran en route.data['roles'] al registrar la ruta:
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = (route.data?.['roles'] as string[] | undefined) ?? [];

  if (rolesPermitidos.length === 0 || authService.tieneAlgunRol(...rolesPermitidos)) {
    return true;
  }

  return router.createUrlTree([APP_ROUTES.UNAUTHORIZED]);
};

