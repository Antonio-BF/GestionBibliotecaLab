import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { UsuarioService } from '../../../services/usuario.service';
import { RolService } from '../../../services/rol.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

import { Paginador } from '../../../components/shared/paginador/paginador';
import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { RolSelect } from '../../../components/shared/rol-select/rol-select';
import { Icon } from '../../../components/shared/icon/icon';
import { UsuarioFormulario } from '../usuario-formulario/usuario-formulario';

import type { RolResponse } from '../../../models/rol.model';
import type { UsuarioFiltro, UsuarioResponse } from '../../../models/usuario.model';
import { DatePipe } from '@angular/common';
import { PageHeader } from '../../../components/shared/page-header/page-header';
import { StatusBadge } from '../../../components/shared/status-badge/status-badge';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';

const TAMANIO_PAGINA = 10;
type VistaUsuarios = 'activos' | 'eliminados';

@Component({
  selector: 'app-usuario-listado',
  standalone: true,
  imports: [ReactiveFormsModule, Paginador, ConfirmModal, ModalShell, RolSelect, UsuarioFormulario, Icon, DatePipe, PageHeader, StatusBadge, EmptyState],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.css',
})
export class UsuarioListado {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly tamanioPagina = TAMANIO_PAGINA;

  readonly cargando = signal(true);
  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly totalRegistros = signal(0);
  readonly roles = signal<RolResponse[]>([]);

  readonly rolIdFiltro = signal<number | null>(null);
  readonly paginaActual = signal(1);
  readonly vista = signal<VistaUsuarios>('activos');
  readonly usuarioParaCambiarEstado = signal<UsuarioResponse | null>(null);

  readonly modalAbierto = signal(false);
  readonly usuarioEditando = signal<UsuarioResponse | null>(null);

  private readonly refrescar = signal(0);

  readonly idUsuarioActual = computed(() => this.authService.usuario()?.id ?? null);

  readonly filtroForm = this.fb.nonNullable.group({ busqueda: '' });

  private readonly textoFiltro = toSignal(
    this.filtroForm.controls.busqueda.valueChanges.pipe(debounceTime(350)),
    { initialValue: '' }
  );

  private readonly filtroActual = computed<UsuarioFiltro>(() => ({
    busqueda: this.textoFiltro() || undefined,
    rolId: this.rolIdFiltro() ?? undefined,
    pagina: this.paginaActual(),
    tamanioPagina: this.tamanioPagina,
  }));

  private readonly consultaActual = computed(() => {
    this.refrescar();
    return { filtro: this.filtroActual(), vista: this.vista() };
  });

  constructor() {
    this.rolService.obtenerTodos().subscribe({ next: (roles) => this.roles.set(roles) });
    this.filtroForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.paginaActual.set(1));

    toObservable(this.consultaActual)
      .pipe(
        tap(() => this.cargando.set(true)),
        switchMap(({ filtro, vista }) => {
          const fuente = vista === 'eliminados'
            ? this.usuarioService.obtenerEliminados(filtro)
            : this.usuarioService.obtenerTodos(filtro);
          return fuente.pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.usuarios.set(resultado?.items ?? []);
        this.totalRegistros.set(resultado?.totalRegistros ?? 0);
        this.cargando.set(false);
      });
  }

  cambiarVista(vista: VistaUsuarios): void {
    if (this.vista() === vista) return;
    this.vista.set(vista);
    this.paginaActual.set(1);
  }

  onRolFiltroChange(rolId: number | null): void {
    this.rolIdFiltro.set(rolId);
    this.paginaActual.set(1);
  }

  esCuentaPropia(usuario: UsuarioResponse): boolean {
    return usuario.id === this.idUsuarioActual();
  }

  abrirNuevo(): void {
    this.usuarioEditando.set(null);
    this.modalAbierto.set(true);
  }

  abrirEditar(usuario: UsuarioResponse): void {
    this.usuarioEditando.set(usuario);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  onGuardado(): void {
    this.modalAbierto.set(false);
    this.refrescar.update((n) => n + 1);
  }

  solicitarCambioEstado(usuario: UsuarioResponse): void {
    this.usuarioParaCambiarEstado.set(usuario);
  }

  confirmarCambioEstado(): void {
    const usuario = this.usuarioParaCambiarEstado();
    if (!usuario) return;

    this.usuarioService.cambiarEstado(usuario.id).subscribe({
      next: () => {
        const mensaje = this.vista() === 'eliminados'
          ? `${usuario.nombres} ${usuario.apellidos} fue reactivado correctamente.`
          : `${usuario.nombres} ${usuario.apellidos} fue dado de baja correctamente.`;
        this.notificationService.mostrarExito(mensaje);

        this.usuarios.update((lista) => lista.filter((u) => u.id !== usuario.id));
        this.totalRegistros.update((total) => Math.max(0, total - 1));
        this.usuarioParaCambiarEstado.set(null);
      },
      error: () => this.usuarioParaCambiarEstado.set(null),
    });
  }

  cancelarCambioEstado(): void {
    this.usuarioParaCambiarEstado.set(null);
  }
}