import { Component, computed, input } from '@angular/core';
import { IconName, ICONOS } from '../../../core/constants/icons.constants';

@Component({
  selector: 'app-icon',
  standalone:true,
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<number>(16);

  readonly paths = computed(() => ICONOS[this.name()].split(' M').map((p, i) => (i === 0 ? p : `M${p}`)));
}
