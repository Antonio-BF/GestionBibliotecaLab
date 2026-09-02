import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { PrestamoService } from '../../../services/prestamo.service';
import { Icon } from '../../../components/shared/icon/icon';
import type { PrestamoResponse } from '../../../models/prestamo.model';

@Component({
  selector: 'app-prestamo-penalizable-buscador',
  standalone: true,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './prestamo-penalizable-buscador.html',
  styleUrl: './prestamo-penalizable-buscador.css',
})
export class PrestamoPenalizableBuscador {
  private readonly prestamoService = inject(PrestamoService);

  readonly seleccionado = output<PrestamoResponse>();

  readonly control = new FormControl('', { nonNullable: true });
  readonly resultados = signal<PrestamoResponse[]>([]);
  readonly buscando = signal(false);
  readonly seHaBuscado = signal(false);

  constructor() {
    this.control.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((texto) => {
          const t = texto.trim();
          if (t.length < 2) {
            this.buscando.set(false);
            this.seHaBuscado.set(false);
            return of(null);
          }
          this.buscando.set(true);
          this.seHaBuscado.set(true);
          return forkJoin([
            this.prestamoService.obtenerTodos({ buscarUsuario: t, estado: 'Devuelto', tamanioPagina: 5 }).pipe(catchError(() => of(null))),
            this.prestamoService.obtenerTodos({ buscarUsuario: t, estado: 'EnMora', tamanioPagina: 5 }).pipe(catchError(() => of(null))),
          ]);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.buscando.set(false);
        if (!resultado) {
          this.resultados.set([]);
          return;
        }
        const [devueltos, enMora] = resultado;
        const mapa = new Map<number, PrestamoResponse>();
        (devueltos?.items ?? []).forEach((p) => mapa.set(p.id, p));
        (enMora?.items ?? []).forEach((p) => mapa.set(p.id, p));
        this.resultados.set([...mapa.values()]);
      });
  }

  seleccionar(prestamo: PrestamoResponse): void {
    this.control.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.seHaBuscado.set(false);
    this.seleccionado.emit(prestamo);
  }
}