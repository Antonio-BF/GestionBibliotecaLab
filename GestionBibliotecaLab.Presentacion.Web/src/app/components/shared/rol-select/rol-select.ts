import { Component, input, output } from '@angular/core';
import { RolResponse } from '../../../models/rol.model';
import { EntitySelect } from '../entity-select/entity-select';

@Component({
  selector: 'app-rol-select',
  standalone: true,
  imports: [EntitySelect],
  templateUrl: './rol-select.html',
  styleUrl: './rol-select.css',
})
export class RolSelect {
  readonly roles = input.required<RolResponse[]>();
  readonly valor = input<number | null>(null);
  readonly incluirTodos = input<boolean>(false);
  readonly deshabilitado = input<boolean>(false);
  readonly cambio = output<number | null>();
}