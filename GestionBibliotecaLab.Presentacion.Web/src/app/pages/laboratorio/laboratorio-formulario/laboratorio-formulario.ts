import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { LaboratorioService } from '../../../services/laboratorio.service';
import { NotificationService } from '../../../services/notification.service';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';

import type { CreateLaboratorioRequest, EstadoLaboratorio, LaboratorioResponse, UpdateLaboratorioRequest } from '../../../models/laboratorio.model';
import type { ApiError } from '../../../models/api-error.model';
import { Icon } from '../../../components/shared/icon/icon';

const EXTENSIONES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO_BYTES = 3 * 1024 * 1024;

@Component({
  selector: 'app-laboratorio-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, CoverImagen, Icon],
  templateUrl: './laboratorio-formulario.html',
  styleUrl: './laboratorio-formulario.css',
})
export class LaboratorioFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly notificationService = inject(NotificationService);

  readonly laboratorio = input<LaboratorioResponse | null>(null);
  readonly guardado = output<void>();
  readonly cerrar = output<void>();

  readonly guardando = signal(false);
  readonly subiendoImagen = signal(false);
  readonly errorServidor = signal<string | null>(null);

  private readonly recienCreado = signal<LaboratorioResponse | null>(null);

  readonly laboratorioActivo = computed(() => this.recienCreado() ?? this.laboratorio());
  readonly modoEdicion = computed(() => this.laboratorioActivo() !== null);
  readonly rowVersion = computed(() => this.laboratorioActivo()?.rowVersion ?? null);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    capacidad: [1, [Validators.required, Validators.min(1)]],
    ubicacion: ['', [Validators.required, Validators.maxLength(150)]],
    equipamiento: ['', [Validators.maxLength(500)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    estado: ['Disponible' as EstadoLaboratorio],
  });

  get controles() {
    return this.formulario.controls;
  }

  constructor() {
    toObservable(this.laboratorio)
      .pipe(takeUntilDestroyed())
      .subscribe((lab) => this.sincronizarFormulario(lab));
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const activo = this.laboratorioActivo();
    if (activo) {
      this.actualizar(activo.id);
    } else {
      this.registrar();
    }
  }

  onArchivoSeleccionado(evento: Event): void {
    const activo = this.laboratorioActivo();
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

    this.subiendoImagen.set(true);
    this.laboratorioService
      .actualizarImagen(activo.id, archivo)
      .pipe(finalize(() => this.subiendoImagen.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.recienCreado.set(actualizado);
          this.notificationService.mostrarExito('Imagen actualizada correctamente.');
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

    const request: CreateLaboratorioRequest = {
      nombre: valores.nombre,
      capacidad: Number(valores.capacidad),
      ubicacion: valores.ubicacion,
      equipamiento: valores.equipamiento || null,
      descripcion: valores.descripcion || null,
    };

    this.laboratorioService
      .registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (laboratorio) => {
          this.recienCreado.set(laboratorio);
          this.notificationService.mostrarExito('Laboratorio registrado correctamente. Ahora puedes subir una imagen.');
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

    const request: UpdateLaboratorioRequest = {
      nombre: valores.nombre,
      capacidad: Number(valores.capacidad),
      ubicacion: valores.ubicacion,
      equipamiento: valores.equipamiento || null,
      descripcion: valores.descripcion || null,
      estado: valores.estado as EstadoLaboratorio,
      rowVersion: version,
    };

    this.laboratorioService
      .actualizar(id, request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Laboratorio actualizado correctamente.');
          this.guardado.emit();
          this.laboratorioService.obtenerPorId(id).subscribe((actualizado) => {
            this.recienCreado.set(actualizado);
          });
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private sincronizarFormulario(laboratorio: LaboratorioResponse | null): void {
    this.errorServidor.set(null);
    this.recienCreado.set(null);

    if (!laboratorio) {
      this.formulario.reset({ nombre: '', capacidad: 1, ubicacion: '', equipamiento: '', descripcion: '', estado: 'Disponible' });
      return;
    }

    this.formulario.patchValue({
      nombre: laboratorio.nombre,
      capacidad: laboratorio.capacidad,
      ubicacion: laboratorio.ubicacion,
      equipamiento: laboratorio.equipamiento ?? '',
      descripcion: laboratorio.descripcion ?? '',
      estado: laboratorio.estado,
    });
  }
}