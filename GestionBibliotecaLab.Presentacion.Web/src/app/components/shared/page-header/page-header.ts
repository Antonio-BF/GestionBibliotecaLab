import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly eyebrow = input<string | null>(null);
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
}