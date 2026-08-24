import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Alert } from './components/shared/alert/alert';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Alert],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('GestionBibliotecaLab.Presentacion.Web');
}
