import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  host: { '(document:keydown.escape)': 'onEscape()' },

})
export class ConfirmModal {
  readonly visible = input<boolean>(false);
  readonly titulo = input<string>('Confirmar acción');
  readonly mensaje = input<string>('¿Estás seguro de continuar?');
  readonly textoConfirmar = input<string>('Confirmar');
  readonly textoCancelar = input<string>('Cancelar');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  onEscape(): void {
    if (this.visible()) this.cancelar.emit();
  }
}
