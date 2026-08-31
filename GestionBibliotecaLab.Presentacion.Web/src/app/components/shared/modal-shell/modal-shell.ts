import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.css',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class ModalShell {
  readonly visible = input<boolean>(false);
  readonly titulo = input<string>('');
  readonly tamano = input<'sm' | 'md' | 'lg'>('sm');
  
  readonly cerrar = output<void>();

  onEscape(): void {
    if (this.visible()) this.cerrar.emit();
  }
}