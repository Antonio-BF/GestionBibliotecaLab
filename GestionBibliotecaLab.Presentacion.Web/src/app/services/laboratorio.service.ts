import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';
import { PaginacionResultado } from '../models/paginacion.model';
import { CreateLaboratorioRequest, LaboratorioFiltro, LaboratorioResponse, UpdateLaboratorioRequest } from '../models/laboratorio.model';

@Injectable({ providedIn: 'root' })
export class LaboratorioService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(filtro?: LaboratorioFiltro): Observable<PaginacionResultado<LaboratorioResponse>> {
    return this.http.get<PaginacionResultado<LaboratorioResponse>>(API_ENDPOINTS.LABORATORIOS.BASE, {
      params: this.construirParams(filtro),
    });
  }

  obtenerEliminados(filtro?: LaboratorioFiltro): Observable<PaginacionResultado<LaboratorioResponse>> {
    return this.http.get<PaginacionResultado<LaboratorioResponse>>(API_ENDPOINTS.LABORATORIOS.ELIMINADOS, {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorId(id: number): Observable<LaboratorioResponse> {
    return this.http.get<LaboratorioResponse>(API_ENDPOINTS.LABORATORIOS.POR_ID(id));
  }

  registrar(request: CreateLaboratorioRequest): Observable<LaboratorioResponse> {
    return this.http.post<LaboratorioResponse>(API_ENDPOINTS.LABORATORIOS.BASE, request, { context: this.contextoSilencioso });
  }

  actualizar(id: number, request: UpdateLaboratorioRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.LABORATORIOS.POR_ID(id), request, { context: this.contextoSilencioso });
  }

  actualizarImagen(id: number, archivo: File): Observable<LaboratorioResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<LaboratorioResponse>(API_ENDPOINTS.LABORATORIOS.IMAGEN(id), formData, { context: this.contextoSilencioso });
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.LABORATORIOS.ESTADO(id), {});
  }

  private construirParams(filtro?: LaboratorioFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;
    if (filtro.nombre) params = params.set('nombre', filtro.nombre);
    if (filtro.ubicacion) params = params.set('ubicacion', filtro.ubicacion);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.pagina) params = params.set('pagina', filtro.pagina);
    if (filtro.tamanioPagina) params = params.set('tamanioPagina', filtro.tamanioPagina);
    return params;
  }
}