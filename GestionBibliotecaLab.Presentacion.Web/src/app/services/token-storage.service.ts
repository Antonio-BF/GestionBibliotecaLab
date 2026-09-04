import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../core/constants/storage-keys.constants';
import { AuthResponse } from '../models/auth.model';
import { UsuarioAutenticado } from '../models/usuario.model';
import { decodificarJwt, obtenerIdUsuarioDesdeToken } from '../core/utils/jwt.util';

/**
 * Única responsabilidad: leer/escribir la sesión (tokens + datos de usuario)
 * en localStorage. Ningún otro servicio/componente debe tocar localStorage
 * directamente — todos pasan por aquí.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  guardarSesion(auth: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(this.construirUsuario(auth)));
  }

  obtenerAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  obtenerUsuario(): UsuarioAutenticado | null {
    const crudo = localStorage.getItem(STORAGE_KEYS.USUARIO);
    if (!crudo) return null;
    try {
      return JSON.parse(crudo) as UsuarioAutenticado;
    } catch {
      return null;
    }
  }

  limpiarSesion(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USUARIO);
  }

  private construirUsuario(auth: AuthResponse): UsuarioAutenticado {
    const payload = decodificarJwt(auth.accessToken);
    
    return {
      id: obtenerIdUsuarioDesdeToken(auth.accessToken),
      nombres: auth.nombres,
      apellidos: auth.apellidos,
      email: (payload?.email as string) ?? null,
      rol: auth.rol,
    };
  }
}
