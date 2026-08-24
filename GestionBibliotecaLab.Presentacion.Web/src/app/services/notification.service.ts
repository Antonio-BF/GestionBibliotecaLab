import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'error' | 'exito' | 'info';

export interface Notificacion {
  tipo: TipoNotificacion;
  texto: string;
}

/**
 * Servicio utilitario simple para mostrar mensajes globales (banner en
 * AppComponent). Se usa desde errorInterceptor para reportar errores de API
 * y puede reutilizarse desde cualquier componente para confirmaciones.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificacionSignal = signal<Notificacion | null>(null);
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  readonly notificacion = this.notificacionSignal.asReadonly();

  mostrarError(texto: string): void {
    this.mostrar({ tipo: 'error', texto });
  }

  mostrarExito(texto: string): void {
    this.mostrar({ tipo: 'exito', texto });
  }

  mostrarInfo(texto: string): void {
    this.mostrar({ tipo: 'info', texto });
  }

  cerrar(): void {
    this.notificacionSignal.set(null);
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  private mostrar(notificacion: Notificacion): void {
    this.notificacionSignal.set(notificacion);
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.cerrar(), 6000);
  }
}
