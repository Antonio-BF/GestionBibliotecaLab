import { Component, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-paginador',
  standalone: true,
  imports: [Icon],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {
  readonly total = input.required<number>();
  readonly tamanioPagina = input<number>(10);
  readonly paginaActual = model<number>(1);

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanioPagina())));

  irAPagina(pagina: number): void {
    this.paginaActual.set(Math.min(Math.max(1, pagina), this.totalPaginas()));
  }

  anterior(): void {
    this.irAPagina(this.paginaActual() - 1);
  }

  siguiente(): void {
    this.irAPagina(this.paginaActual() + 1);
  }
}
