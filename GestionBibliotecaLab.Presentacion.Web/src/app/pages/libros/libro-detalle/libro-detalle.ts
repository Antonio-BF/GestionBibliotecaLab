import { Component, computed, input, output } from '@angular/core';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';
import { StatusBadge } from '../../../components/shared/status-badge/status-badge';
import { Icon } from '../../../components/shared/icon/icon';
import type { LibroResponse } from '../../../models/libro.model';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [CoverImagen, FichaDetalle, StatusBadge, Icon],
  templateUrl: './libro-detalle.html',
  styleUrl: './libro-detalle.css',
})
export class LibroDetalle {
  readonly libro = input.required<LibroResponse>();
  readonly puedeGestionar = input<boolean>(false);
  readonly editar = output<void>();

  readonly ficha = computed<FichaItem[]>(() => {
    const libro = this.libro();
    return [
      { etiqueta: 'Autor', valor: libro.autor },
      { etiqueta: 'ISBN', valor: libro.isbn },
      { etiqueta: 'Editorial', valor: libro.editorial ?? 'No especificada' },
      { etiqueta: 'Año de publicación', valor: libro.anioPublicacion ? String(libro.anioPublicacion) : 'No especificado' },
      { etiqueta: 'Categoría', valor: libro.nombreCategoria ?? 'Sin categoría' },
      { etiqueta: 'Disponibilidad', valor: `${libro.cantidadDisponible} de ${libro.cantidadTotal} ejemplares` },
    ];
  });
}