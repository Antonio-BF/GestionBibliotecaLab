/**
 * Paths de navegación interna de Angular (distintos de los endpoints de la API).
 */
export const APP_ROUTES = {
  LOGIN: '/login',
  REGISTRO: '/registro',
  DASHBOARD: '/dashboard',
  UNAUTHORIZED: '/unauthorized',
  LIBROS: '/libros',
  LABORATORIOS: '/laboratorios',
  PRESTAMOS: '/prestamos',
  RESERVAS: '/reservas',
  PENALIZACIONES: '/penalizaciones',
  MIS_PENALIZACIONES: '/mis-penalizaciones',
  MIS_PRESTAMOS: '/mis-prestamos',
  MIS_RESERVAS: '/mis-reservas',
  CATEGORIAS: '/categorias',
  ROLES: '/roles',
  USUARIOS: '/usuarios',
} as const;