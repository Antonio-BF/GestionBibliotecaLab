import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';
import { PaginacionResultado } from '../models/paginacion.model';
import { CreateUsuarioRequest, UpdateUsuarioRequest, UsuarioFiltro, UsuarioResponse, } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(filtro?: UsuarioFiltro): Observable<PaginacionResultado<UsuarioResponse>> {
    return this.http.get<PaginacionResultado<UsuarioResponse>>(API_ENDPOINTS.USUARIOS.BASE, {
      params: this.construirParams(filtro),
    });
  }

  obtenerEliminados(filtro?: UsuarioFiltro): Observable<PaginacionResultado<UsuarioResponse>> {
    return this.http.get<PaginacionResultado<UsuarioResponse>>(API_ENDPOINTS.USUARIOS.ELIMINADOS, {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(API_ENDPOINTS.USUARIOS.POR_ID(id));
  }

  registrar(request: CreateUsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(API_ENDPOINTS.USUARIOS.BASE, request, { context: this.contextoSilencioso });
  }

  actualizar(id: number, request: UpdateUsuarioRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.USUARIOS.POR_ID(id), request, { context: this.contextoSilencioso });
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.USUARIOS.ESTADO(id), {});
  }

  private construirParams(filtro?: UsuarioFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.busqueda) params = params.set('busqueda', filtro.busqueda);
    if (filtro.rolId) params = params.set('rolId', filtro.rolId);
    if (filtro.pagina) params = params.set('pagina', filtro.pagina);
    if (filtro.tamanioPagina) params = params.set('tamanioPagina', filtro.tamanioPagina);

    return params;
  }
}