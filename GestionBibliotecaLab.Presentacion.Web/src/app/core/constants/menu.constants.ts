import { ROLES, TODOS_LOS_ROLES } from './roles.constants';
import type { MenuItem } from '../../models/menu-item.model';

/**
 * Definición del menú lateral. Cada entrada declara qué roles pueden verla
 * `enabled: false` se usa para los módulos que ya existen en la API pero cuya
 * pantalla en Angular todavía no se implementó — se muestran en el menú como
 * referencia de lo que falta, mas no navegan a ningún lado todavía.
 */
export const MENU_ITEMS: MenuItem[] = [
  { etiqueta: 'Inicio', ruta: '/dashboard', roles: TODOS_LOS_ROLES, habilitado: true },
  { etiqueta: 'Catálogo de Libros', ruta: '/libros', roles: TODOS_LOS_ROLES, habilitado: true },
  { etiqueta: 'Laboratorios', ruta: '/laboratorios', roles: TODOS_LOS_ROLES, habilitado: false },
  { etiqueta: 'Categorías', ruta: '/categorias', roles: TODOS_LOS_ROLES, habilitado: false },
  { etiqueta: 'Gestión de Préstamos', ruta: '/prestamos', roles: [ROLES.ADMINISTRADOR, ROLES.BIBLIOTECARIO], habilitado: false },
  { etiqueta: 'Mis Préstamos', ruta: '/mis-prestamos', roles: [ROLES.ESTUDIANTE, ROLES.DOCENTE], habilitado: false },
  { etiqueta: 'Gestión de Reservas', ruta: '/reservas', roles: [ROLES.ADMINISTRADOR, ROLES.BIBLIOTECARIO], habilitado: false },
  { etiqueta: 'Mis Reservas', ruta: '/mis-reservas', roles: [ROLES.ESTUDIANTE, ROLES.DOCENTE], habilitado: false },
  { etiqueta: 'Penalizaciones', ruta: '/penalizaciones', roles: [ROLES.ADMINISTRADOR, ROLES.BIBLIOTECARIO], habilitado: false },
  { etiqueta: 'Mis Penalizaciones', ruta: '/mis-penalizaciones', roles: TODOS_LOS_ROLES, habilitado: false },
  { etiqueta: 'Usuarios', ruta: '/usuarios', roles: [ROLES.ADMINISTRADOR], habilitado: false },
  { etiqueta: 'Roles', ruta: '/roles', roles: [ROLES.ADMINISTRADOR], habilitado: false },
];
