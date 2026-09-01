import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';
import { PaginacionResultado } from '../models/paginacion.model';
import { CreatePrestamoRequest, PrestamoFiltro, PrestamoResponse, RenovarPrestamoRequest } from '../models/prestamo.model';

@Injectable({ providedIn: 'root' })
export class PrestamoService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(filtro?: PrestamoFiltro): Observable<PaginacionResultado<PrestamoResponse>> {
    return this.http.get<PaginacionResultado<PrestamoResponse>>(API_ENDPOINTS.PRESTAMOS.BASE, {
      params: this.construirParams(filtro),
    });
  }

  obtenerMisPrestamos(filtro?: PrestamoFiltro): Observable<PaginacionResultado<PrestamoResponse>> {
    return this.http.get<PaginacionResultado<PrestamoResponse>>(API_ENDPOINTS.PRESTAMOS.MIS_PRESTAMOS, {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorId(id: number): Observable<PrestamoResponse> {
    return this.http.get<PrestamoResponse>(API_ENDPOINTS.PRESTAMOS.POR_ID(id));
  }

  registrar(request: CreatePrestamoRequest): Observable<PrestamoResponse> {
    return this.http.post<PrestamoResponse>(API_ENDPOINTS.PRESTAMOS.BASE, request, { context: this.contextoSilencioso });
  }

  devolver(id: number): Observable<PrestamoResponse> {
    return this.http.patch<PrestamoResponse>(API_ENDPOINTS.PRESTAMOS.DEVOLUCION(id), {});
  }

  renovar(id: number, request: RenovarPrestamoRequest): Observable<PrestamoResponse> {
    return this.http.patch<PrestamoResponse>(API_ENDPOINTS.PRESTAMOS.RENOVACION(id), request, { context: this.contextoSilencioso });
  }

  private construirParams(filtro?: PrestamoFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.libroId) params = params.set('libroId', filtro.libroId);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.buscarUsuario) params = params.set('buscarUsuario', filtro.buscarUsuario);
    if (filtro.buscarLibro) params = params.set('buscarLibro', filtro.buscarLibro);
    if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde);
    if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta);
    if (filtro.pagina) params = params.set('pagina', filtro.pagina);
    if (filtro.tamanioPagina) params = params.set('tamanioPagina', filtro.tamanioPagina);

    return params;
  }
}