/**
 * Datos del usuario autenticado que la app mantiene en memoria/localStorage.
 * `id` y `email` se obtienen decodificando el access token (el backend no los
 * expone en el body de AuthResponse); `nombres`/`apellidos`/`rol` sí vienen
 * directamente en AuthResponse.
 */
export interface UsuarioAutenticado {
  id: number | null;
  nombres: string;
  apellidos: string;
  email: string | null;
  rol: string;
}
