import { Component, computed, input, output } from '@angular/core';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';
import { Icon } from '../../../components/shared/icon/icon';
import type { LaboratorioResponse } from '../../../models/laboratorio.model';
import { claseEstadoLaboratorio } from '../../../core/utils/estados.util';

@Component({
  selector: 'app-laboratorio-detalle',
  standalone: true,
  imports: [CoverImagen, FichaDetalle, Icon],
  templateUrl: './laboratorio-detalle.html',
  styleUrl: './laboratorio-detalle.css',
})
export class LaboratorioDetalle {
  readonly laboratorio = input.required<LaboratorioResponse>();
  readonly puedeGestionar = input<boolean>(false);
  readonly editar = output<void>();

  readonly claseEstado = claseEstadoLaboratorio;

  readonly ficha = computed<FichaItem[]>(() => {
    const lab = this.laboratorio();
    return [
      { etiqueta: 'Ubicación', valor: lab.ubicacion },
      { etiqueta: 'Capacidad', valor: `${lab.capacidad} personas` },
      { etiqueta: 'Equipamiento', valor: lab.equipamiento ?? 'No especificado' },
      { etiqueta: 'Estado', valor: lab.estado },
    ];
  });
}