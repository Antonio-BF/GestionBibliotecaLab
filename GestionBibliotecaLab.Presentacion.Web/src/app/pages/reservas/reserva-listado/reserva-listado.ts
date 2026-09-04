import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { ReservaService } from '../../../services/reserva.service';
import { NotificationService } from '../../../services/notification.service';

import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { Icon } from '../../../components/shared/icon/icon';
import { PageHeader } from '../../../components/shared/page-header/page-header';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';
import { ReservaItem } from '../reserva-item/reserva-item';
import { ReservaFormulario } from '../reserva-formulario/reserva-formulario';

import type { EstadoReserva, ReservaFiltro, ReservaResponse } from '../../../models/reserva.model';

const TAMANIO_PAGINA = 8;

@Component({
  selector: 'app-reserva-listado',
  standalone: true,
  imports: [
    ReactiveFormsModule, Paginador, ConfirmModal, ModalShell, Icon, PageHeader, EmptyState,
    ReservaItem, ReservaFormulario,
  ],
  templateUrl: './reserva-listado.html',
  styleUrl: './reserva-listado.css',
})
export class ReservaListado {
  private readonly reservaService = inject(ReservaService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly reservas = signal<ReservaResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly paginaActual = signal(1);
  readonly filtrosAvanzados = signal(false);

  readonly modalFormularioAbierto = signal(false);
  readonly reservaParaConfirmar = signal<ReservaResponse | null>(null);
  readonly reservaParaCancelar = signal<ReservaResponse | null>(null);

  private readonly refrescar = signal(0);

  readonly filtrosForm = this.fb.nonNullable.group({
    buscarUsuario: '',
    buscarLaboratorio: '',
    estado: '',
    fecha: '',
  });

  private readonly filtrosTexto = toSignal(this.filtrosForm.valueChanges.pipe(debounceTime(350)), {
    initialValue: this.filtrosForm.getRawValue(),
  });

  private readonly filtroActual = computed<ReservaFiltro>(() => {
    const texto = this.filtrosTexto();
    return {
      buscarUsuario: texto.buscarUsuario || undefined,
      buscarLaboratorio: texto.buscarLaboratorio || undefined,
      estado: (texto.estado || undefined) as EstadoReserva | undefined,
      fecha: texto.fecha || undefined,
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
        switchMap((filtro) => this.reservaService.obtenerTodos(filtro).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.reservas.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ buscarUsuario: '', buscarLaboratorio: '', estado: '', fecha: '' });
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

  solicitarConfirmacion(r: ReservaResponse): void { this.reservaParaConfirmar.set(r); }
  cancelarSolicitudConfirmacion(): void { this.reservaParaConfirmar.set(null); }

  confirmarReserva(): void {
    const r = this.reservaParaConfirmar();
    if (!r) return;

    this.reservaService.confirmar(r.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`Reserva de "${r.nombreLaboratorio}" confirmada correctamente.`);
        this.reservaParaConfirmar.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => this.reservaParaConfirmar.set(null),
    });
  }

  solicitarCancelacion(r: ReservaResponse): void { this.reservaParaCancelar.set(r); }
  cancelarSolicitudCancelacion(): void { this.reservaParaCancelar.set(null); }

  confirmarCancelacion(): void {
    const r = this.reservaParaCancelar();
    if (!r) return;

    this.reservaService.cancelar(r.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`Reserva de "${r.nombreLaboratorio}" cancelada correctamente.`);
        this.reservaParaCancelar.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => this.reservaParaCancelar.set(null),
    });
  }
}