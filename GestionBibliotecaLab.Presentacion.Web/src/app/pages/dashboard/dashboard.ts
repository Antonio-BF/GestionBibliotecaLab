import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ROLES_GESTION } from '../../core/constants/roles.constants';
import { MENU_ITEMS } from '../../core/constants/menu.constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;

  readonly esPersonalDeGestion = computed(() => {
    const rol = this.usuario()?.rol;
    return !!rol && ROLES_GESTION.includes(rol as (typeof ROLES_GESTION)[number]);
  });

  /** Módulos del sistema a modo de accesos directos, con su estado. */
  readonly modulos = computed(() => {
    const rol = this.usuario()?.rol;
    if (!rol) return [];
    return MENU_ITEMS.filter((item) => item.ruta !== '/dashboard' && item.roles.includes(rol));
  });
}
