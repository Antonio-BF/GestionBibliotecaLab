import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { PrestamoService } from '../../../services/prestamo.service';
import { NotificationService } from '../../../services/notification.service';

import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { Icon } from '../../../components/shared/icon/icon';
import { PageHeader } from '../../../components/shared/page-header/page-header';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';
import { PrestamoItem } from '../prestamo-item/prestamo-item';
import { PrestamoFormulario } from '../prestamo-formulario/prestamo-formulario';
import { PrestamoRenovacion } from '../prestamo-renovacion/prestamo-renovacion';

import type { EstadoPrestamo, PrestamoFiltro, PrestamoResponse } from '../../../models/prestamo.model';
import { calcularEstadoEfectivoPrestamo } from '../../../core/utils/estados.util';

const TAMANIO_PAGINA = 8;

@Component({
  selector: 'app-prestamo-listado',
  standalone: true,
  imports: [
    ReactiveFormsModule, Paginador, ConfirmModal, ModalShell, Icon, PageHeader, EmptyState,
    PrestamoItem, PrestamoFormulario, PrestamoRenovacion,
  ],
  templateUrl: './prestamo-listado.html',
  styleUrl: './prestamo-listado.css',
})
export class PrestamoListado {
  private readonly prestamoService = inject(PrestamoService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly prestamos = signal<PrestamoResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly paginaActual = signal(1);

  readonly modalFormularioAbierto = signal(false);
  readonly prestamoParaRenovar = signal<PrestamoResponse | null>(null);
  readonly prestamoParaDevolver = signal<PrestamoResponse | null>(null);

  private readonly refrescar = signal(0);

  readonly filtrosForm = this.fb.nonNullable.group({
    buscarUsuario: '',
    buscarLibro: '',
    estado: '',
  });

  private readonly filtrosTexto = toSignal(this.filtrosForm.valueChanges.pipe(debounceTime(350)), {
    initialValue: this.filtrosForm.getRawValue(),
  });

  private readonly filtroActual = computed<PrestamoFiltro>(() => {
    const texto = this.filtrosTexto();
    return {
      buscarUsuario: texto.buscarUsuario || undefined,
      buscarLibro: texto.buscarLibro || undefined,
      estado: (texto.estado || undefined) as EstadoPrestamo | undefined,
      pagina: this.paginaActual(),
      tamanioPagina: this.tamanioPagina,
    };
  });

  private readonly consultaActual = computed(() => {
    this.refrescar();
    return { ...this.filtroActual() };
  });

  readonly mensajeDevolucion = computed(() => {
    const p = this.prestamoParaDevolver();
    if (!p) return '';
    const base = `¿Confirmas registrar la devolución de "${p.tituloLibro}"?`;
    return calcularEstadoEfectivoPrestamo(p) === 'vencido'
      ? `${base} La devolución es tardía: se generará automáticamente una penalización por mora al usuario.`
      : base;
  });

  constructor() {
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.consultaActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((filtro) => this.prestamoService.obtenerTodos(filtro).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.prestamos.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ buscarUsuario: '', buscarLibro: '', estado: '' });
    this.paginaActual.set(1);
  }

  abrirNuevo(): void { this.modalFormularioAbierto.set(true); }
  cerrarFormulario(): void { this.modalFormularioAbierto.set(false); }

  onGuardado(): void {
    this.modalFormularioAbierto.set(false);
    this.prestamoParaRenovar.set(null);
    this.refrescar.update((n) => n + 1);
  }

  solicitarRenovacion(p: PrestamoResponse): void { this.prestamoParaRenovar.set(p); }
  cerrarRenovacion(): void { this.prestamoParaRenovar.set(null); }

  solicitarDevolucion(p: PrestamoResponse): void { this.prestamoParaDevolver.set(p); }
  cancelarDevolucion(): void { this.prestamoParaDevolver.set(null); }

  confirmarDevolucion(): void {
    const p = this.prestamoParaDevolver();
    if (!p) return;

    this.prestamoService.devolver(p.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`Devolución de "${p.tituloLibro}" registrada correctamente.`);
        this.prestamoParaDevolver.set(null);
        this.refrescar.update((n) => n + 1);
      },
      error: () => {
        this.prestamoParaDevolver.set(null);
        this.refrescar.update((n) => n + 1);
      },
    });
  }
}