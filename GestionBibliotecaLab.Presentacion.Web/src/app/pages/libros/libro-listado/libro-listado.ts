import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { LibroService } from '../../../services/libro.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { SOLO_ADMINISTRADOR } from '../../../core/constants/roles.constants';
import { APP_ROUTES } from '../../../core/constants/app-routes.constants';

import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { CategoriaSelect } from '../../../components/shared/categoria-select/categoria-select';
import { Icon } from '../../../components/shared/icon/icon';

import type { CategoriaResponse } from '../../../models/categoria.model';
import type { EstadoLibro, LibroFiltro, LibroResponse } from '../../../models/libro.model';
import { DatePipe } from '@angular/common';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';
import { PageHeader } from '../../../components/shared/page-header/page-header';
import { StatusBadge } from '../../../components/shared/status-badge/status-badge';

const TAMANIO_PAGINA = 8;
type VistaLibros = 'activos' | 'eliminados';

interface AccionLibro {
  libro: LibroResponse;
  tipo: 'baja' | 'reactivar';
}

@Component({
  selector: 'app-libros-listado',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CoverImagen, Paginador, ConfirmModal, CategoriaSelect, Icon, DatePipe, EmptyState, PageHeader, StatusBadge],
  templateUrl: './libro-listado.html',
  styleUrl: './libro-listado.css',
})
export class LibroListado {
  private readonly libroService = inject(LibroService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly appRoutes = APP_ROUTES;
  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly libros = signal<LibroResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly categorias = signal<CategoriaResponse[]>([]);

  readonly categoriaIdFiltro = signal<number | null>(null);
  readonly paginaActual = signal(1);
  readonly vista = signal<VistaLibros>('activos');
  readonly accionLibro = signal<AccionLibro | null>(null);

  readonly puedeGestionar = computed(() => this.authService.tieneAlgunRol(...SOLO_ADMINISTRADOR));

  readonly filtrosForm = this.fb.nonNullable.group({
    titulo: '',
    autor: '',
    isbn: '',
    anioPublicacion: '',
    estado: '',
  });

  private readonly filtrosTexto = toSignal(
    this.filtrosForm.valueChanges.pipe(debounceTime(350)),
    { initialValue: this.filtrosForm.getRawValue() }
  );

  private readonly filtroActual = computed<LibroFiltro>(() => {
    const texto = this.filtrosTexto();
    return {
      titulo: texto.titulo || undefined,
      autor: texto.autor || undefined,
      isbn: texto.isbn || undefined,
      anioPublicacion: texto.anioPublicacion ? Number(texto.anioPublicacion) : undefined,
      categoriaId: this.categoriaIdFiltro() ?? undefined,
      estado: (texto.estado || undefined) as EstadoLibro | undefined,
      pagina: this.paginaActual(),
      tamanioPagina: this.tamanioPagina,
    };
  });

  private readonly consultaActual = computed(() => ({ filtro: this.filtroActual(), vista: this.vista() }));

  constructor() {
    this.categoriaService.obtenerTodas().subscribe({ next: (categorias) => this.categorias.set(categorias) });
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.consultaActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap(({ filtro, vista }) => {
          const fuente = vista === 'eliminados'
            ? this.libroService.obtenerEliminados(filtro)
            : this.libroService.obtenerTodos(filtro);
          return fuente.pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.libros.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  cambiarVista(vista: VistaLibros): void {
    if (this.vista() === vista) return;
    this.vista.set(vista);
    this.paginaActual.set(1);
  }

  onCategoriaFiltroChange(categoriaId: number | null): void {
    this.categoriaIdFiltro.set(categoriaId);
    this.paginaActual.set(1);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({ titulo: '', autor: '', isbn: '', anioPublicacion: '', estado: '' });
    this.categoriaIdFiltro.set(null);
    this.paginaActual.set(1);
  }

  solicitarBaja(libro: LibroResponse): void {
    this.accionLibro.set({ libro, tipo: 'baja' });
  }

  solicitarReactivacion(libro: LibroResponse): void {
    this.accionLibro.set({ libro, tipo: 'reactivar' });
  }

  confirmarAccion(): void {
    const accion = this.accionLibro();
    if (!accion) return;

    this.libroService.cambiarEstado(accion.libro.id).subscribe({
      next: () => {
        const mensaje = accion.tipo === 'baja'
          ? `"${accion.libro.titulo}" fue dado de baja correctamente.`
          : `"${accion.libro.titulo}" fue reactivado correctamente.`;
        this.notificationService.mostrarExito(mensaje);

        this.libros.update((lista) => lista.filter((l) => l.id !== accion.libro.id));
        this.totalRegistros.update((total) => Math.max(0, total - 1));
        this.accionLibro.set(null);
      },
      error: () => this.accionLibro.set(null),
    });
  }

  cancelarAccion(): void {
    this.accionLibro.set(null);
  }
}