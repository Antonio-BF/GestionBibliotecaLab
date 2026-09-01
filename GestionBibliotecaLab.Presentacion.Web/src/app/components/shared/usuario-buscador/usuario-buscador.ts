import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
import { Icon } from '../icon/icon';
import type { UsuarioResponse } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuario-buscador',
  standalone: true,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './usuario-buscador.html',
  styleUrl: './usuario-buscador.css',
})
export class UsuarioBuscador {
  private readonly usuarioService = inject(UsuarioService);

  readonly placeholder = input<string>('Busca por correo o nombre...');
  readonly seleccionado = output<UsuarioResponse>();

  readonly control = new FormControl('', { nonNullable: true });
  readonly resultados = signal<UsuarioResponse[]>([]);
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
          return this.usuarioService.obtenerTodos({ busqueda: t, tamanioPagina: 6 }).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((resultado) => {
        this.buscando.set(false);
        this.resultados.set(resultado?.items ?? []);
      });
  }

  seleccionar(usuario: UsuarioResponse): void {
    this.control.setValue('', { emitEvent: false });
    this.resultados.set([]);
    this.seHaBuscado.set(false);
    this.seleccionado.emit(usuario);
  }
}