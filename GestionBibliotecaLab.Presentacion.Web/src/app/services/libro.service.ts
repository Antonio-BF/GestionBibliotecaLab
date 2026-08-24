import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import { CreateLibroRequest, LibroResponse, UpdateLibroRequest } from '../models/libro.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LibroService {
  private readonly http = inject(HttpClient);

  obtenerTodos(): Observable<LibroResponse[]> {
    return this.http.get<LibroResponse[]>(API_ENDPOINTS.LIBROS.BASE);
  }

  obtenerPorId(id: number): Observable<LibroResponse> {
    return this.http.get<LibroResponse>(API_ENDPOINTS.LIBROS.POR_ID(id));
  }

  registrar(request: CreateLibroRequest): Observable<LibroResponse> {
    return this.http.post<LibroResponse>(API_ENDPOINTS.LIBROS.BASE, request);
  }

  actualizar(id: number, request: UpdateLibroRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.LIBROS.POR_ID(id), request);
  }

  actualizarPortada(id: number, archivo: File): Observable<LibroResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<LibroResponse>(API_ENDPOINTS.LIBROS.PORTADA(id), formData);
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(API_ENDPOINTS.LIBROS.ESTADO(id), {});
  }
}
