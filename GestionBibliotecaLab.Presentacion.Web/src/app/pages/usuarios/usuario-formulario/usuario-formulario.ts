import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { UsuarioService } from '../../../services/usuario.service';
import { NotificationService } from '../../../services/notification.service';

import { RolSelect } from '../../../components/shared/rol-select/rol-select';

import type { RolResponse } from '../../../models/rol.model';
import type { CreateUsuarioRequest, UpdateUsuarioRequest, UsuarioResponse } from '../../../models/usuario.model';
import type { ApiError } from '../../../models/api-error.model';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

const PATRON_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, RolSelect],
  templateUrl: './usuario-formulario.html',
  styleUrl: './usuario-formulario.css',
})
export class UsuarioFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);

  readonly roles = input<RolResponse[]>([]);
  readonly usuario = input<UsuarioResponse | null>(null);
  readonly guardado = output<void>();
  readonly cancelado = output<void>();

  readonly modoEdicion = computed(() => this.usuario() !== null);
  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly rolIdSeleccionado = signal<number | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: [''],
  });

  get controles() {
    return this.formulario.controls;
  }

  constructor() {
    toObservable(this.usuario)
      .pipe(takeUntilDestroyed())
      .subscribe((usuario) => this.sincronizarFormulario(usuario));
  }

  onRolChange(rolId: number | null): void {
    this.rolIdSeleccionado.set(rolId);
  }

  guardar(): void {
    if (this.formulario.invalid || this.rolIdSeleccionado() === null) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const usuarioActual = this.usuario();
    if (usuarioActual) {
      this.actualizar(usuarioActual.id);
    } else {
      this.registrar();
    }
  }

  private registrar(): void {
    const valores = this.formulario.getRawValue();
    const request: CreateUsuarioRequest = {
      nombres: valores.nombres,
      apellidos: valores.apellidos,
      email: valores.email,
      password: valores.password,
      rolId: this.rolIdSeleccionado()!,
    };

    this.usuarioService.registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Usuario registrado correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private actualizar(id: number): void {
    const valores = this.formulario.getRawValue();
    const request: UpdateUsuarioRequest = {
      nombres: valores.nombres,
      apellidos: valores.apellidos,
      email: valores.email,
      password: valores.password || null,
      rolId: this.rolIdSeleccionado()!,
    };

    this.usuarioService.actualizar(id, request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Usuario actualizado correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

  private sincronizarFormulario(usuario: UsuarioResponse | null): void {
    const esEdicion = usuario !== null;

    const validadoresPassword = esEdicion
      ? [Validators.pattern(PATRON_PASSWORD), Validators.minLength(8)]
      : [Validators.required, Validators.minLength(8), Validators.pattern(PATRON_PASSWORD)];

    this.controles.password.setValidators(validadoresPassword);
    this.controles.password.updateValueAndValidity();

    if (!usuario) {
      this.formulario.reset();
      this.rolIdSeleccionado.set(null);
      return;
    }

    this.rolIdSeleccionado.set(usuario.rolId);
    this.formulario.patchValue({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      password: '',
    });
  }
}