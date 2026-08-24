import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../constants/app-routes.constants';

/**
 * Protege rutas que requieren sesión iniciada. Si no hay sesión, redirige a
 * /login conservando la URL solicitada en `returnUrl` para volver ahí tras
 * autenticarse.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }
  
  return router.createUrlTree([APP_ROUTES.LOGIN], { queryParams: { returnUrl: state.url } });
};
