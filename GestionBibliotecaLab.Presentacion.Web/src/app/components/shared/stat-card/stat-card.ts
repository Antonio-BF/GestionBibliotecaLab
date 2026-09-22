import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../../../core/constants/icons.constants';

export type StatCardVariante = 'primary' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [Icon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  readonly icono = input.required<IconName>();
  readonly valor = input.required<string | number>();
  readonly etiqueta = input.required<string>();
  readonly subtexto = input<string | null>(null);
  readonly variante = input<StatCardVariante>('primary');
}