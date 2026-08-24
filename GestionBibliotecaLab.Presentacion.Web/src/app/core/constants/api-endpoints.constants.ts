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
  },
  LABORATORIOS: `${API_BASE_URL}/laboratorio`,
  CATEGORIAS:{
    BASE: `${API_BASE_URL}/categoria`,
    POR_ID: (id: number) => `${API_BASE_URL}/categoria/${id}`,
  },
  PRESTAMOS: `${API_BASE_URL}/prestamo`,
  RESERVAS: `${API_BASE_URL}/reserva`,
  PENALIZACIONES: `${API_BASE_URL}/penalizacion`,
  USUARIOS: `${API_BASE_URL}/usuario`,
  ROLES: `${API_BASE_URL}/rol`,
} as const;

/** Endpoints públicos (no requieren Authorization header ni pasan por el refresh-on-401). */
export const ENDPOINTS_PUBLICOS: string[] = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTRO,
  API_ENDPOINTS.AUTH.REFRESH,
];
