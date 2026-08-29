import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { CategoriaService } from '../../../services/categoria.service';
import { NotificationService } from '../../../services/notification.service';

import type { CategoriaRequest, CategoriaResponse } from '../../../models/categoria.model';
import type { ApiError } from '../../../models/api-error.model';

@Component({
  selector: 'app-categoria-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categoria-formulario.html',
  styleUrl: './categoria-formulario.css',
})
export class CategoriaFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificationService = inject(NotificationService);

  readonly categoria = input<CategoriaResponse | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  readonly modoEdicion = computed(() => this.categoria() !== null);
  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(300)]],
  });

  get controles() {
    return this.formulario.controls;
  }

  constructor() {
    toObservable(this.categoria)
      .pipe(takeUntilDestroyed())
      .subscribe((cat) => this.sincronizarFormulario(cat));
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const categoriaActual = this.categoria();
    if (categoriaActual) {
      this.actualizar(categoriaActual.id);
    } else {
      this.registrar();
    }
  }

  private registrar(): void {
    const valores = this.formulario.getRawValue();
    const request: CategoriaRequest = { nombre: valores.nombre, descripcion: valores.descripcion || null };

    this.categoriaService.registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Categoría registrada correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private actualizar(id: number): void {
    const valores = this.formulario.getRawValue();
    const request: CategoriaRequest = { nombre: valores.nombre, descripcion: valores.descripcion || null };

    this.categoriaService.actualizar(id, request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Categoría actualizada correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private sincronizarFormulario(cat: CategoriaResponse | null): void {
    this.errorServidor.set(null);

    if (!cat) {
      this.formulario.reset();
      return;
    }

    this.formulario.patchValue({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
    });
  }
}