import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { PrestamoService } from '../../../services/prestamo.service';
import { NotificationService } from '../../../services/notification.service';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';
import { Icon } from '../../../components/shared/icon/icon';

import type { PrestamoResponse, RenovarPrestamoRequest } from '../../../models/prestamo.model';
import type { ApiError } from '../../../models/api-error.model';

const OPCIONES_PLAZO = [7, 14, 21, 30] as const;

@Component({
  selector: 'app-prestamo-renovacion',
  standalone: true,
  imports: [ReactiveFormsModule, FichaDetalle, Icon, DatePipe],
  providers: [DatePipe],
  templateUrl: './prestamo-renovacion.html',
  styleUrl: './prestamo-renovacion.css',
})
export class PrestamoRenovacion {
  private readonly fb = inject(FormBuilder);
  private readonly prestamoService = inject(PrestamoService);
  private readonly notificationService = inject(NotificationService);
  private readonly datePipe = inject(DatePipe);

  readonly prestamo = input.required<PrestamoResponse>();
  readonly guardado = output<void>();
  readonly cerrar = output<void>();

  readonly opcionesPlazo = OPCIONES_PLAZO;
  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    diasAdicionales: [7, [Validators.required, Validators.min(1), Validators.max(30)]],
  });

  readonly diasActuales = toSignal(this.formulario.controls.diasAdicionales.valueChanges, {
    initialValue: this.formulario.controls.diasAdicionales.value,
  });

  readonly nuevaFechaDevolucion = computed(() => {
    const dias = Number(this.diasActuales()) || 0;
    const base = new Date(this.prestamo().fechaDevolucionEsperada);
    base.setDate(base.getDate() + dias);
    return base;
  });

  readonly fichaPrestamo = computed<FichaItem[]>(() => {
    const p = this.prestamo();
    return [
      { etiqueta: 'Usuario', valor: `${p.nombreUsuario} (${p.emailUsuario})` },
      { etiqueta: 'Libro', valor: `${p.tituloLibro} — ISBN ${p.isbnLibro}` },
      { etiqueta: 'Fecha de préstamo', valor: this.datePipe.transform(p.fechaPrestamo, 'dd/MM/yyyy') ?? '' },
      { etiqueta: 'Estado actual', valor: p.estado },
    ];
  });

  get controles() {
    return this.formulario.controls;
  }

  seleccionarPlazo(dias: number): void {
    this.formulario.controls.diasAdicionales.setValue(dias);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.errorServidor.set(null);
    this.guardando.set(true);

    const request: RenovarPrestamoRequest = { diasAdicionales: Number(this.formulario.getRawValue().diasAdicionales) };

    this.prestamoService
      .renovar(this.prestamo().id, request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito(`Préstamo de "${this.prestamo().tituloLibro}" renovado correctamente.`);
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }
}