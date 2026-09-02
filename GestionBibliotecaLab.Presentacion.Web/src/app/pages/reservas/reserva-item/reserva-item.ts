import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Icon } from '../../../components/shared/icon/icon';
import type { ReservaResponse } from '../../../models/reserva.model';
import { claseEstadoReserva } from '../../../core/utils/estados.util';

@Component({
  selector: 'app-reserva-item',
  standalone: true,
  imports: [DatePipe, Icon],
  templateUrl: './reserva-item.html',
  styleUrl: './reserva-item.css',
})
export class ReservaItem {
  readonly reserva = input.required<ReservaResponse>();
  readonly mostrarUsuario = input<boolean>(true);
  readonly mostrarAccionConfirmar = input<boolean>(true);
  readonly mostrarAccionCancelar = input<boolean>(true);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  readonly claseEstado = computed(() => claseEstadoReserva(this.reserva().estado));

  readonly puedeConfirmar = computed(() =>
    this.mostrarAccionConfirmar() && this.reserva().estado === 'Pendiente'
  );

  readonly puedeCancelar = computed(() =>
    this.mostrarAccionCancelar() &&
    (this.reserva().estado === 'Pendiente' || this.reserva().estado === 'Confirmada')
  );
}