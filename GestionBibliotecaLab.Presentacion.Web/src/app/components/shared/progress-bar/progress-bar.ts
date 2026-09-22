import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.css',
})
export class ProgressBar {
  readonly etiqueta = input.required<string>();
  readonly valor = input.required<number>();
  readonly total = input.required<number>();
  readonly variante = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  readonly porcentaje = computed(() => {
    const total = this.total();
    if (total <= 0) return 0;
    return Math.min(100, Math.round((this.valor() / total) * 100));
  });
}