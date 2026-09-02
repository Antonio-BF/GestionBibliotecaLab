import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { ReservaService } from '../../../services/reserva.service';
import { Icon } from '../../../components/shared/icon/icon';
import type { ReservaResponse } from '../../../models/reserva.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reserva-penalizable-buscador',
  standalone: true,
  imports: [ReactiveFormsModule, Icon, DatePipe],
  templateUrl: './reserva-penalizable-buscador.html',
  styleUrl: './reserva-penalizable-buscador.css',
})
export class ReservaPenalizableBuscador {
  private readonly reservaService = inject(ReservaService);

  readonly seleccionado = output<ReservaResponse>();

  readonly control = new FormControl('', { nonNullable: true });
  readonly resultados = signal<ReservaResponse[]>([]);
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
            this.reservaService.obtenerTodos({ buscarUsuario: t, estado: 'Confirmada', tamanioPagina: 5 }).pipe(catchError(() => of(null))),
            this.reservaService.obtenerTodos({ buscarUsuario: t, estado: 'Finalizada', tamanioPagina: 5 }).pipe(catchError(() => of(null))),
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
        const [confirmadas, finalizadas] = resultado;
        const mapa = new Map<number, ReservaResponse>();
        (confirmadas?.items ?? []).forEach((r) => mapa.set(r.id, r));
        (finalizadas?.items ?? []).forEach((r) => mapa.set(r.id, r));
        this.resultados.set([...mapa.values()]);
      });
  }

  seleccionar(reserva: ReservaResponse): void {
    this.control.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.seHaBuscado.set(false);
    this.seleccionado.emit(reserva);
  }
}