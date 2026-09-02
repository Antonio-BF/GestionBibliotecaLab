import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PenalizacionService } from '../../../services/penalizacion.service';
import { NotificationService } from '../../../services/notification.service';
import { PrestamoPenalizableBuscador } from '../prestamo-penalizable-buscador/prestamo-penalizable-buscador';
import { ReservaPenalizableBuscador } from '../reserva-penalizable-buscador/reserva-penalizable-buscador';
import { Icon } from '../../../components/shared/icon/icon';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';

import type { PrestamoResponse } from '../../../models/prestamo.model';
import type { ReservaResponse } from '../../../models/reserva.model';
import type { ApiError } from '../../../models/api-error.model';
import {
  CreatePenalizacionRequest,
  ETIQUETAS_TIPO_PENALIZACION,
  OrigenPenalizacion,
  TIPOS_POR_ORIGEN,
  TipoPenalizacion,
} from '../../../models/penalizacion.model';

@Component({
  selector: 'app-penalizacion-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, PrestamoPenalizableBuscador, ReservaPenalizableBuscador, Icon, FichaDetalle],
  templateUrl: './penalizacion-formulario.html',
  styleUrl: './penalizacion-formulario.css',
})
export class PenalizacionFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly penalizacionService = inject(PenalizacionService);
  private readonly notificationService = inject(NotificationService);

  readonly guardado = output<void>();
  readonly cerrar = output<void>();

  readonly etiquetasTipo = ETIQUETAS_TIPO_PENALIZACION;

  readonly guardando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly verificandoDuplicado = signal(false);
  readonly advertenciaDuplicado = signal(false);

  readonly origenSeleccionado = signal<OrigenPenalizacion | null>(null);
  readonly prestamoSeleccionado = signal<PrestamoResponse | null>(null);
  readonly reservaSeleccionada = signal<ReservaResponse | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    tipo: ['' as TipoPenalizacion | '', [Validators.required]],
    motivo: ['', [Validators.required, Validators.maxLength(300)]],
    monto: [null as number | null, [Validators.min(0), Validators.max(100000)]],
  });

  get controles() {
    return this.formulario.controls;
  }

  private readonly tipoActual = toSignal(this.formulario.controls.tipo.valueChanges, {
    initialValue: this.formulario.controls.tipo.value,
  });
  private readonly montoActual = toSignal(this.formulario.controls.monto.valueChanges, {
    initialValue: this.formulario.controls.monto.value,
  });

  readonly opcionesTipo = computed<TipoPenalizacion[]>(() => {
    const origen = this.origenSeleccionado();
    return origen ? TIPOS_POR_ORIGEN[origen] : [];
  });

  readonly origenElegido = computed(() =>
    this.origenSeleccionado() === 'Prestamo' ? this.prestamoSeleccionado() !== null
      : this.origenSeleccionado() === 'ReservaLab' ? this.reservaSeleccionada() !== null
        : false
  );

  readonly listoParaResumen = computed(() => this.origenElegido() && !!this.tipoActual());

  readonly resumenItems = computed<FichaItem[]>(() => {
    if (!this.listoParaResumen()) return [];
    const origen = this.origenSeleccionado()!;
    const tipo = this.tipoActual() as TipoPenalizacion;
    const items: FichaItem[] = [];

    if (origen === 'Prestamo') {
      const p = this.prestamoSeleccionado()!;
      items.push(
        { etiqueta: 'Usuario', valor: `${p.nombreUsuario} (${p.emailUsuario})` },
        { etiqueta: 'Origen', valor: `Préstamo #${p.id} — ${p.tituloLibro}` },
      );
    } else {
      const r = this.reservaSeleccionada()!;
      items.push(
        { etiqueta: 'Usuario', valor: `${r.nombreUsuario} (${r.emailUsuario})` },
        { etiqueta: 'Origen', valor: `Reserva #${r.id} — ${r.nombreLaboratorio}` },
      );
    }

    items.push({ etiqueta: 'Tipo', valor: this.etiquetasTipo[tipo] });
    const monto = Number(this.montoActual());
    if (this.montoActual() && !Number.isNaN(monto)) {
      items.push({ etiqueta: 'Monto', valor: `S/ ${monto.toFixed(2)}` });
    }

    return items;
  });

  constructor() {
    this.actualizarHabilitacionDetalle();
  }

  elegirOrigen(origen: OrigenPenalizacion): void {
    if (this.origenSeleccionado() === origen) return;
    this.origenSeleccionado.set(origen);
    this.prestamoSeleccionado.set(null);
    this.reservaSeleccionada.set(null);
    this.advertenciaDuplicado.set(false);
    this.errorServidor.set(null);
    this.formulario.reset({ tipo: '', motivo: '', monto: null });
    this.actualizarHabilitacionDetalle();
  }

  onPrestamoSeleccionado(prestamo: PrestamoResponse): void {
    this.prestamoSeleccionado.set(prestamo);
    this.errorServidor.set(null);
    this.actualizarHabilitacionDetalle();
    this.verificarDuplicado('Prestamo', prestamo.id);
  }
  quitarPrestamo(): void {
    this.prestamoSeleccionado.set(null);
    this.advertenciaDuplicado.set(false);
    this.actualizarHabilitacionDetalle();
  }

  onReservaSeleccionada(reserva: ReservaResponse): void {
    this.reservaSeleccionada.set(reserva);
    this.errorServidor.set(null);
    this.actualizarHabilitacionDetalle();
    this.verificarDuplicado('ReservaLab', reserva.id);
  }
  quitarReserva(): void {
    this.reservaSeleccionada.set(null);
    this.advertenciaDuplicado.set(false);
    this.actualizarHabilitacionDetalle();
  }

  private actualizarHabilitacionDetalle(): void {
    const habilitar = this.origenElegido();
    const metodo = habilitar ? 'enable' : 'disable';
    this.controles.tipo[metodo]({ emitEvent: false });
    this.controles.monto[metodo]({ emitEvent: false });
    this.controles.motivo[metodo]({ emitEvent: false });
  }

  private verificarDuplicado(origen: OrigenPenalizacion, origenId: number): void {
    this.verificandoDuplicado.set(true);
    this.advertenciaDuplicado.set(false);

    const consulta = origen === 'Prestamo'
      ? this.penalizacionService.obtenerPorPrestamo(origenId, { estado: 'Pendiente', tamanioPagina: 1 })
      : this.penalizacionService.obtenerPorReserva(origenId, { estado: 'Pendiente', tamanioPagina: 1 });

    consulta.pipe(finalize(() => this.verificandoDuplicado.set(false))).subscribe({
      next: (resultado) => this.advertenciaDuplicado.set(resultado.totalRegistros > 0),
      error: () => { },
    });
  }

  guardar(): void {
    const origen = this.origenSeleccionado();
    if (!origen || !this.origenElegido()) {
      this.errorServidor.set('Selecciona el préstamo o la reserva a penalizar.');
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const valores = this.formulario.getRawValue();
    const origenId = origen === 'Prestamo' ? this.prestamoSeleccionado()!.id : this.reservaSeleccionada()!.id;
    const monto = valores.monto ? Number(valores.monto) : null;

    const request: CreatePenalizacionRequest = {
      origen,
      origenId,
      tipo: valores.tipo as TipoPenalizacion,
      motivo: valores.motivo,
      monto,
    };

    this.penalizacionService
      .registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Penalización registrada correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }
}