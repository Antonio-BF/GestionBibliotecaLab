export type EstadoLibro = 'Activo' | 'Descontinuado';

/** Espejo de LibroResponse (Aplicacion.Dtos.Libro). */
export interface LibroResponse {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string | null;
  anioPublicacion: number | null;
  categoriaId: number | null;
  nombreCategoria: string | null;
  descripcion: string | null;
  portada: string | null;
  cantidadTotal: number;
  cantidadDisponible: number;
  estado: EstadoLibro;
  rowVersion: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  isDeleted: boolean;
}

export interface CreateLibroRequest {
  titulo: string;
  autor: string;
  isbn: string;
  editorial?: string | null;
  anioPublicacion?: number | null;
  categoriaId?: number | null;
  descripcion?: string | null;
  cantidadTotal: number;
}

/** RowVersion viaja en Base64 */
export interface UpdateLibroRequest {
  titulo: string;
  autor: string;
  isbn: string;
  editorial?: string | null;
  anioPublicacion?: number | null;
  categoriaId?: number | null;
  descripcion?: string | null;
  cantidadTotal: number;
  estado: EstadoLibro;
  rowVersion: string;
}

export interface LibroFiltro {
  titulo?: string;
  autor?: string;
  isbn?: string;
  anioPublicacion?: number;
  categoriaId?: number;
  estado?: EstadoLibro;
  pagina?: number;
  tamanioPagina?: number;
}