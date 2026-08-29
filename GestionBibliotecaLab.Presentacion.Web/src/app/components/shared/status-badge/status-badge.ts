import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {

  readonly activo = input.required<boolean>();
  readonly etiquetaActivo = input<string>('Activo');
  readonly etiquetaInactivo = input<string>('Inactivo');
}