import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Icon } from '../../../components/shared/icon/icon';
import type { PenalizacionResponse } from '../../../models/penalizacion.model';
import { ETIQUETAS_TIPO_PENALIZACION } from '../../../models/penalizacion.model';
import { claseEstadoPenalizacion } from '../../../core/utils/estados.util';

@Component({
  selector: 'app-penalizacion-item',
  standalone: true,
  imports: [DatePipe, Icon],
  templateUrl: './penalizacion-item.html',
  styleUrl: './penalizacion-item.css',
})
export class PenalizacionItem {
  readonly penalizacion = input.required<PenalizacionResponse>();
  readonly mostrarUsuario = input<boolean>(true);
  readonly mostrarAcciones = input<boolean>(true);

  readonly resolver = output<void>();
  readonly anular = output<void>();

  readonly etiquetasTipo = ETIQUETAS_TIPO_PENALIZACION;
  readonly claseEstado = computed(() => claseEstadoPenalizacion(this.penalizacion().estado));

  readonly origenTexto = computed(() => {
    const p = this.penalizacion();
    return p.prestamoId ? `Préstamo #${p.prestamoId}` : `Reserva #${p.reservaLabId}`;
  });

  readonly puedeGestionar = computed(() => this.mostrarAcciones() && this.penalizacion().estado === 'Pendiente');
}