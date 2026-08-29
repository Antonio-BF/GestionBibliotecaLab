import { Component, input, output } from '@angular/core';
import { CategoriaResponse } from '../../../models/categoria.model';
import { EntitySelect } from '../entity-select/entity-select';

@Component({
  selector: 'app-categoria-select',
  standalone: true,
  imports: [EntitySelect],
  templateUrl: './categoria-select.html',
  styleUrl: './categoria-select.css',
})
export class CategoriaSelect {
  readonly categorias = input.required<CategoriaResponse[]>();
  readonly valor = input<number | null>(null);
  readonly incluirTodas = input<boolean>(false);
  readonly deshabilitado = input<boolean>(false);
  readonly cambio = output<number | null>();

}
