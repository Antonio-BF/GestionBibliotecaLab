import { Component, computed, input } from '@angular/core';

export interface RankingItem {
  nombre: string;
  valor: number;
}

@Component({
  selector: 'app-ranking-list',
  standalone: true,
  templateUrl: './ranking-list.html',
  styleUrl: './ranking-list.css',
})
export class RankingList {
  readonly items = input.required<RankingItem[]>();
  readonly etiquetaValor = input<string>('');

  readonly maximo = computed(() => Math.max(1, ...this.items().map((i) => i.valor)));
}