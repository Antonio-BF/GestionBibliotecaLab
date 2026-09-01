import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { LibroService } from '../../../services/libro.service';
import { Icon } from '../../../components/shared/icon/icon';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import type { LibroResponse } from '../../../models/libro.model';

@Component({
  selector: 'app-libro-buscador',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, CoverImagen],
  templateUrl: './libro-buscador.html',
  styleUrl: './libro-buscador.css',
})
export class LibroBuscador {
  private readonly libroService = inject(LibroService);

  readonly seleccionado = output<LibroResponse>();

  readonly control = new FormControl('', { nonNullable: true });
  readonly resultados = signal<LibroResponse[]>([]);
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
            this.libroService.obtenerTodos({ titulo: t, tamanioPagina: 5 }).pipe(catchError(() => of(null))),
            this.libroService.obtenerTodos({ isbn: t, tamanioPagina: 5 }).pipe(catchError(() => of(null))),
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
        const [porTitulo, porIsbn] = resultado;
        const mapa = new Map<number, LibroResponse>();
        (porTitulo?.items ?? []).forEach((l) => mapa.set(l.id, l));
        (porIsbn?.items ?? []).forEach((l) => mapa.set(l.id, l));
        this.resultados.set([...mapa.values()]);
      });
  }

  puedeSeleccionar(libro: LibroResponse): boolean {
    return libro.estado === 'Activo' && libro.cantidadDisponible > 0;
  }

  seleccionar(libro: LibroResponse): void {
    if (!this.puedeSeleccionar(libro)) return;
    this.control.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.seHaBuscado.set(false);
    this.seleccionado.emit(libro);
  }
}