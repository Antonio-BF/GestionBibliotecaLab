export type OrigenPenalizacion = 'Prestamo' | 'ReservaLab';
export type TipoPenalizacion = 'DevolucionTardia' | 'DanioEquipo' | 'Otro';
export type EstadoPenalizacion = 'Pendiente' | 'Pagada' | 'Anulada';

export interface PenalizacionResponse {
    id: number;
    usuarioId: number;
    nombreUsuario: string;
    emailUsuario: string;
    prestamoId: number | null;
    reservaLabId: number | null;
    tipo: TipoPenalizacion;
    motivo: string;
    monto: number | null;
    fechaGeneracion: string;
    fechaResolucion: string | null;
    estado: EstadoPenalizacion;
}

export interface CreatePenalizacionRequest {
    origen: OrigenPenalizacion;
    origenId: number;
    tipo: TipoPenalizacion;
    motivo: string;
    monto?: number | null;
}

export interface PenalizacionFiltro {
    usuarioId?: number;
    buscarUsuario?: string;
    prestamoId?: number;
    reservaLabId?: number;
    origen?: OrigenPenalizacion;
    tipo?: TipoPenalizacion;
    estado?: EstadoPenalizacion;
    pagina?: number;
    tamanioPagina?: number;
}

export const TIPOS_POR_ORIGEN: Record<OrigenPenalizacion, TipoPenalizacion[]> = {
    Prestamo: ['DevolucionTardia', 'Otro'],
    ReservaLab: ['DanioEquipo', 'Otro'],
};

export const ETIQUETAS_TIPO_PENALIZACION: Record<TipoPenalizacion, string> = {
    DevolucionTardia: 'Devolución tardía',
    DanioEquipo: 'Daño de equipo',
    Otro: 'Otro',
};

export const TODOS_LOS_TIPOS_PENALIZACION: TipoPenalizacion[] = ['DevolucionTardia', 'DanioEquipo', 'Otro'];