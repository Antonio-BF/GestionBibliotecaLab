import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/constants/api-endpoints.constants';
import {
    DashboardAdministradorResponse,
    DashboardBibliotecarioResponse,
    DashboardUsuarioResponse,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly http = inject(HttpClient);

    obtenerDashboardUsuario(): Observable<DashboardUsuarioResponse> {
        return this.http.get<DashboardUsuarioResponse>(API_ENDPOINTS.DASHBOARD.USUARIO);
    }

    obtenerDashboardBibliotecario(): Observable<DashboardBibliotecarioResponse> {
        return this.http.get<DashboardBibliotecarioResponse>(API_ENDPOINTS.DASHBOARD.BIBLIOTECARIO);
    }

    obtenerDashboardAdministrador(): Observable<DashboardAdministradorResponse> {
        return this.http.get<DashboardAdministradorResponse>(API_ENDPOINTS.DASHBOARD.ADMINISTRADOR);
    }
}