import { Component, input } from '@angular/core';

export interface FichaItem {
  etiqueta: string;
  valor: string;
}

/**
 * Lista de pares etiqueta/valor para vistas de detalle.
 * Agregar un dato nuevo a una ficha es agregar un objeto al arreglo que
 * arma el componente de página consumidor; este componente no cambia.
 */
@Component({
  selector: 'app-ficha-detalle',
  standalone: true,
  templateUrl: './ficha-detalle.html',
  styleUrl: './ficha-detalle.css',
})
export class FichaDetalle {
  readonly items = input.required<FichaItem[]>();
}