import { Injectable, signal } from '@angular/core';

/**
 * Estado de UI puramente visual del layout autenticado. Vive como servicio y no
 * como estado local de MainLayout
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutUiService {
  private readonly sidebarAbiertoSignal = signal(false);
  readonly sidebarAbierto = this.sidebarAbiertoSignal.asReadonly();

  alternarSidebar(): void {
    this.sidebarAbiertoSignal.update((abierto) => !abierto);
  }

  cerrarSidebar(): void {
    this.sidebarAbiertoSignal.set(false);
  }
}
