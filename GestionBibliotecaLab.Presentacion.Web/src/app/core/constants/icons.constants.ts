/**
 * Set fijo de íconos de la app, como paths de SVG (viewBox 24x24, stroke-based).
 */
export type IconName = 'editar' | 'baja' | 'reactivar' | 'ver' | 'nuevo' | 'confirmar' | 'cancelar' | 'fizquierda'
    | 'fderecha' | 'logout' | 'inicio' | 'libros' | 'laboratorios' | 'categorias' | 'prestamos' | 'reservas'
    | 'penalizaciones' | 'usuarios' | 'roles' | 'buscar' | 'ubicacion';

export const ICONOS: Record<IconName, string> = {
    editar: 'M4 20h4L18.5 9.5a2.121 2.121 0 0 0-3-3L5 17v3Z M13.5 6.5l3 3',
    baja: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6',
    reactivar: 'M4 4v6h6 M20 20v-6h-6 M4.5 15a8 8 0 0 0 14.5 3.4 M19.5 9A8 8 0 0 0 5 5.6',
    ver: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    nuevo: 'M12 5v14 M5 12h14',
    confirmar: 'M20 6 9 17l-5-5',
    cancelar: 'M18 6 6 18 M6 6l12 12',
    fizquierda: 'M15 18l-6-6 6-6',
    fderecha: 'M9 18l6-6-6-6',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
    inicio: 'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',
    libros: 'M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2V5Z M6 17h11',
    laboratorios: 'M9 3h6 M10 3v5l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3',
    categorias: 'M20 12 12.5 4.5 4 4v8.5L11.5 20a1 1 0 0 0 1.5 0L20 13.5a1 1 0 0 0 0-1.5Z M7.5 8.5h.01',
    prestamos: 'M4 7h11l-3-3 M20 17H9l3 3',
    reservas: 'M4 5h16v16H4Z M4 9h16 M8 3v4 M16 3v4',
    penalizaciones: 'M12 3 2 20h20Z M12 9v5 M12 17h.01',
    usuarios: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M2 20a6 6 0 0 1 12 0 M16 8a3 3 0 1 1 3 3 M22 20a6 6 0 0 0-5-5.9',
    roles: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z M9 12l2 2 4-4',
    buscar: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35',
    ubicacion: 'M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
};