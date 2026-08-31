import { Component, computed, effect, input, signal } from '@angular/core';
import { resolverUrlPortada } from '../../../core/utils/imagen.util';

@Component({
  selector: 'app-cover-imagen',
  standalone: true,
  imports: [],
  templateUrl: './cover-imagen.html',
  styleUrl: './cover-imagen.css',
})
export class CoverImagen {
  readonly portada = input<string | null>(null);
  readonly titulo = input<string>('Sin título');
  readonly tamanio = input<'sm' | 'md' | 'lg'>('md');
  readonly aspectRatio = input<string>('2 / 3');
  
  private readonly errorCarga = signal(false);

  readonly url = computed(() => (this.errorCarga() ? null : resolverUrlPortada(this.portada())));

  readonly iniciales = computed(() => {
    const palabras = this.titulo().trim().split(/\s+/).filter(Boolean);
    const letras = palabras.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
    return letras.join('') || '?';
  });

  constructor() {
    effect(() => {
      this.portada();
      this.errorCarga.set(false);
    });
  }

  onError(): void {
    this.errorCarga.set(true);
  }
}
