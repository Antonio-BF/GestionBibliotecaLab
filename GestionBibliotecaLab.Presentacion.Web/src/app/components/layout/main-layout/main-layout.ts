import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

/**
 * Layout de las pantallas autenticadas: header fijo + sidebar de navegación +
 * contenido de la ruta hija activa. LoginComponent NO usa este layout (se
 * renderiza solo, fuera de header/sidebar) — ver app.routes.ts.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
