import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../constants/app-routes.constants';

/**
 * Evita que un usuario ya autenticado navegue manualmente a /login o
 * /registro. Si ya hay sesión, redirige directo al dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.estaAutenticado() ? router.createUrlTree([APP_ROUTES.DASHBOARD]) : true;
};
