import { EstadoLaboratorio } from '../../models/laboratorio.model';

export function claseEstadoLaboratorio(estado: EstadoLaboratorio): string {
  switch (estado) {
    case 'Disponible': return 'status-pill--activo';
    case 'Mantenimiento': return 'status-pill--mantenimiento';
    case 'Inactivo': return 'status-pill--inactivo';
  }
}