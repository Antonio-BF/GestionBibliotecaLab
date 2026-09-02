export const API_ORIGIN = 'https://localhost:7015';
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTRO: `${API_BASE_URL}/auth/registro`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  LIBROS: {
    BASE: `${API_BASE_URL}/libro`,
    POR_ID: (id: number) => `${API_BASE_URL}/libro/${id}`,
    PORTADA: (id: number) => `${API_BASE_URL}/libro/${id}/portada`,
    ESTADO: (id: number) => `${API_BASE_URL}/libro/${id}/estado`,
    ELIMINADOS: `${API_BASE_URL}/libro/eliminados`,
  },
  LABORATORIOS: {
    BASE: `${API_BASE_URL}/laboratorio`,
    POR_ID: (id: number) => `${API_BASE_URL}/laboratorio/${id}`,
    IMAGEN: (id: number) => `${API_BASE_URL}/laboratorio/${id}/imagen`,
    ESTADO: (id: number) => `${API_BASE_URL}/laboratorio/${id}/estado`,
    ELIMINADOS: `${API_BASE_URL}/laboratorio/eliminados`,
  },
  CATEGORIAS: {
    BASE: `${API_BASE_URL}/categoria`,
    POR_ID: (id: number) => `${API_BASE_URL}/categoria/${id}`,
  },
  PRESTAMOS: {
    BASE: `${API_BASE_URL}/prestamo`,
    POR_ID: (id: number) => `${API_BASE_URL}/prestamo/${id}`,
    MIS_PRESTAMOS: `${API_BASE_URL}/prestamo/mis-prestamos`,
    DEVOLUCION: (id: number) => `${API_BASE_URL}/prestamo/${id}/devolucion`,
    RENOVACION: (id: number) => `${API_BASE_URL}/prestamo/${id}/renovacion`,
  },
  RESERVAS: {
    BASE: `${API_BASE_URL}/reserva`,
    POR_ID: (id: number) => `${API_BASE_URL}/reserva/${id}`,
    MIS_RESERVAS: `${API_BASE_URL}/reserva/mis-reservas`,
    DISPONIBILIDAD: `${API_BASE_URL}/reserva/disponibilidad`,
    CONFIRMACION: (id: number) => `${API_BASE_URL}/reserva/${id}/confirmacion`,
    CANCELACION: (id: number) => `${API_BASE_URL}/reserva/${id}/cancelacion`,
  },
  PENALIZACIONES: {
    BASE: `${API_BASE_URL}/penalizacion`,
    POR_ID: (id: number) => `${API_BASE_URL}/penalizacion/${id}`,
    MIS_PENALIZACIONES: `${API_BASE_URL}/penalizacion/mis-penalizaciones`,
    POR_PRESTAMO: (prestamoId: number) => `${API_BASE_URL}/penalizacion/por-prestamo/${prestamoId}`,
    POR_RESERVA: (reservaLabId: number) => `${API_BASE_URL}/penalizacion/por-reserva/${reservaLabId}`,
    PAGO: (id: number) => `${API_BASE_URL}/penalizacion/${id}/pago`,
    ANULACION: (id: number) => `${API_BASE_URL}/penalizacion/${id}/anulacion`,
  },
  USUARIOS: {
    BASE: `${API_BASE_URL}/usuario`,
    POR_ID: (id: number) => `${API_BASE_URL}/usuario/${id}`,
    ESTADO: (id: number) => `${API_BASE_URL}/usuario/${id}/estado`,
    ELIMINADOS: `${API_BASE_URL}/usuario/eliminados`,
  },
  ROLES: {
    BASE: `${API_BASE_URL}/rol`,
    POR_ID: (id: number) => `${API_BASE_URL}/rol/${id}`,
  },
} as const;

/** Endpoints públicos (no requieren Authorization header ni pasan por el refresh-on-401). */
export const ENDPOINTS_PUBLICOS: string[] = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTRO,
  API_ENDPOINTS.AUTH.REFRESH,
];
