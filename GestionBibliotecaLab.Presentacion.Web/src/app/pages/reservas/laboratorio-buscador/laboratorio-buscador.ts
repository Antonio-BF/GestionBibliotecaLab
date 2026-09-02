import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { LaboratorioService } from '../../../services/laboratorio.service';
import { Icon } from '../../../components/shared/icon/icon';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import type { LaboratorioResponse } from '../../../models/laboratorio.model';

@Component({
  selector: 'app-laboratorio-buscador',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, CoverImagen],
  templateUrl: './laboratorio-buscador.html',
  styleUrl: './laboratorio-buscador.css',
})
export class LaboratorioBuscador {
  private readonly laboratorioService = inject(LaboratorioService);

  readonly seleccionado = output<LaboratorioResponse>();

  readonly control = new FormControl('', { nonNullable: true });
  readonly resultados = signal<LaboratorioResponse[]>([]);
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
          return this.laboratorioService
            .obtenerTodos({ nombre: t, estado: 'Disponible', tamanioPagina: 5 })
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.buscando.set(false);
        this.resultados.set(resultado?.items ?? []);
      });
  }

  seleccionar(laboratorio: LaboratorioResponse): void {
    this.control.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.seHaBuscado.set(false);
    this.seleccionado.emit(laboratorio);
  }
}