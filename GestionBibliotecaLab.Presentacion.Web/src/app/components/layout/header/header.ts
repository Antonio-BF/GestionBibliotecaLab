import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LayoutUiService } from '../../../services/layout-ui.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports:[Icon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authService = inject(AuthService);
  readonly layoutUi = inject(LayoutUiService);

  readonly usuario = this.authService.usuario;

  cerrarSesion(): void {
    this.authService.logout();
  }

  obtenerIniciales(): string {
    const usuario = this.usuario();
    if (!usuario) return '';
    const inicialNombre = usuario.nombres?.charAt(0) ?? '';
    const inicialApellido = usuario.apellidos?.charAt(0) ?? '';
    return `${inicialNombre}${inicialApellido}`.toUpperCase();
  }
}
