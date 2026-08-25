import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { MENU_ITEMS } from '../../../core/constants/menu.constants';
import { LayoutUiService } from '../../../services/layout-ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  readonly layoutUi = inject(LayoutUiService);

  readonly itemsVisibles = computed(() => {
    const rol = this.authService.usuario()?.rol;
    if (!rol) return [];
    return MENU_ITEMS.filter((item) => item.roles.includes(rol));
  });

  constructor() {
    const router = inject(Router);
    router.events
      .pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.layoutUi.cerrarSidebar());
  }
}
