import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { LibroService } from '../../../services/libro.service';
import { NotificationService } from '../../../services/notification.service';

import { CategoriaSelect } from '../../../components/shared/categoria-select/categoria-select';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { Icon } from '../../../components/shared/icon/icon';

import type { CategoriaResponse } from '../../../models/categoria.model';
import type { CreateLibroRequest, EstadoLibro, LibroResponse, UpdateLibroRequest } from '../../../models/libro.model';
import type { ApiError } from '../../../models/api-error.model';

const EXTENSIONES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO_BYTES = 3 * 1024 * 1024;

@Component({
  selector: 'app-libro-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, CategoriaSelect, CoverImagen, Icon],
  templateUrl: './libro-formulario.html',
  styleUrl: './libro-formulario.css',
})
export class LibroFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly libroService = inject(LibroService);
  private readonly notificationService = inject(NotificationService);

  readonly categorias = input.required<CategoriaResponse[]>();

  readonly libro = input<LibroResponse | null>(null);
  readonly guardado = output<void>();
  readonly cerrar = output<void>();

  readonly guardando = signal(false);
  readonly subiendoPortada = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly categoriaIdSeleccionada = signal<number | null>(null);

  private readonly recienCreado = signal<LibroResponse | null>(null);
  
  readonly libroActivo = computed(() => this.recienCreado() ?? this.libro());
  readonly modoEdicion = computed(() => this.libroActivo() !== null);
  readonly rowVersion = computed(() => this.libroActivo()?.rowVersion ?? null);

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
    toObservable(this.libro)
      .pipe(takeUntilDestroyed())
      .subscribe((libro) => this.sincronizarFormulario(libro));
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

    const activo = this.libroActivo();
    if (activo) {
      this.actualizar(activo.id);
    } else {
      this.registrar();
    }
  }

  onArchivoSeleccionado(evento: Event): void {
    const activo = this.libroActivo();
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!activo || !archivo) return;

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
      .actualizarPortada(activo.id, archivo)
      .pipe(finalize(() => this.subiendoPortada.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.recienCreado.set(actualizado);
          this.notificationService.mostrarExito('Portada actualizada correctamente.');
          this.guardado.emit();
        },
      });

    input.value = '';
  }

  finalizar(): void {
    this.cerrar.emit();
  }

  private registrar(): void {
    const valores = this.formulario.getRawValue();
    const anioPublicacion = valores.anioPublicacion ? Number(valores.anioPublicacion) : null;

    const request: CreateLibroRequest = {
      titulo: valores.titulo,
      autor: valores.autor,
      isbn: valores.isbn,
      editorial: valores.editorial || null,
      anioPublicacion,
      categoriaId: this.categoriaIdSeleccionada(),
      descripcion: valores.descripcion || null,
      cantidadTotal: Number(valores.cantidadTotal),
    };

    this.libroService
      .registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (libro) => {
          this.recienCreado.set(libro);
          this.notificationService.mostrarExito('Libro registrado correctamente. Ahora puedes subir la portada.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private actualizar(id: number): void {
    const version = this.rowVersion();
    if (!version) {
      this.guardando.set(false);
      return;
    }

    const valores = this.formulario.getRawValue();
    const anioPublicacion = valores.anioPublicacion ? Number(valores.anioPublicacion) : null;

    const request: UpdateLibroRequest = {
      titulo: valores.titulo,
      autor: valores.autor,
      isbn: valores.isbn,
      editorial: valores.editorial || null,
      anioPublicacion,
      categoriaId: this.categoriaIdSeleccionada(),
      descripcion: valores.descripcion || null,
      cantidadTotal: Number(valores.cantidadTotal),
      estado: valores.estado as EstadoLibro,
      rowVersion: version,
    };

    this.libroService
      .actualizar(id, request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Libro actualizado correctamente.');
          this.guardado.emit();
          this.libroService.obtenerPorId(id).subscribe((actualizado) => {
            this.recienCreado.set(actualizado);
          });
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private sincronizarFormulario(libro: LibroResponse | null): void {
    this.errorServidor.set(null);
    this.recienCreado.set(null);

    if (!libro) {
      this.formulario.reset({
        titulo: '',
        autor: '',
        isbn: '',
        editorial: '',
        anioPublicacion: '',
        descripcion: '',
        cantidadTotal: 1,
        estado: 'Activo',
      });
      this.categoriaIdSeleccionada.set(null);
      return;
    }

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
  }
}