import { EstadoLaboratorio } from '../../models/laboratorio.model';
import { EstadoEfectivoPrestamo, PrestamoResponse } from '../../models/prestamo.model';

export function claseEstadoLaboratorio(estado: EstadoLaboratorio): string {
  switch (estado) {
    case 'Disponible': return 'status-pill--activo';
    case 'Mantenimiento': return 'status-pill--mantenimiento';
    case 'Inactivo': return 'status-pill--inactivo';
  }
}

export function calcularEstadoEfectivoPrestamo(prestamo: Pick<PrestamoResponse, 'estado' | 'fechaDevolucionEsperada'>): EstadoEfectivoPrestamo {
  if (prestamo.estado === 'Devuelto') return 'devuelto';
  const vencido = new Date(prestamo.fechaDevolucionEsperada).getTime() < Date.now();
  return vencido ? 'vencido' : 'vigente';
}

export function claseEstadoPrestamo(estado: EstadoEfectivoPrestamo): string {
  switch (estado) {
    case 'vigente': return 'status-pill--activo';
    case 'vencido': return 'status-pill--mora';
    case 'devuelto': return 'status-pill--info';
  }
}

export function etiquetaEstadoPrestamo(estado: EstadoEfectivoPrestamo): string {
  switch (estado) {
    case 'vigente': return 'Vigente';
    case 'vencido': return 'Vencido';
    case 'devuelto': return 'Devuelto';
  }
}