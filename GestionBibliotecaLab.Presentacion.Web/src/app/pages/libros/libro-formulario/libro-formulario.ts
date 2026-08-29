import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { LibroService } from '../../../services/libro.service';
import { CategoriaService } from '../../../services/categoria.service';
import { NotificationService } from '../../../services/notification.service';
import { APP_ROUTES } from '../../../core/constants/app-routes.constants';

import { CategoriaSelect } from '../../../components/shared/categoria-select/categoria-select';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';

import type { CategoriaResponse } from '../../../models/categoria.model';
import type { EstadoLibro, LibroResponse } from '../../../models/libro.model';
import type { ApiError } from '../../../models/api-error.model';
import { Icon } from '../../../components/shared/icon/icon';

const EXTENSIONES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO_BYTES = 3 * 1024 * 1024;
@Component({
  selector: 'app-libros-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CategoriaSelect, CoverImagen, Icon],
  templateUrl: './libro-formulario.html',
  styleUrl: './libro-formulario.css',
})
export class LibroFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly libroService = inject(LibroService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly appRoutes = APP_ROUTES;

  private readonly idParametro = this.route.snapshot.paramMap.get('id');
  readonly libroId = signal<number | null>(this.idParametro ? Number(this.idParametro) : null);
  readonly modoEdicion = computed(() => this.libroId() !== null);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly subiendoPortada = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly categoriaIdSeleccionada = signal<number | null>(null);
  readonly libroActual = signal<LibroResponse | null>(null);
  private rowVersion: string | null = null;

  readonly formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(250)]],
    autor: ['', [Validators.required, Validators.maxLength(150)]],
    isbn: ['', [Validators.required, Validators.maxLength(20)]],
    editorial: ['', [Validators.maxLength(150)]],
    anioPublicacion: ['', [Validators.min(1000), Validators.max(2100)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    cantidadTotal: [1, [Validators.required, Validators.min(1)]],
    estado: ['Activo' as EstadoLibro],
  });

  get controles() {
    return this.formulario.controls;
  }

  constructor() {
    this.categoriaService.obtenerTodas().subscribe({ next: (categorias) => this.categorias.set(categorias) });

    const id = this.libroId();
    if (id !== null) {
      this.cargarLibro(id);
    }
  }

  onCategoriaChange(categoriaId: number | null): void {
    this.categoriaIdSeleccionada.set(categoriaId);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const valores = this.formulario.getRawValue();
    const anioPublicacion = valores.anioPublicacion ? Number(valores.anioPublicacion) : null;

    if (this.modoEdicion()) {
      this.actualizar(valores, anioPublicacion);
    } else {
      this.registrar(valores, anioPublicacion);
    }
  }

  onArchivoSeleccionado(evento: Event): void {
    const id = this.libroId();
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (id === null || !archivo) return;

    if (!EXTENSIONES_PERMITIDAS.includes(archivo.type)) {
      this.notificationService.mostrarError('Formato de imagen no permitido. Usa jpg, jpeg, png o webp.');
      input.value = '';
      return;
    }

    if (archivo.size > TAMANIO_MAXIMO_BYTES) {
      this.notificationService.mostrarError('La imagen supera el tamaño máximo permitido (3 MB).');
      input.value = '';
      return;
    }

    this.subiendoPortada.set(true);
    this.libroService
      .actualizarPortada(id, archivo)
      .pipe(finalize(() => this.subiendoPortada.set(false)))
      .subscribe({
        next: (libro) => {
          this.libroActual.set(libro);
          this.notificationService.mostrarExito('Portada actualizada correctamente.');
          this.cargarLibro(id);
        },
      });

    input.value = '';
  }

  private registrar(
    valores: ReturnType<typeof this.formulario.getRawValue>,
    anioPublicacion: number | null
  ): void {
    this.libroService
      .registrar({
        titulo: valores.titulo,
        autor: valores.autor,
        isbn: valores.isbn,
        editorial: valores.editorial || null,
        anioPublicacion,
        categoriaId: this.categoriaIdSeleccionada(),
        descripcion: valores.descripcion || null,
        cantidadTotal: Number(valores.cantidadTotal),
      })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (libro) => {
          this.notificationService.mostrarExito('Libro registrado correctamente. Ahora puedes subir la portada.');
          this.router.navigate([this.appRoutes.LIBROS, libro.id, 'editar']);
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private actualizar(
    valores: ReturnType<typeof this.formulario.getRawValue>,
    anioPublicacion: number | null
  ): void {
    const id = this.libroId();
    if (id === null || !this.rowVersion) return;

    this.libroService
      .actualizar(id, {
        titulo: valores.titulo,
        autor: valores.autor,
        isbn: valores.isbn,
        editorial: valores.editorial || null,
        anioPublicacion,
        categoriaId: this.categoriaIdSeleccionada(),
        descripcion: valores.descripcion || null,
        cantidadTotal: Number(valores.cantidadTotal),
        estado: valores.estado as EstadoLibro,
        rowVersion: this.rowVersion,
      })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Libro actualizado correctamente.');
          this.cargarLibro(id); 
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private cargarLibro(id: number): void {
    this.cargando.set(true);
    this.libroService
      .obtenerPorId(id)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (libro) => {
          this.libroActual.set(libro);
          this.rowVersion = libro.rowVersion;
          this.categoriaIdSeleccionada.set(libro.categoriaId);
          this.formulario.patchValue({
            titulo: libro.titulo,
            autor: libro.autor,
            isbn: libro.isbn,
            editorial: libro.editorial ?? '',
            anioPublicacion: libro.anioPublicacion ? String(libro.anioPublicacion) : '',
            descripcion: libro.descripcion ?? '',
            cantidadTotal: libro.cantidadTotal,
            estado: libro.estado,
          });
        },
        error: () => this.router.navigate([this.appRoutes.LIBROS]),
      });
  }
}
