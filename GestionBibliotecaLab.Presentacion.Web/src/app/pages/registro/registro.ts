import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../../core/constants/app-routes.constants';
import { ROLES_AUTORREGISTRO } from '../../core/constants/roles.constants';
import { ApiError } from '../../models/api-error.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly appRoutes = APP_ROUTES;
  readonly rolesDisponibles = ROLES_AUTORREGISTRO;

  readonly cargando = signal(false);
  readonly errorServidor = signal<string | null>(null);

  // Mismas reglas que RegistroRequest en el backend (Data Annotations).
  readonly formulario = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)],
    ],
    rolId: [this.rolesDisponibles[0].id, [Validators.required]],
  });

  get controles() {
    return this.formulario.controls;
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorServidor.set(null);
    this.cargando.set(true);

    this.authService
      .registrar(this.formulario.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.appRoutes.DASHBOARD),
        error: (error: ApiError) => this.errorServidor.set(error.message),
      });
  }

}
