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

export interface UsuarioResponse {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rolId: number;
  nombreRol: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  isDeleted: boolean;
}

export interface CreateUsuarioRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rolId: number;
}

export interface UpdateUsuarioRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password?: string | null;
  rolId: number;
}

export interface UsuarioFiltro {
  busqueda?: string;
  rolId?: number;
  pagina?: number;
  tamanioPagina?: number;
}