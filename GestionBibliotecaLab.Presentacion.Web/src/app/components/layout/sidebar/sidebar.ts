import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MENU_ITEMS } from '../../../core/constants/menu.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  /** Ítems del menú visibles para el rol del usuario autenticado. */
  readonly itemsVisibles = computed(() => {
    const rol = this.authService.usuario()?.rol;
    if (!rol) return [];
    return MENU_ITEMS.filter((item) => item.roles.includes(rol));
  });
}
