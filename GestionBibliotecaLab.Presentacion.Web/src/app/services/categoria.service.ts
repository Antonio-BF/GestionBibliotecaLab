import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CategoriaRequest, CategoriaResponse } from '../models/categoria.model';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http = inject(HttpClient);

  obtenerTodas(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(API_ENDPOINTS.CATEGORIAS.BASE);
  }

  obtenerPorId(id: number): Observable<CategoriaResponse> {
    return this.http.get<CategoriaResponse>(API_ENDPOINTS.CATEGORIAS.POR_ID(id));
  }

  registrar(request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(API_ENDPOINTS.CATEGORIAS.BASE, request);
  }

  actualizar(id: number, request: CategoriaRequest): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.CATEGORIAS.POR_ID(id), request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.CATEGORIAS.POR_ID(id));
  }

}
