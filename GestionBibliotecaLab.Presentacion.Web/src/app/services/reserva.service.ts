import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';
import { PaginacionResultado } from '../models/paginacion.model';
import { CreateReservaRequest, ReservaFiltro, ReservaResponse } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(filtro?: ReservaFiltro): Observable<PaginacionResultado<ReservaResponse>> {
    return this.http.get<PaginacionResultado<ReservaResponse>>(API_ENDPOINTS.RESERVAS.BASE, {
      params: this.construirParams(filtro),
    });
  }

  obtenerMisReservas(filtro?: ReservaFiltro): Observable<PaginacionResultado<ReservaResponse>> {
    return this.http.get<PaginacionResultado<ReservaResponse>>(API_ENDPOINTS.RESERVAS.MIS_RESERVAS, {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorId(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(API_ENDPOINTS.RESERVAS.POR_ID(id));
  }

  verificarDisponibilidad(
    laboratorioId: number, fecha: string, horaInicio: string, horaFin: string,
  ): Observable<boolean> {
    const params = new HttpParams()
      .set('laboratorioId', laboratorioId)
      .set('fecha', fecha)
      .set('horaInicio', horaInicio)
      .set('horaFin', horaFin);
    return this.http.get<boolean>(API_ENDPOINTS.RESERVAS.DISPONIBILIDAD, { params });
  }

  registrar(request: CreateReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(API_ENDPOINTS.RESERVAS.BASE, request, { context: this.contextoSilencioso });
  }

  confirmar(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.RESERVAS.CONFIRMACION(id), {});
  }

  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.RESERVAS.CANCELACION(id), {});
  }

  private construirParams(filtro?: ReservaFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.usuarioId) params = params.set('usuarioId', filtro.usuarioId);
    if (filtro.laboratorioId) params = params.set('laboratorioId', filtro.laboratorioId);
    if (filtro.buscarUsuario) params = params.set('buscarUsuario', filtro.buscarUsuario);
    if (filtro.buscarLaboratorio) params = params.set('buscarLaboratorio', filtro.buscarLaboratorio);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.fecha) params = params.set('fecha', filtro.fecha);
    if (filtro.pagina) params = params.set('pagina', filtro.pagina);
    if (filtro.tamanioPagina) params = params.set('tamanioPagina', filtro.tamanioPagina);

    return params;
  }
}