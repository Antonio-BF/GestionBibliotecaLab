import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { LayoutUiService } from '../../../services/layout-ui.service';

/**
 * Layout de las pantallas autenticadas: header fijo + sidebar de navegación +
 * contenido de la ruta hija activa. 
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  readonly layoutUi = inject(LayoutUiService);
}
