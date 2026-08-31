export type EstadoLaboratorio = 'Disponible' | 'Mantenimiento' | 'Inactivo';

export interface LaboratorioResponse {
  id: number;
  nombre: string;
  capacidad: number;
  equipamiento: string | null;
  descripcion: string | null;
  imagen: string | null;
  ubicacion: string;
  estado: EstadoLaboratorio;
  rowVersion: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  isDeleted: boolean;
}

export interface CreateLaboratorioRequest {
  nombre: string;
  capacidad: number;
  equipamiento?: string | null;
  descripcion?: string | null;
  ubicacion: string;
}

export interface UpdateLaboratorioRequest {
  nombre: string;
  capacidad: number;
  equipamiento?: string | null;
  descripcion?: string | null;
  ubicacion: string;
  estado: EstadoLaboratorio;
  rowVersion: string;
}

export interface LaboratorioFiltro {
  nombre?: string;
  ubicacion?: string;
  estado?: EstadoLaboratorio;
  pagina?: number;
  tamanioPagina?: number;
}