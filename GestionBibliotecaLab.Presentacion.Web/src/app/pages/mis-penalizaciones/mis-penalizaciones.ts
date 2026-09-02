import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { PenalizacionService } from '../../services/penalizacion.service';
import { Paginador } from '../../components/shared/paginador/paginador';
import { PageHeader } from '../../components/shared/page-header/page-header';
import { EmptyState } from '../../components/shared/empty-state/empty-state';
import { PenalizacionItem } from '../penalizaciones/penalizacion-item/penalizacion-item';

import type { EstadoPenalizacion, PenalizacionFiltro, PenalizacionResponse } from '../../models/penalizacion.model';

const TAMANIO_PAGINA = 10;

@Component({
  selector: 'app-mis-penalizaciones',
  standalone: true,
  imports: [ReactiveFormsModule, Paginador, PageHeader, EmptyState, PenalizacionItem],
  templateUrl: './mis-penalizaciones.html',
  styleUrl: './mis-penalizaciones.css',
})
export class MisPenalizaciones {
  private readonly penalizacionService = inject(PenalizacionService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly penalizaciones = signal<PenalizacionResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly paginaActual = signal(1);

  readonly filtrosForm = this.fb.nonNullable.group({ estado: '' });

  private readonly filtrosTexto = toSignal(this.filtrosForm.valueChanges, {
    initialValue: this.filtrosForm.getRawValue(),
  });

  readonly resumenPendientes = computed(() =>
    this.penalizaciones().filter((p) => p.estado === 'Pendiente').length
  );

  private readonly filtroActual = computed<PenalizacionFiltro>(() => ({
    estado: (this.filtrosTexto().estado || undefined) as EstadoPenalizacion | undefined,
    pagina: this.paginaActual(),
    tamanioPagina: this.tamanioPagina,
  }));

  constructor() {
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.filtroActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((filtro) => this.penalizacionService.obtenerMisPenalizaciones(filtro).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.penalizaciones.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }
}