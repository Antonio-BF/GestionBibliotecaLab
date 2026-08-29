import { Component, input, output } from '@angular/core';

export interface SelectableEntity {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-entity-select',
  standalone: true,
  templateUrl: './entity-select.html',
  styleUrl: './entity-select.css',
})
export class EntitySelect<T extends SelectableEntity = SelectableEntity> {
  readonly items = input.required<T[]>();
  readonly valor = input<number | null>(null);
  readonly incluirTodos = input<boolean>(false);
  readonly deshabilitado = input<boolean>(false);
  readonly etiquetaTodos = input<string>('Todos');
  readonly etiquetaVacio = input<string>('Selecciona una opción');

  readonly cambio = output<number | null>();

  onCambio(valorCrudo: string): void {
    this.cambio.emit(valorCrudo === '' ? null : Number(valorCrudo));
  }
}