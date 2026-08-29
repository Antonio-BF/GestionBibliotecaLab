import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RolRequest, RolResponse } from '../models/rol.model';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(API_ENDPOINTS.ROLES.BASE);
  }

  obtenerPorId(id: number): Observable<RolResponse> {
    return this.http.get<RolResponse>(API_ENDPOINTS.ROLES.POR_ID(id));
  }

  registrar(request: RolRequest): Observable<RolResponse> {
    return this.http.post<RolResponse>(API_ENDPOINTS.ROLES.BASE, request, { context: this.contextoSilencioso });
  }

  actualizar(id: number, request: RolRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.ROLES.POR_ID(id), request, { context: this.contextoSilencioso });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ROLES.POR_ID(id));
  }
}