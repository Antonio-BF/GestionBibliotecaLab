import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { RolService } from '../../../services/rol.service';
import { NotificationService } from '../../../services/notification.service';
import { ROLES_SISTEMA_PROTEGIDOS } from '../../../core/constants/roles.constants';

import type { RolRequest, RolResponse } from '../../../models/rol.model';
import type { ApiError } from '../../../models/api-error.model';

@Component({
  selector: 'app-rol-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './rol-formulario.html',
  styleUrl: './rol-formulario.css',
})
export class RolFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly rolService = inject(RolService);
  private readonly notificationService = inject(NotificationService);

  readonly rol = input<RolResponse | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  readonly modoEdicion = computed(() => this.rol() !== null);
  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly esRolProtegido = computed(() => {
    const rol = this.rol();
    if (!rol) return false;
    return ROLES_SISTEMA_PROTEGIDOS.some((nombre) => nombre.toLowerCase() === rol.nombre.toLowerCase());
  });

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  get controles() {
    return this.formulario.controls;
  }

  constructor() {
    toObservable(this.rol)
      .pipe(takeUntilDestroyed())
      .subscribe((rol) => this.sincronizarFormulario(rol));
  }


  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const rolActual = this.rol();
    if (rolActual) {
      this.actualizar(rolActual.id);
    } else {
      this.registrar();
    }
  }

  private registrar(): void {
    const valores = this.formulario.getRawValue();
    const request: RolRequest = { nombre: valores.nombre, descripcion: valores.descripcion || null };

    this.rolService.registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Rol registrado correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private actualizar(id: number): void {
    const valores = this.formulario.getRawValue();
    const request: RolRequest = { nombre: valores.nombre, descripcion: valores.descripcion || null };

    this.rolService.actualizar(id, request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Rol actualizado correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private sincronizarFormulario(rol: RolResponse | null): void {
    this.errorServidor.set(null);

    if (!rol) {
      this.formulario.reset();
      this.controles.nombre.enable();
      return;
    }

    this.formulario.reset({
      nombre: rol.nombre,
      descripcion: rol.descripcion ?? '',
    });

    if (this.esRolProtegido()) {
      this.controles.nombre.disable();
    } else {
      this.controles.nombre.enable();
    }
  }
}