export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Finalizada';

export interface ReservaResponse {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  laboratorioId: number;
  nombreLaboratorio: string;
  fecha: string; // DateOnly -> "yyyy-MM-dd"
  horaInicio: string; // TimeOnly -> "HH:mm:ss"
  horaFin: string; // TimeOnly -> "HH:mm:ss"
  estado: EstadoReserva;
}

export interface CreateReservaRequest {
  usuarioId: number;
  laboratorioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface ReservaFiltro {
  usuarioId?: number;
  laboratorioId?: number;
  buscarUsuario?: string;
  buscarLaboratorio?: string;
  estado?: EstadoReserva;
  fecha?: string;
  pagina?: number;
  tamanioPagina?: number;
}