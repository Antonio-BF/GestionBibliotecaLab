import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { PrestamoService } from '../../services/prestamo.service';
import { Paginador } from '../../components/shared/paginador/paginador';
import { PageHeader } from '../../components/shared/page-header/page-header';
import { EmptyState } from '../../components/shared/empty-state/empty-state';
import { PrestamoItem } from '../prestamos/prestamo-item/prestamo-item';

import type { EstadoPrestamo, PrestamoFiltro, PrestamoResponse } from '../../models/prestamo.model';
import { calcularEstadoEfectivoPrestamo } from '../../core/utils/estados.util';

const TAMANIO_PAGINA = 10;

@Component({
  selector: 'app-mis-prestamos',
  standalone: true,
  imports: [ReactiveFormsModule, Paginador, PageHeader, EmptyState, PrestamoItem],
  templateUrl: './mis-prestamos.html',
  styleUrl: './mis-prestamos.css',
})
export class MisPrestamos {
  private readonly prestamoService = inject(PrestamoService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly prestamos = signal<PrestamoResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly paginaActual = signal(1);

  readonly filtrosForm = this.fb.nonNullable.group({ estado: '' });

  private readonly filtrosTexto = toSignal(this.filtrosForm.valueChanges, { initialValue: this.filtrosForm.getRawValue() });

  private readonly filtroActual = computed<PrestamoFiltro>(() => ({
    estado: (this.filtrosTexto().estado || undefined) as EstadoPrestamo | undefined,
    pagina: this.paginaActual(),
    tamanioPagina: this.tamanioPagina,
  }));

  readonly resumen = computed(() => {
    const items = this.prestamos();
    return {
      vigentes: items.filter((p) => calcularEstadoEfectivoPrestamo(p) === 'vigente').length,
      vencidos: items.filter((p) => calcularEstadoEfectivoPrestamo(p) === 'vencido').length,
    };
  });

  constructor() {
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.filtroActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((filtro) => this.prestamoService.obtenerMisPrestamos(filtro).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.prestamos.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }
}