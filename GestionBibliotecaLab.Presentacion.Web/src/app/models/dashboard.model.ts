// Vista Estudiante/Docente
export interface ResumenPrestamosUsuario {
  activos: number;
  enMora: number;
  devueltos: number;
  total: number;
}

export interface ResumenReservasUsuario {
  pendientes: number;
  confirmadas: number;
  finalizadas: number;
  canceladas: number;
  total: number;
}

export interface ResumenPenalizacionesUsuario {
  pendientes: number;
  pagadas: number;
  anuladas: number;
  total: number;
}

export interface PrestamoDashboardItem {
  id: number;
  tituloLibro: string;
  fechaDevolucionEsperada: string;
  estado: string;
  diasRestantes: number;
}

export interface ReservaDashboardItem {
  id: number;
  laboratorioId: number;
  nombreLaboratorio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface ActividadDashboardItem {
  tipo: 'Prestamo' | 'Reserva';
  referenciaId: number;
  descripcion: string;
  fecha: string;
}

export interface DashboardUsuarioResponse {
  nombreUsuario: string;
  rol: string;
  prestamos: ResumenPrestamosUsuario;
  reservas: ResumenReservasUsuario;
  penalizaciones: ResumenPenalizacionesUsuario;
  proximosVencimientos: PrestamoDashboardItem[];
  proximasReservas: ReservaDashboardItem[];
  proximasActividades: ActividadDashboardItem[];
}

// Vista Bibliotecario
export interface ResumenPrestamosGlobal {
  total: number;
  activos: number;
  enMora: number;
  devueltos: number;
}

export interface ResumenReservasGlobal {
  total: number;
  pendientes: number;
  confirmadas: number;
  finalizadas: number;
  canceladas: number;
}

export interface ResumenPenalizacionesGlobal {
  total: number;
  pendientes: number;
  pagadas: number;
  anuladas: number;
  montoPendiente: number;
}

export interface ResumenLibros {
  totalLibros: number;
  ejemplaresTotales: number;
  ejemplaresDisponibles: number;
  ejemplaresPrestados: number;
}

export interface ResumenLaboratorios {
  total: number;
  disponibles: number;
  mantenimiento: number;
  inactivos: number;
}

export interface PrestamoMoraDashboardItem {
  id: number;
  nombreUsuario: string;
  tituloLibro: string;
  fechaDevolucionEsperada: string;
  diasMora: number;
}

export interface LibroRankingItem {
  libroId: number;
  titulo: string;
  cantidadPrestamos: number;
}

export interface LaboratorioRankingItem {
  laboratorioId: number;
  nombre: string;
  cantidadReservas: number;
}

export interface DashboardBibliotecarioResponse {
  prestamos: ResumenPrestamosGlobal;
  reservas: ResumenReservasGlobal;
  penalizaciones: ResumenPenalizacionesGlobal;
  libros: ResumenLibros;
  laboratorios: ResumenLaboratorios;
  proximosVencimientos: PrestamoDashboardItem[];
  prestamosEnMora: PrestamoMoraDashboardItem[];
  reservasPendientes: ReservaDashboardItem[];
  librosMasPrestados: LibroRankingItem[];
  laboratoriosMasReservados: LaboratorioRankingItem[];
}

// Vista Administrador
export interface ResumenUsuarios {
  total: number;
  activos: number;
  inactivos: number;
}

export interface UsuarioPorRolItem {
  rol: string;
  cantidad: number;
}

export interface ActividadPeriodoItem {
  periodo: string;
  cantidad: number;
}

export interface DashboardAdministradorResponse {
  usuarios: ResumenUsuarios;
  libros: ResumenLibros;
  laboratorios: ResumenLaboratorios;
  prestamos: ResumenPrestamosGlobal;
  reservas: ResumenReservasGlobal;
  penalizaciones: ResumenPenalizacionesGlobal;
  usuariosPorRol: UsuarioPorRolItem[];
  librosMasPrestados: LibroRankingItem[];
  laboratoriosMasReservados: LaboratorioRankingItem[];
  actividadPrestamos: ActividadPeriodoItem[];
  actividadReservas: ActividadPeriodoItem[];
}