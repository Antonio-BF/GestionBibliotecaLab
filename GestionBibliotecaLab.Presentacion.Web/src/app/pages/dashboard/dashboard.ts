import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { ROLES } from '../../core/constants/roles.constants';
import { MENU_ITEMS } from '../../core/constants/menu.constants';

import { Icon } from '../../components/shared/icon/icon';
import { EmptyState } from '../../components/shared/empty-state/empty-state';
import { StatCard } from '../../components/shared/stat-card/stat-card';
import { ProgressBar } from '../../components/shared/progress-bar/progress-bar';
import { RankingList, RankingItem } from '../../components/shared/ranking-list/ranking-list';
import { ActivityChart, SerieActividad } from '../../components/shared/activity-chart/activity-chart';

import type {
  DashboardAdministradorResponse,
  DashboardBibliotecarioResponse,
  DashboardUsuarioResponse,
} from '../../models/dashboard.model';
import { claseEstadoReserva } from '../../core/utils/estados.util';
import type { EstadoReserva } from '../../models/reserva.model';

type VistaDashboard = 'usuario' | 'bibliotecario' | 'administrador';
type DashboardResponse = DashboardUsuarioResponse | DashboardBibliotecarioResponse | DashboardAdministradorResponse;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe, LowerCasePipe, Icon, EmptyState,
    StatCard, ProgressBar, RankingList, ActivityChart,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly usuario = this.authService.usuario;

  readonly vista = computed<VistaDashboard>(() => {
    const rol = this.usuario()?.rol;
    if (rol === ROLES.ADMINISTRADOR) return 'administrador';
    if (rol === ROLES.BIBLIOTECARIO) return 'bibliotecario';
    return 'usuario';
  });

  readonly cargando = signal(true);
  readonly dashboardUsuario = signal<DashboardUsuarioResponse | null>(null);
  readonly dashboardBibliotecario = signal<DashboardBibliotecarioResponse | null>(null);
  readonly dashboardAdministrador = signal<DashboardAdministradorResponse | null>(null);

  readonly modulosRapidos = computed(() => {
    const rol = this.usuario()?.rol;
    if (!rol) return [];
    return MENU_ITEMS.filter((item) => item.ruta !== '/dashboard' && item.roles.includes(rol));
  });

  readonly seriesActividad = computed<SerieActividad[]>(() => {
    const admin = this.dashboardAdministrador();
    if (!admin) return [];
    return [
      { nombre: 'Préstamos', color: 'var(--color-primary)', datos: admin.actividadPrestamos },
      { nombre: 'Reservas', color: 'var(--color-accent)', datos: admin.actividadReservas },
    ];
  });

  readonly rankingLibros = computed<RankingItem[]>(() => {
    const items = this.dashboardBibliotecario()?.librosMasPrestados
      ?? this.dashboardAdministrador()?.librosMasPrestados
      ?? [];
    return items.map((l) => ({ nombre: l.titulo, valor: l.cantidadPrestamos }));
  });

  readonly rankingLaboratorios = computed<RankingItem[]>(() => {
    const items = this.dashboardBibliotecario()?.laboratoriosMasReservados
      ?? this.dashboardAdministrador()?.laboratoriosMasReservados
      ?? [];
    return items.map((l) => ({ nombre: l.nombre, valor: l.cantidadReservas }));
  });

  readonly rankingUsuariosPorRol = computed<RankingItem[]>(() => {
    const items = this.dashboardAdministrador()?.usuariosPorRol ?? [];
    return items.map((u) => ({ nombre: u.rol, valor: u.cantidad }));
  });

  constructor() {
    this.cargarDashboard();
  }

  claseEstadoReservaDashboard(estado: string): string {
    return claseEstadoReserva(estado as EstadoReserva);
  }

  claseEstadoPrestamoDashboard(estado: string): string {
    switch (estado) {
      case 'EnMora': return 'status-pill--mora';
      case 'Devuelto': return 'status-pill--info';
      default: return 'status-pill--activo';
    }
  }

  private cargarDashboard(): void {
    this.cargando.set(true);
    const vista = this.vista();

    const fuente$: Observable<DashboardResponse> =
      vista === 'administrador' ? this.dashboardService.obtenerDashboardAdministrador()
      : vista === 'bibliotecario' ? this.dashboardService.obtenerDashboardBibliotecario()
      : this.dashboardService.obtenerDashboardUsuario();

    fuente$.pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: (data) => {
        if (vista === 'administrador') this.dashboardAdministrador.set(data as DashboardAdministradorResponse);
        else if (vista === 'bibliotecario') this.dashboardBibliotecario.set(data as DashboardBibliotecarioResponse);
        else this.dashboardUsuario.set(data as DashboardUsuarioResponse);
      },
    });
  }
}