import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { LibroService } from '../../../services/libro.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ROLES_GESTION } from '../../../core/constants/roles.constants';
import { APP_ROUTES } from '../../../core/constants/app-routes.constants';

import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { CategoriaSelect } from '../../../components/shared/categoria-select/categoria-select';

import type { CategoriaResponse } from '../../../models/categoria.model';
import type { EstadoLibro, LibroFiltro, LibroResponse } from '../../../models/libro.model';

const TAMANIO_PAGINA = 8;

@Component({
  selector: 'app-libros-listado',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CoverImagen, Paginador, ConfirmModal, CategoriaSelect],
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
  readonly libroParaDarDeBaja = signal<LibroResponse | null>(null);

  readonly puedeGestionar = computed(() => this.authService.tieneAlgunRol(...ROLES_GESTION));

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

  constructor() {
    this.categoriaService.obtenerTodas().subscribe({ next: (categorias) => this.categorias.set(categorias) });
    this.filtrosForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.filtroActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap((filtro) =>
          this.libroService.obtenerTodos(filtro).pipe(catchError(() => of(null)))
        ),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.libros.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
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
    this.libroParaDarDeBaja.set(libro);
  }

  confirmarBaja(): void {
    const libro = this.libroParaDarDeBaja();
    if (!libro) return;

    this.libroService.cambiarEstado(libro.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`"${libro.titulo}" fue dado de baja correctamente.`);
        this.libros.update((lista) => lista.filter((l) => l.id !== libro.id));
        this.totalRegistros.update((total) => Math.max(0, total - 1));
        this.libroParaDarDeBaja.set(null);
      },
      error: () => this.libroParaDarDeBaja.set(null),
    });
  }

  cancelarBaja(): void {
    this.libroParaDarDeBaja.set(null);
  }
}
