import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { CreateLibroRequest, LibroFiltro, LibroResponse, UpdateLibroRequest } from '../models/libro.model';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { SILENCIAR_ERROR_GLOBAL } from '../core/constants/http-context-tokens';
import { PaginacionResultado } from '../models/paginacion.model.ts';

@Injectable({
  providedIn: 'root',
})
export class LibroService {
  private readonly http = inject(HttpClient);
  private readonly contextoSilencioso = new HttpContext().set(SILENCIAR_ERROR_GLOBAL, true);

  obtenerTodos(filtro?: LibroFiltro): Observable<PaginacionResultado<LibroResponse>> {
    return this.http.get<PaginacionResultado<LibroResponse>>(API_ENDPOINTS.LIBROS.BASE, {
      params: this.construirParams(filtro),
    });
  }

  obtenerEliminados(filtro?: LibroFiltro): Observable<PaginacionResultado<LibroResponse>> {
    return this.http.get<PaginacionResultado<LibroResponse>>(API_ENDPOINTS.LIBROS.ELIMINADOS, {
      params: this.construirParams(filtro),
    });
  }

  obtenerPorId(id: number): Observable<LibroResponse> {
    return this.http.get<LibroResponse>(API_ENDPOINTS.LIBROS.POR_ID(id));
  }

  registrar(request: CreateLibroRequest): Observable<LibroResponse> {
    return this.http.post<LibroResponse>(API_ENDPOINTS.LIBROS.BASE, request, { context: this.contextoSilencioso });
  }

  actualizar(id: number, request: UpdateLibroRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.LIBROS.POR_ID(id), request, { context: this.contextoSilencioso });
  }

  actualizarPortada(id: number, archivo: File): Observable<LibroResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<LibroResponse>(API_ENDPOINTS.LIBROS.PORTADA(id), formData, { context: this.contextoSilencioso });
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.LIBROS.ESTADO(id), {});
  }

  private construirParams(filtro?: LibroFiltro): HttpParams {
    let params = new HttpParams();
    if (!filtro) return params;

    if (filtro.titulo) params = params.set('titulo', filtro.titulo);
    if (filtro.autor) params = params.set('autor', filtro.autor);
    if (filtro.isbn) params = params.set('isbn', filtro.isbn);
    if (filtro.anioPublicacion) params = params.set('anioPublicacion', filtro.anioPublicacion);
    if (filtro.categoriaId) params = params.set('categoriaId', filtro.categoriaId);
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.pagina) params = params.set('pagina', filtro.pagina);
    if (filtro.tamanioPagina) params = params.set('tamanioPagina', filtro.tamanioPagina);

    return params;
  }
}
