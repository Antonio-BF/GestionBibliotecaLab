import { API_ORIGIN } from "../constants/api-endpoints.constants";

/**
 * Las rutas de imagen que devuelve el backend (Libro.Portada, Laboratorio.Imagen)
 */
export function resolverUrlPortada(rutaRelativa: string | null): string | null {
  if (!rutaRelativa) return null;
  return `${API_ORIGIN}${rutaRelativa}`;
}

export const EXTENSIONES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp'];
export const TAMANIO_MAXIMO_BYTES = 3 * 1024 * 1024;