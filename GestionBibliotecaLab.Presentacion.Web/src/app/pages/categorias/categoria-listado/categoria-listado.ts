import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { SOLO_ADMINISTRADOR } from '../../../core/constants/roles.constants';

import { ConfirmModal } from '../../../components/shared/confirm-modal/confirm-modal';
import { ModalShell } from '../../../components/shared/modal-shell/modal-shell';
import { Icon } from '../../../components/shared/icon/icon';
import { CategoriaFormulario } from '../categoria-formulario/categoria-formulario';

import type { CategoriaResponse } from '../../../models/categoria.model';
import { crearTextoFiltrado } from '../../../core/utils/filtro-texto.util';
import { PageHeader } from '../../../components/shared/page-header/page-header';
import { EmptyState } from '../../../components/shared/empty-state/empty-state';

@Component({
  selector: 'app-categoria-listado',
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmModal, ModalShell, CategoriaFormulario, Icon, PageHeader, EmptyState],
  templateUrl: './categoria-listado.html',
  styleUrl: './categoria-listado.css',
})
export class CategoriaListado {
  private readonly categoriaService = inject(CategoriaService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly cargando = signal(true);
  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly categoriaParaEliminar = signal<CategoriaResponse | null>(null);

  readonly modalAbierto = signal(false);
  readonly categoriaEditando = signal<CategoriaResponse | null>(null);

  readonly puedeGestionar = computed(() => this.authService.tieneAlgunRol(...SOLO_ADMINISTRADOR));

  readonly filtroForm = this.fb.nonNullable.group({ busqueda: '' });

  private readonly textoFiltro = crearTextoFiltrado(this.filtroForm.controls.busqueda);

  readonly categoriasFiltradas = computed(() => {
    const texto = this.textoFiltro().trim().toLowerCase();
    if (!texto) return this.categorias();
    return this.categorias().filter(
      (c) => c.nombre.toLowerCase().includes(texto) || (c.descripcion ?? '').toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargarCategorias();
  }

  abrirNuevo(): void {
    this.categoriaEditando.set(null);
    this.modalAbierto.set(true);
  }

  abrirEditar(categoria: CategoriaResponse): void {
    this.categoriaEditando.set(categoria);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  onGuardado(): void {
    this.modalAbierto.set(false);
    this.cargarCategorias();
  }

  solicitarEliminar(categoria: CategoriaResponse): void {
    this.categoriaParaEliminar.set(categoria);
  }

  confirmarEliminar(): void {
    const categoria = this.categoriaParaEliminar();
    if (!categoria) return;

    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`"${categoria.nombre}" fue eliminada correctamente.`);
        this.categorias.update((lista) => lista.filter((c) => c.id !== categoria.id));
        this.categoriaParaEliminar.set(null);
      },
      error: () => this.categoriaParaEliminar.set(null),
    });
  }

  cancelarEliminar(): void {
    this.categoriaParaEliminar.set(null);
  }

  private cargarCategorias(): void {
    this.cargando.set(true);
    this.categoriaService.obtenerTodas().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}