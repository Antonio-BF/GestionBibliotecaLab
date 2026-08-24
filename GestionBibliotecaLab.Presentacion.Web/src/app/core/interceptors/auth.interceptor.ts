import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL, ENDPOINTS_PUBLICOS } from '../constants/api-endpoints.constants';
import { inject } from '@angular/core';
import { TokenStorageService } from '../../services/token-storage.service';

/**
 * Adjunta el header "Authorization: Bearer <token>" a toda request dirigida
 * a la API, salvo los endpoints públicos de Auth (login/registro/refresh)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esRequestApi = req.url.startsWith(API_BASE_URL);
  const esRequestPublica = ENDPOINTS_PUBLICOS.includes(req.url);

  if (!esRequestApi || esRequestPublica) {
    return next(req);
  }

  const tokenStorage = inject(TokenStorageService);
  const accessToken = tokenStorage.obtenerAccessToken();

  if (!accessToken) {
    return next(req);
  }
 
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    })
  );
};