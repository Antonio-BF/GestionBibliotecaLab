import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';

/**
 * Banner global de notificaciones (error / éxito / info). Se monta una sola
 * vez en el AppComponent raíz y reacciona al signal de NotificationService,
 * así cualquier servicio puede reportar un mensaje sin acoplarse a ningún componente en particular.
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  private readonly notificationService = inject(NotificationService);

  readonly notificacion = this.notificationService.notificacion;

  cerrar(): void {
    this.notificationService.cerrar();
  }
}
