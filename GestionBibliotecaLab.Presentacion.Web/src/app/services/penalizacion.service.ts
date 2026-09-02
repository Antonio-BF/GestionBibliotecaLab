import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';
import { PaginacionResultado } from '../models/paginacion.model';
import { CreatePenalizacionRequest, PenalizacionFiltro, PenalizacionResponse } from '../models/penalizacion.model';

@Injectable({ providedIn: 'root' })
export class PenalizacionService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(filtro?: PenalizacionFiltro): Observable<PaginacionResultado<PenalizacionResponse>> {
    return this.http.get<PaginacionResultado<PenalizacionResponse>>(API_ENDPOINTS.PENALIZACIONES.BASE, {
      params: this.construirParams(filtro),
    });
  }

  obtenerMisPenalizaciones(filtro?: PenalizacionFiltro): Observable<PaginacionResultado<PenalizacionResponse>> {
    return this.http.get<PaginacionResultado<PenalizacionResponse>>(API_ENDPOINTS.PENALIZACIONES.MIS_PENALIZACIONES, {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorId(id: number): Observable<PenalizacionResponse> {
    return this.http.get<PenalizacionResponse>(API_ENDPOINTS.PENALIZACIONES.POR_ID(id));
  }

  obtenerPorPrestamo(prestamoId: number, filtro?: PenalizacionFiltro): Observable<PaginacionResultado<PenalizacionResponse>> {
    return this.http.get<PaginacionResultado<PenalizacionResponse>>(API_ENDPOINTS.PENALIZACIONES.POR_PRESTAMO(prestamoId), {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorReserva(reservaLabId: number, filtro?: PenalizacionFiltro): Observable<PaginacionResultado<PenalizacionResponse>> {
    return this.http.get<PaginacionResultado<PenalizacionResponse>>(API_ENDPOINTS.PENALIZACIONES.POR_RESERVA(reservaLabId), {
      params: this.construirParams(filtro),
    });
  }

  registrar(request: CreatePenalizacionRequest): Observable<PenalizacionResponse> {
    return this.http.post<PenalizacionResponse>(API_ENDPOINTS.PENALIZACIONES.BASE, request, { context: this.contextoSilencioso });
  }

  resolver(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.PENALIZACIONES.PAGO(id), {});
  }

  anular(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.PENALIZACIONES.ANULACION(id), {});
  }

  private construirParams(filtro?: PenalizacionFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.buscarUsuario) params = params.set('buscarUsuario', filtro.buscarUsuario);
    if (filtro.prestamoId) params = params.set('prestamoId', filtro.prestamoId);
    if (filtro.reservaLabId) params = params.set('reservaLabId', filtro.reservaLabId);
    if (filtro.origen) params = params.set('origen', filtro.origen);
    if (filtro.tipo) params = params.set('tipo', filtro.tipo);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.pagina) params = params.set('pagina', filtro.pagina);
    if (filtro.tamanioPagina) params = params.set('tamanioPagina', filtro.tamanioPagina);

    return params;
  }
}