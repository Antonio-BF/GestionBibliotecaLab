import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

import { RolService } from '../../../services/rol.service';
import { NotificationService } from '../../../services/notification.service';
import { ROLES_SISTEMA_PROTEGIDOS } from '../../../core/constants/roles.constants';

import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { Icon } from '../../../components/shared/icon/icon';
import { RolFormulario } from '../rol-formulario/rol-formulario';

import type { RolResponse } from '../../../models/rol.model';
import { TitleCasePipe } from '@angular/common';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';
import { PageHeader } from '../../../components/shared/page-header/page-header';

@Component({
  selector: 'app-rol-listado',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmModal, ModalShell, RolFormulario, Icon, TitleCasePipe, EmptyState, PageHeader],
  templateUrl: './rol-listado.html',
  styleUrl: './rol-listado.css',
})
export class RolListado {
  private readonly rolService = inject(RolService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly cargando = signal(true);
  readonly roles = signal<RolResponse[]>([]);
  readonly rolParaEliminar = signal<RolResponse | null>(null);

  readonly modalAbierto = signal(false);
  readonly rolEditando = signal<RolResponse | null>(null);

  readonly filtroForm = this.fb.nonNullable.group({ busqueda: '' });

  private readonly textoFiltro = toSignal(
    this.filtroForm.controls.busqueda.valueChanges.pipe(debounceTime(250)),
    { initialValue: '' }
  );

  readonly rolesFiltrados = computed(() => {
    const texto = this.textoFiltro().trim().toLowerCase();
    if (!texto) return this.roles();
    return this.roles().filter(
      (r) => r.nombre.toLowerCase().includes(texto) || (r.descripcion ?? '').toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargarRoles();
  }

  esRolProtegido(rol: RolResponse): boolean {
    return ROLES_SISTEMA_PROTEGIDOS.some((nombre) => nombre.toLowerCase() === rol.nombre.toLowerCase());
  }

  abrirNuevo(): void {
    this.rolEditando.set(null);
    this.modalAbierto.set(true);
  }

  abrirEditar(rol: RolResponse): void {
    this.rolEditando.set(rol);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  onGuardado(): void {
    this.modalAbierto.set(false);
    this.cargarRoles();
  }

  solicitarEliminar(rol: RolResponse): void {
    this.rolParaEliminar.set(rol);
  }

  confirmarEliminar(): void {
    const rol = this.rolParaEliminar();
    if (!rol) return;

    this.rolService.eliminar(rol.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`El rol "${rol.nombre}" fue eliminado correctamente.`);
        this.roles.update((lista) => lista.filter((r) => r.id !== rol.id));
        this.rolParaEliminar.set(null);
      },
      error: () => this.rolParaEliminar.set(null),
    });
  }

  cancelarEliminar(): void {
    this.rolParaEliminar.set(null);
  }

  private cargarRoles(): void {
    this.cargando.set(true);
    this.rolService.obtenerTodos().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}