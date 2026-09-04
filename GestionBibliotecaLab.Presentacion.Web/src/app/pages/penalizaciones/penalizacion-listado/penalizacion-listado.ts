import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { PenalizacionService } from '../../../services/penalizacion.service';
import { NotificationService } from '../../../services/notification.service';

import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { Icon } from '../../../components/shared/icon/icon';
import { PageHeader } from '../../../components/shared/page-header/page-header';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';
import { PenalizacionItem } from '../penalizacion-item/penalizacion-item';
import { PenalizacionFormulario } from '../penalizacion-formulario/penalizacion-formulario';

import type {
  EstadoPenalizacion, OrigenPenalizacion, PenalizacionFiltro, PenalizacionResponse, TipoPenalizacion,
} from '../../../models/penalizacion.model';
import { ETIQUETAS_TIPO_PENALIZACION, TODOS_LOS_TIPOS_PENALIZACION } from '../../../models/penalizacion.model';

const TAMANIO_PAGINA = 8;

@Component({
  selector: 'app-penalizacion-listado',
  standalone: true,
  imports: [
    ReactiveFormsModule, Paginador, ConfirmModal, ModalShell, Icon, PageHeader, EmptyState,
    PenalizacionItem, PenalizacionFormulario
  ],
  templateUrl: './penalizacion-listado.html',
  styleUrl: './penalizacion-listado.css',
})
export class PenalizacionListado {
  private readonly penalizacionService = inject(PenalizacionService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;
  readonly etiquetasTipo = ETIQUETAS_TIPO_PENALIZACION;
  readonly todosLosTipos = TODOS_LOS_TIPOS_PENALIZACION;

  readonly cargando = signal(true);
  readonly penalizaciones = signal<PenalizacionResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly paginaActual = signal(1);
  readonly filtrosAvanzados = signal(false);

  readonly modalFormularioAbierto = signal(false);
  readonly penalizacionParaResolver = signal<PenalizacionResponse | null>(null);
  readonly penalizacionParaAnular = signal<PenalizacionResponse | null>(null);

  private readonly refrescar = signal(0);

  readonly filtrosForm = this.fb.nonNullable.group({
    buscarUsuario: '',
    origen: '',
    tipo: '',
    estado: '',
  });

  private readonly filtrosTexto = toSignal(this.filtrosForm.valueChanges.pipe(debounceTime(350)), {
    initialValue: this.filtrosForm.getRawValue(),
  });

  private readonly filtroActual = computed<PenalizacionFiltro>(() => {
    const texto = this.filtrosTexto();
    return {
      buscarUsuario: texto.buscarUsuario || undefined,
      origen: (texto.origen || undefined) as OrigenPenalizacion | undefined,
      tipo: (texto.tipo || undefined) as TipoPenalizacion | undefined,
      estado: (texto.estado || undefined) as EstadoPenalizacion | undefined,
      pagina: this.paginaActual(),
      tamanioPagina: this.tamanioPagina,
    };
  });

  private readonly consultaActual = computed(() => {
    this.refrescar();
    return { ...this.filtroActual() };
  });

  constructor() {
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.consultaActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((filtro) => this.penalizacionService.obtenerTodos(filtro).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.penalizaciones.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ buscarUsuario: '', origen: '', tipo: '', estado: '' });
    this.paginaActual.set(1);
  }
  
  toggleFiltros(): void {
    this.filtrosAvanzados.update(v => !v);
  }

  abrirNuevo(): void { this.modalFormularioAbierto.set(true); }
  cerrarFormulario(): void { this.modalFormularioAbierto.set(false); }

  onGuardado(): void {
    this.modalFormularioAbierto.set(false);
    this.refrescar.update((n) => n + 1);
  }

  solicitarResolucion(p: PenalizacionResponse): void { this.penalizacionParaResolver.set(p); }
  cancelarSolicitudResolucion(): void { this.penalizacionParaResolver.set(null); }

  confirmarResolucion(): void {
    const p = this.penalizacionParaResolver();
    if (!p) return;

    this.penalizacionService.resolver(p.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Penalización marcada como pagada.');
        this.penalizacionParaResolver.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => this.penalizacionParaResolver.set(null),
    });
  }

  solicitarAnulacion(p: PenalizacionResponse): void { this.penalizacionParaAnular.set(p); }
  cancelarSolicitudAnulacion(): void { this.penalizacionParaAnular.set(null); }

  confirmarAnulacion(): void {
    const p = this.penalizacionParaAnular();
    if (!p) return;

    this.penalizacionService.anular(p.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Penalización anulada correctamente.');
        this.penalizacionParaAnular.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => this.penalizacionParaAnular.set(null),
    });
  }
}