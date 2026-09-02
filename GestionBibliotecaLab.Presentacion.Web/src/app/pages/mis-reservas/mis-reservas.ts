import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { ReservaService } from '../../services/reserva.service';
import { NotificationService } from '../../services/notification.service';
import { Paginador } from '../../components/shared/paginador/paginador';
import { PageHeader } from '../../components/shared/page-header/page-header';
import { EmptyState } from '../../components/shared/empty-state/empty-state';
import { ConfirmModal } from '../../components/shared/confirm-modal/confirm-modal';
import { ReservaItem } from '../reservas/reserva-item/reserva-item';

import type { EstadoReserva, ReservaFiltro, ReservaResponse } from '../../models/reserva.model';

const TAMANIO_PAGINA = 10;

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [ReactiveFormsModule, Paginador, PageHeader, EmptyState, ConfirmModal, ReservaItem],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css',
})
export class MisReservas {
  private readonly reservaService = inject(ReservaService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly reservas = signal<ReservaResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly paginaActual = signal(1);

  readonly reservaParaCancelar = signal<ReservaResponse | null>(null);

  private readonly refrescar = signal(0);

  readonly filtrosForm = this.fb.nonNullable.group({ estado: '' });

  private readonly filtrosTexto = toSignal(this.filtrosForm.valueChanges, {
    initialValue: this.filtrosForm.getRawValue(),
  });

  private readonly filtroActual = computed<ReservaFiltro>(() => ({
    estado: (this.filtrosTexto().estado || undefined) as EstadoReserva | undefined,
    pagina: this.paginaActual(),
    tamanioPagina: this.tamanioPagina,
  }));

  private readonly consultaActual = computed(() => {
    this.refrescar();
    return { ...this.filtroActual() };
  });

  constructor() {
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.consultaActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((filtro) => this.reservaService.obtenerMisReservas(filtro).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.reservas.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  solicitarCancelacion(r: ReservaResponse): void { this.reservaParaCancelar.set(r); }
  cancelarSolicitud(): void { this.reservaParaCancelar.set(null); }

  confirmarCancelacion(): void {
    const r = this.reservaParaCancelar();
    if (!r) return;

    this.reservaService.cancelar(r.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`Tu reserva de "${r.nombreLaboratorio}" fue cancelada.`);
        this.reservaParaCancelar.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => this.reservaParaCancelar.set(null),
    });
  }
}