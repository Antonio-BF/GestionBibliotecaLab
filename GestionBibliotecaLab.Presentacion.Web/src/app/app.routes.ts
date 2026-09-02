import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES_GESTION, SOLO_ADMINISTRADOR } from './core/constants/roles.constants';

/**
 * Rutas de la aplicación.
 */
export const routes: Routes = [
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    },
    {
        path: 'registro',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
    },
    {
        path: '',
        loadComponent: () => import('./components/layout/main-layout/main-layout').then((m) => m.MainLayout),
        canActivate: [authGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
            },
            {
                path: 'unauthorized',
                loadComponent: () => import('./pages/unauthorized/unauthorized').then((m) => m.Unauthorized),
            },
            {
                path: 'libros',
                loadComponent: () => import('./pages/libros/libro-listado/libro-listado').then((m) => m.LibroListado),
            },
            {
                path: 'laboratorios',
                loadComponent: () => import('./pages/laboratorio/laboratorio-listado/laboratorio-listado').then((m) => m.LaboratorioListado),
            },
            {
                path: 'prestamos',
                canActivate: [roleGuard],
                data: { roles: ROLES_GESTION },
                loadComponent: () =>
                    import('./pages/prestamos/prestamo-listado/prestamo-listado').then((m) => m.PrestamoListado),
            },
            {
                path: 'reservas',
                canActivate: [roleGuard],
                data: { roles: ROLES_GESTION },
                loadComponent: () =>
                    import('./pages/reservas/reserva-listado/reserva-listado').then((m) => m.ReservaListado),
            },
            {
                path: 'penalizaciones',
                canActivate: [roleGuard],
                data: { roles: ROLES_GESTION },
                loadComponent: () =>
                    import('./pages/penalizaciones/penalizacion-listado/penalizacion-listado').then((m) => m.PenalizacionListado),
            },
            {
                path: 'mis-penalizaciones',
                loadComponent: () =>
                    import('./pages/mis-penalizaciones/mis-penalizaciones').then((m) => m.MisPenalizaciones),
            },
            {
                path: 'mis-reservas',
                loadComponent: () =>
                    import('./pages/mis-reservas/mis-reservas').then((m) => m.MisReservas),
            },
            {
                path: 'mis-prestamos',
                loadComponent: () =>
                    import('./pages/mis-prestamos/mis-prestamos').then((m) => m.MisPrestamos),
            },
            {
                path: 'categorias',
                loadComponent: () =>
                    import('./pages/categorias/categoria-listado/categoria-listado').then((m) => m.CategoriaListado),
            },
            {
                path: 'roles',
                canActivate: [roleGuard],
                data: { roles: SOLO_ADMINISTRADOR },
                loadComponent: () => import('./pages/roles/rol-listado/rol-listado').then((m) => m.RolListado),
            },
            {
                path: 'usuarios',
                canActivate: [roleGuard],
                data: { roles: SOLO_ADMINISTRADOR },
                loadComponent: () =>
                    import('./pages/usuarios/usuario-listado/usuario-listado').then((m) => m.UsuarioListado),
            },
        ],
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    },

];