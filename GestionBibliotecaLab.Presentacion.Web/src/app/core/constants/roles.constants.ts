/** Roles del sistema */
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  BIBLIOTECARIO: 'Bibliotecario',
  ESTUDIANTE: 'Estudiante',
  DOCENTE: 'Docente',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

/** Roles con permisos de gestión */
export const ROLES_GESTION: Rol[] = [ROLES.ADMINISTRADOR, ROLES.BIBLIOTECARIO];

/** Todos los roles autenticables del sistema. */
export const TODOS_LOS_ROLES: Rol[] = [
  ROLES.ADMINISTRADOR,
  ROLES.BIBLIOTECARIO,
  ROLES.ESTUDIANTE,
  ROLES.DOCENTE,
];

export const ROLES_AUTORREGISTRO: { id: number; nombre: Rol }[] = [
  { id: 2, nombre: ROLES.ESTUDIANTE },
  { id: 3, nombre: ROLES.DOCENTE },
];