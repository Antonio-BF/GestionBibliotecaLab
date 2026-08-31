import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { LaboratorioService } from '../../../services/laboratorio.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { SOLO_ADMINISTRADOR } from '../../../core/constants/roles.constants';

import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { Icon } from '../../../components/shared/icon/icon';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';
import { PageHeader } from '../../../components/shared/page-header/page-header';

import type { EstadoLaboratorio, LaboratorioFiltro, LaboratorioResponse } from '../../../models/laboratorio.model';
import { claseEstadoLaboratorio } from '../../../core/utils/estados.util';
import { LaboratorioFormulario } from '../laboratorio-formulario/laboratorio-formulario';
import { LaboratorioDetalle } from '../laboratorio-detalle/laboratorio-detalle';

const TAMANIO_PAGINA = 9;
type VistaLaboratorios = 'activos' | 'eliminados';

interface AccionLaboratorio {
  laboratorio: LaboratorioResponse;
  tipo: 'baja' | 'reactivar';
}

@Component({
  selector: 'app-laboratorio-listado',
  standalone: true,
  imports: [
    ReactiveFormsModule, CoverImagen, Paginador, ConfirmModal, ModalShell, Icon,
    EmptyState, PageHeader, LaboratorioFormulario, LaboratorioDetalle
  ],
  templateUrl: './laboratorio-listado.html',
  styleUrl: './laboratorio-listado.css',
})
export class LaboratorioListado {
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;
  readonly claseEstado = claseEstadoLaboratorio;

  readonly cargando = signal(true);
  readonly laboratorios = signal<LaboratorioResponse[]>([]);
  readonly totalRegistros = signal(0);

  readonly paginaActual = signal(1);
  readonly vista = signal<VistaLaboratorios>('activos');
  readonly accionLaboratorio = signal<AccionLaboratorio | null>(null);

  readonly modalFormularioAbierto = signal(false);
  readonly laboratorioEditando = signal<LaboratorioResponse | null>(null);
  readonly laboratorioDetalle = signal<LaboratorioResponse | null>(null);

  private readonly refrescar = signal(0);

  readonly puedeGestionar = computed(() => this.authService.tieneAlgunRol(...SOLO_ADMINISTRADOR));

  readonly filtrosForm = this.fb.nonNullable.group({
    nombre: '',
    ubicacion: '',
    estado: '',
  });

  private readonly filtrosTexto = toSignal(
    this.filtrosForm.valueChanges.pipe(debounceTime(350)),
    { initialValue: this.filtrosForm.getRawValue() }
  );

  private readonly filtroActual = computed<LaboratorioFiltro>(() => {
    const texto = this.filtrosTexto();
    return {
      nombre: texto.nombre || undefined,
      ubicacion: texto.ubicacion || undefined,
      estado: (texto.estado || undefined) as EstadoLaboratorio | undefined,
      pagina: this.paginaActual(),
      tamanioPagina: this.tamanioPagina,
    };
  });

  private readonly consultaActual = computed(() => {
    this.refrescar();
    return { filtro: this.filtroActual(), vista: this.vista() };
  });

  constructor() {
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.consultaActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap(({ filtro, vista }) => {
          const fuente = vista === 'eliminados'
            ? this.laboratorioService.obtenerEliminados(filtro)
            : this.laboratorioService.obtenerTodos(filtro);
          return fuente.pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.laboratorios.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  cambiarVista(vista: VistaLaboratorios): void {
    if (this.vista() === vista) return;
    this.vista.set(vista);
    this.paginaActual.set(1);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ nombre: '', ubicacion: '', estado: '' });
    this.paginaActual.set(1);
  }

  abrirDetalle(laboratorio: LaboratorioResponse): void {
    this.laboratorioDetalle.set(laboratorio);
  }

  cerrarDetalle(): void {
    this.laboratorioDetalle.set(null);
  }

  editarDesdeDetalle(laboratorio: LaboratorioResponse): void {
    this.laboratorioDetalle.set(null);
    this.abrirEditar(laboratorio);
  }

  abrirNuevo(): void {
    this.laboratorioEditando.set(null);
    this.modalFormularioAbierto.set(true);
  }

  abrirEditar(laboratorio: LaboratorioResponse): void {
    this.laboratorioEditando.set(laboratorio);
    this.modalFormularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.modalFormularioAbierto.set(false);
  }

  onGuardado(): void {
    this.refrescar.update((n) => n + 1);
  }

  solicitarBaja(laboratorio: LaboratorioResponse): void {
    this.accionLaboratorio.set({ laboratorio, tipo: 'baja' });
  }

  solicitarReactivacion(laboratorio: LaboratorioResponse): void {
    this.accionLaboratorio.set({ laboratorio, tipo: 'reactivar' });
  }

  confirmarAccion(): void {
    const accion = this.accionLaboratorio();
    if (!accion) return;

    this.laboratorioService.cambiarEstado(accion.laboratorio.id).subscribe({
      next: () => {
        const mensaje = accion.tipo === 'baja'
          ? `"${accion.laboratorio.nombre}" fue dado de baja correctamente.`
          : `"${accion.laboratorio.nombre}" fue reactivado correctamente.`;
        this.notificationService.mostrarExito(mensaje);
        this.accionLaboratorio.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => this.accionLaboratorio.set(null),
    });
  }

  cancelarAccion(): void {
    this.accionLaboratorio.set(null);
  }
}