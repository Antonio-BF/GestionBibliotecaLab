import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { APP_ROUTES } from '../../core/constants/app-routes.constants';
import { ApiError } from '../../models/api-error.model';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly appRoutes = APP_ROUTES;
  readonly cargando = signal(false);
  readonly errorServidor = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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
      .login(this.formulario.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigateByUrl(returnUrl || APP_ROUTES.DASHBOARD);
        },
        error: (error: ApiError) => {
          this.errorServidor.set(
            error.status === 401
              ? 'Email o contraseña incorrectos.'
              : error.message
          );
        },
      });
  }
}
