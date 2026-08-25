import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes.constants';
import { ApiError, ValidationProblemDetails } from '../../models/api-error.model';
import { SILENCIAR_ERROR_GLOBAL } from '../constants/http-context-tokens';

// Estado de refresh compartido entre requests concurrentes.
let refrescandoToken = false;
const nuevoTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Interceptor de errores, responsable de dos cosas separadas:
 *
 * 1) Ante un 401 (token vencido) en una request que NO es de /auth/*, intenta
 *    refrescar el access token UNA vez y reintenta la request original. Si el
 *    refresh también falla (refresh token vencido/revocado/reusado, cierra la sesión local y
 *    redirige a /login.
 *    Las requests concurrentes que reciben 401 mientras ya hay un refresh en
 *    curso esperan ese mismo refresh en vez de disparar uno cada una.
 *
 * 2) Para cualquier otro error, normaliza la respuesta del backend a un
 *    ApiError uniforme y lo reporta vía NotificationService.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esRequestDeAuth = req.url.includes('/auth/');

      if (error.status === 401 && !esRequestDeAuth) {
        return manejarNoAutorizado(req, next, authService, router);
      }

      const apiError = construirApiError(error);
      const yaSeMuestraInline = req.context.get(SILENCIAR_ERROR_GLOBAL);

      if (!yaSeMuestraInline) {
        notificationService.mostrarError(apiError.message);
      }

      return throwError(() => apiError);
    })
  );
};

function manejarNoAutorizado(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!refrescandoToken) {
    refrescandoToken = true;
    nuevoTokenSubject.next(null);

    return authService.refrescarToken().pipe(
      switchMap((auth) => {
        refrescandoToken = false;
        nuevoTokenSubject.next(auth.accessToken);
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken}` } }));
      }),
      catchError((error) => {
        refrescandoToken = false;
        nuevoTokenSubject.next(null);
        authService.logout();
        router.navigateByUrl(APP_ROUTES.LOGIN);
        return throwError(() => error);
      })
    );
  }

  return nuevoTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
  );
}

function construirApiError(error: HttpErrorResponse): ApiError {
  if (error.status === 0) {
    return {
      status: 0,
      message: 'No se pudo conectar con el servidor. Verifica tu conexión o que la API esté activa.',
    };
  }

  const body = error.error as ValidationProblemDetails | undefined;

  if (body?.errors && Object.keys(body.errors).length > 0) {
    const mensajes = Object.values(body.errors).flat();
    return {
      status: error.status,
      message: mensajes[0] ?? 'Los datos enviados no son válidos.',
      fieldErrors: body.errors,
    };
  }

  if (body?.title) {
    return { status: error.status, message: body.title };
  }

  return { status: error.status, message: 'Ocurrió un error inesperado. Inténtalo nuevamente.' };
}
