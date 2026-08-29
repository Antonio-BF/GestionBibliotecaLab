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
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/libros/libro-listado/libro-listado').then((m) => m.LibroListado),
                    },
                    {
                        path: 'nuevo',
                        canActivate: [roleGuard],
                        data: { roles: SOLO_ADMINISTRADOR },
                        loadComponent: () =>
                            import('./pages/libros/libro-formulario/libro-formulario').then((m) => m.LibroFormulario),
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./pages/libros/libro-detalle/libro-detalle').then((m) => m.LibroDetalle),
                    },
                    {
                        path: ':id/editar',
                        canActivate: [roleGuard],
                        data: { roles: SOLO_ADMINISTRADOR },
                        loadComponent: () =>
                            import('./pages/libros/libro-formulario/libro-formulario').then((m) => m.LibroFormulario),
                    },
                ],
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
