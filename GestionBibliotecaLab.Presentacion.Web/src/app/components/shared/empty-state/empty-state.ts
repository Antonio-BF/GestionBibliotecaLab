import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconName } from '../../../core/constants/icons.constants';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [Icon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly icono = input<IconName>('buscar');
  readonly titulo = input.required<string>();
  readonly texto = input<string>('');
}