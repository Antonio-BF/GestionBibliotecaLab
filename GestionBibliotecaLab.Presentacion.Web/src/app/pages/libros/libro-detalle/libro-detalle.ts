import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoverImagen } from '../../../components/shared/cover-imagen/cover-imagen';
import { FichaDetalle, FichaItem } from '../../../components/shared/ficha-detalle/ficha-detalle';
import { LibroService } from '../../../services/libro.service';
import { AuthService } from '../../../services/auth.service';
import { APP_ROUTES } from '../../../core/constants/app-routes.constants';
import { LibroResponse } from '../../../models/libro.model';
import { ROLES_GESTION } from '../../../core/constants/roles.constants';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [RouterLink, CoverImagen, FichaDetalle],
  templateUrl: './libro-detalle.html',
  styleUrl: './libro-detalle.css',
})
export class LibroDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly libroService = inject(LibroService);
  private readonly authService = inject(AuthService);

  readonly appRoutes = APP_ROUTES;
  readonly cargando = signal(true);
  readonly libro = signal<LibroResponse | null>(null);

  readonly puedeGestionar = computed(() => this.authService.tieneAlgunRol(...ROLES_GESTION));

  readonly ficha = computed<FichaItem[]>(() => {
    const libro = this.libro();
    if (!libro) return [];
    return [
      { etiqueta: 'Autor', valor: libro.autor },
      { etiqueta: 'ISBN', valor: libro.isbn },
      { etiqueta: 'Editorial', valor: libro.editorial ?? 'No especificada' },
      { etiqueta: 'Año de publicación', valor: libro.anioPublicacion ? String(libro.anioPublicacion) : 'No especificado' },
      { etiqueta: 'Categoría', valor: libro.nombreCategoria ?? 'Sin categoría' },
      { etiqueta: 'Disponibilidad', valor: `${libro.cantidadDisponible} de ${libro.cantidadTotal} ejemplares` },
    ];
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigateByUrl(this.appRoutes.LIBROS);
      return;
    }

    this.libroService.obtenerPorId(id).subscribe({
      next: (libro) => {
        this.libro.set(libro);
        this.cargando.set(false);
      },
      error: () => this.router.navigateByUrl(this.appRoutes.LIBROS),
    });
  }
}