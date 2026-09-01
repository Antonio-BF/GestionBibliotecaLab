export type EstadoPrestamo = 'Prestado' | 'Devuelto' | 'EnMora';

export type EstadoEfectivoPrestamo = 'vigente' | 'vencido' | 'devuelto';

export interface PrestamoResponse {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  libroId: number;
  tituloLibro: string;
  isbnLibro: string;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal: string | null;
  estado: EstadoPrestamo;
}

export interface CreatePrestamoRequest {
  usuarioId: number;
  libroId: number;
  diasPlazo: number;
}

export interface RenovarPrestamoRequest {
  diasAdicionales: number;
}

export interface PrestamoFiltro {
  usuarioId?: number;
  libroId?: number;
  estado?: EstadoPrestamo;
  buscarUsuario?: string;
  buscarLibro?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  tamanioPagina?: number;
}