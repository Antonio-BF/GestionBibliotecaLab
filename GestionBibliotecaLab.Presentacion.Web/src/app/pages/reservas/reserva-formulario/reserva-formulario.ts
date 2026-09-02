import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ReservaService } from '../../../services/reserva.service';
import { NotificationService } from '../../../services/notification.service';
import { UsuarioBuscador } from '../../../components/shared/usuario-buscador/usuario-buscador';
import { LaboratorioBuscador } from '../laboratorio-buscador/laboratorio-buscador';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { Icon } from '../../../components/shared/icon/icon';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';

import type { UsuarioResponse } from '../../../models/usuario.model';
import type { LaboratorioResponse } from '../../../models/laboratorio.model';
import type { CreateReservaRequest } from '../../../models/reserva.model';
import type { ApiError } from '../../../models/api-error.model';

function generarBloquesHorario(): string[] {
  const bloques: string[] = [];
  for (let h = 9; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m === 30) continue;
      bloques.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return bloques;
}

const BLOQUES_HORARIO = generarBloquesHorario();

function fechaHoyIso(): string {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const d = hoy.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-reserva-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, UsuarioBuscador, LaboratorioBuscador, CoverImagen, Icon, FichaDetalle],
  templateUrl: './reserva-formulario.html',
  styleUrl: './reserva-formulario.css',
})
export class ReservaFormulario {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly notificationService = inject(NotificationService);

  readonly guardado = output<void>();
  readonly cerrar = output<void>();

  readonly fechaMinima = fechaHoyIso();
  readonly opcionesHoraInicio = BLOQUES_HORARIO.slice(0, -1);

  readonly guardando = signal(false);
  readonly verificando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly disponible = signal<boolean | null>(null);

  readonly usuarioSeleccionado = signal<UsuarioResponse | null>(null);
  readonly laboratorioSeleccionado = signal<LaboratorioResponse | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    fecha: [this.fechaMinima, [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
  });

  get controles() {
    return this.formulario.controls;
  }

  private readonly valoresFormulario = toSignal(this.formulario.valueChanges, {
    initialValue: this.formulario.getRawValue(),
  });

  readonly opcionesHoraFin = computed(() => {
    const inicio = this.valoresFormulario().horaInicio;
    if (!inicio) return BLOQUES_HORARIO.slice(1);
    return BLOQUES_HORARIO.filter((bloque) => bloque > inicio);
  });

  readonly listoParaVerificar = computed(() => {
    const valores = this.valoresFormulario();
    return !!this.laboratorioSeleccionado() && !!valores.fecha && !!valores.horaInicio && !!valores.horaFin
      && valores.horaFin > valores.horaInicio;
  });

  readonly listoParaResumen = computed(() =>
    !!this.usuarioSeleccionado() && !!this.laboratorioSeleccionado() && this.disponible() === true
  );

  readonly resumenItems = computed<FichaItem[]>(() => {
    const u = this.usuarioSeleccionado();
    const l = this.laboratorioSeleccionado();
    const valores = this.valoresFormulario();
    if (!u || !l) return [];
    return [
      { etiqueta: 'Usuario', valor: `${u.nombres} ${u.apellidos} (${u.email})` },
      { etiqueta: 'Laboratorio', valor: `${l.nombre} — ${l.ubicacion}` },
      { etiqueta: 'Fecha', valor: valores.fecha! },
      { etiqueta: 'Horario', valor: `${valores.horaInicio} — ${valores.horaFin}` },
    ];
  });

  constructor() {
    this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.disponible.set(null));

    this.formulario.controls.horaInicio.valueChanges.pipe(takeUntilDestroyed()).subscribe((valor) => {
      const fin = this.controles.horaFin.value;
      if (fin && valor && fin <= valor) {
        this.controles.horaFin.setValue('', { emitEvent: false });
      }
    });
  }

  onUsuarioSeleccionado(usuario: UsuarioResponse): void {
    this.usuarioSeleccionado.set(usuario);
    this.errorServidor.set(null);
  }
  quitarUsuario(): void {
    this.usuarioSeleccionado.set(null);
  }

  onLaboratorioSeleccionado(laboratorio: LaboratorioResponse): void {
    this.laboratorioSeleccionado.set(laboratorio);
    this.errorServidor.set(null);
    this.disponible.set(null);
  }
  quitarLaboratorio(): void {
    this.laboratorioSeleccionado.set(null);
    this.disponible.set(null);
  }

  verificarDisponibilidad(): void {
    const laboratorio = this.laboratorioSeleccionado();
    const valores = this.formulario.getRawValue();
    if (!laboratorio || !valores.fecha || !valores.horaInicio || !valores.horaFin) return;

    this.verificando.set(true);
    this.disponible.set(null);

    this.reservaService
      .verificarDisponibilidad(laboratorio.id, valores.fecha, `${valores.horaInicio}:00`, `${valores.horaFin}:00`)
      .pipe(finalize(() => this.verificando.set(false)))
      .subscribe({
        next: (resultado) => this.disponible.set(resultado),
        error: () => this.disponible.set(false),
      });
  }

  guardar(): void {
    const usuario = this.usuarioSeleccionado();
    const laboratorio = this.laboratorioSeleccionado();

    if (!usuario) {
      this.errorServidor.set('Selecciona el usuario que hará la reserva.');
      return;
    }
    if (!laboratorio) {
      this.errorServidor.set('Selecciona un laboratorio.');
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    if (this.disponible() !== true) {
      this.errorServidor.set('Verifica la disponibilidad del laboratorio antes de registrar la reserva.');
      return;
    }

    this.errorServidor.set(null);
    this.guardando.set(true);

    const valores = this.formulario.getRawValue();
    const request: CreateReservaRequest = {
      usuarioId: usuario.id,
      laboratorioId: laboratorio.id,
      fecha: valores.fecha,
      horaInicio: `${valores.horaInicio}:00`,
      horaFin: `${valores.horaFin}:00`,
    };

    this.reservaService
      .registrar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Reserva registrada correctamente.');
          this.guardado.emit();
        },
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }
}