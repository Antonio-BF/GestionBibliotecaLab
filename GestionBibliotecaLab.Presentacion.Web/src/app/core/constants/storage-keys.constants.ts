/**
 * Claves usadas en localStorage. Centralizadas para no hardcodear strings
 * repetidos entre TokenStorageService y el resto de la app.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gbl_access_token',
  REFRESH_TOKEN: 'gbl_refresh_token',
  USUARIO: 'gbl_usuario',
} as const;
