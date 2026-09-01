import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Icon } from '../../../components/shared/icon/icon';
import type { PrestamoResponse } from '../../../models/prestamo.model';
import { calcularEstadoEfectivoPrestamo, claseEstadoPrestamo, etiquetaEstadoPrestamo } from '../../../core/utils/estados.util';

@Component({
  selector: 'app-prestamo-item',
  standalone: true,
  imports: [DatePipe, Icon],
  templateUrl: './prestamo-item.html',
  styleUrl: './prestamo-item.css',
})
export class PrestamoItem {
  readonly prestamo = input.required<PrestamoResponse>();
  readonly mostrarUsuario = input<boolean>(true);
  readonly mostrarAcciones = input<boolean>(true);

  readonly renovar = output<void>();
  readonly devolver = output<void>();

  readonly estadoEfectivo = computed(() => calcularEstadoEfectivoPrestamo(this.prestamo()));
  readonly claseEstado = computed(() => claseEstadoPrestamo(this.estadoEfectivo()));
  readonly etiquetaEstado = computed(() => etiquetaEstadoPrestamo(this.estadoEfectivo()));

  readonly puedeRenovar = computed(() => this.prestamo().estado === 'Prestado');
  readonly puedeDevolver = computed(() => this.prestamo().estado !== 'Devuelto');
}