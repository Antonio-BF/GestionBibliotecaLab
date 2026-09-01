import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { PrestamoService } from '../../../services/prestamo.service';
import { NotificationService } from '../../../services/notification.service';
import { UsuarioBuscador } from '../../../components/shared/usuario-buscador/usuario-buscador';
import { LibroBuscador } from '../libro-buscador/libro-buscador';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { Icon } from '../../../components/shared/icon/icon';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';

import type { UsuarioResponse } from '../../../models/usuario.model';
import type { LibroResponse } from '../../../models/libro.model';
import type { CreatePrestamoRequest } from '../../../models/prestamo.model';
import type { ApiError } from '../../../models/api-error.model';

const OPCIONES_PLAZO = [7, 14, 21, 30] as const;

@Component({
  selector: 'app-prestamo-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, UsuarioBuscador, LibroBuscador, CoverImagen, Icon, FichaDetalle, DatePipe],
  providers: [DatePipe],
  templateUrl: './prestamo-formulario.html',
  styleUrl: './prestamo-formulario.css',
})
export class PrestamoFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly prestamoService = inject(PrestamoService);
  private readonly notificationService = inject(NotificationService);
  private readonly datePipe = inject(DatePipe);

  readonly guardado = output<void>();
  readonly cerrar = output<void>();

  readonly opcionesPlazo = OPCIONES_PLAZO;
  readonly fechaPrestamo = new Date();

  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly usuarioSeleccionado = signal<UsuarioResponse | null>(null);
  readonly libroSeleccionado = signal<LibroResponse | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    diasPlazo: [14, [Validators.required, Validators.min(1), Validators.max(90)]],
  });

  readonly diasPlazoActual = toSignal(this.formulario.controls.diasPlazo.valueChanges, {
    initialValue: this.formulario.controls.diasPlazo.value,
  });

  readonly fechaDevolucionEsperada = computed(() => {
    const dias = Number(this.diasPlazoActual()) || 0;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  });

  readonly listoParaResumen = computed(() => !!this.usuarioSeleccionado() && !!this.libroSeleccionado());

  readonly resumenItems = computed<FichaItem[]>(() => {
    const u = this.usuarioSeleccionado();
    const l = this.libroSeleccionado();
    if (!u || !l) return [];
    return [
      { etiqueta: 'Usuario', valor: `${u.nombres} ${u.apellidos} (${u.email})` },
      { etiqueta: 'Libro', valor: `${l.titulo} — ${l.autor}` },
      { etiqueta: 'ISBN', valor: l.isbn },
      { etiqueta: 'Plazo', valor: `${this.diasPlazoActual()} días` },
      { etiqueta: 'Fecha de préstamo', valor: this.datePipe.transform(this.fechaPrestamo, 'dd/MM/yyyy') ?? '' },
      { etiqueta: 'Devolución esperada', valor: this.datePipe.transform(this.fechaDevolucionEsperada(), 'dd/MM/yyyy') ?? '' },
    ];
  });

  get controles() {
    return this.formulario.controls;
  }

  onUsuarioSeleccionado(usuario: UsuarioResponse): void {
    this.usuarioSeleccionado.set(usuario);
    this.errorServidor.set(null);
  }
  quitarUsuario(): void {
    this.usuarioSeleccionado.set(null);
  }

  onLibroSeleccionado(libro: LibroResponse): void {
    this.libroSeleccionado.set(libro);
    this.errorServidor.set(null);
  }
  quitarLibro(): void {
    this.libroSeleccionado.set(null);
  }

  seleccionarPlazo(dias: number): void {
    this.formulario.controls.diasPlazo.setValue(dias);
  }

  guardar(): void {
    const usuario = this.usuarioSeleccionado();
    const libro = this.libroSeleccionado();

    if (!usuario) {
      this.errorServidor.set('Selecciona un usuario para registrar el préstamo.');
      return;
    }
    if (!libro) {
      this.errorServidor.set('Selecciona un libro disponible para prestar.');
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const request: CreatePrestamoRequest = {
      usuarioId: usuario.id,
      libroId: libro.id,
      diasPlazo: Number(this.formulario.getRawValue().diasPlazo),
    };

    this.prestamoService
      .registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito(`Préstamo de "${libro.titulo}" registrado correctamente.`);
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }
}