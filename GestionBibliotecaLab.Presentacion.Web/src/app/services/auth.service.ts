import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { UsuarioAutenticado } from '../models/usuario.model';
import { AuthResponse, LoginRequest, RegistroRequest } from '../models/auth.model';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { APP_ROUTES } from '../core/constants/app-routes.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';

/**
 * Único punto de la app que sabe hablar con /api/auth/*. Mantiene el estado
 * de sesión en un signal respaldado por TokenStorageService.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  private readonly usuarioSignal = signal<UsuarioAutenticado | null>(this.tokenStorage.obtenerUsuario());
  readonly usuario = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => !!this.usuarioSignal() && !!this.tokenStorage.obtenerAccessToken());

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, request, { context: this.contextoSilencioso })
      .pipe(tap((auth) => this.persistirSesion(auth)));
  }

  registrar(request: RegistroRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTRO, request, { context: this.contextoSilencioso })
      .pipe(tap((auth) => this.persistirSesion(auth)));
  }

  refrescarToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.obtenerRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay sesión activa para refrescar.'));
    }
    return this.http
      .post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }, { context: this.contextoSilencioso })
      .pipe(tap((auth) => this.persistirSesion(auth)));
  }

  logout(): void {
    const refreshToken = this.tokenStorage.obtenerRefreshToken();
    const finalizarSesionLocal = () => {
      this.tokenStorage.limpiarSesion();
      this.usuarioSignal.set(null);
      this.router.navigateByUrl(APP_ROUTES.LOGIN);
    };

    if (!refreshToken) {
      finalizarSesionLocal();
      return;
    }

    this.http
      .post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }, { context: this.contextoSilencioso })
      .subscribe({ next: finalizarSesionLocal, error: finalizarSesionLocal });
  }

  tieneAlgunRol(...rolesPermitidos: string[]): boolean {
    const rolActual = this.usuarioSignal()?.rol;
    return !!rolActual && rolesPermitidos.includes(rolActual);
  }

  private persistirSesion(auth: AuthResponse): void {
    this.tokenStorage.guardarSesion(auth);
    this.usuarioSignal.set(this.tokenStorage.obtenerUsuario());
  }
}
