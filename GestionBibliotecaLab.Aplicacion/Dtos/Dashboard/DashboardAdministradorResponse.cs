namespace GestionBibliotecaLab.Aplicacion.Dtos.Dashboard
{
    public class DashboardAdministradorResponse
    {
        public ResumenUsuarios Usuarios { get; set; } = new();
        public ResumenLibros Libros { get; set; } = new();
        public ResumenLaboratorios Laboratorios { get; set; } = new();
        public ResumenPrestamosGlobal Prestamos { get; set; } = new();
        public ResumenReservasGlobal Reservas { get; set; } = new();
        public ResumenPenalizacionesGlobal Penalizaciones { get; set; } = new();

        public List<UsuarioPorRolItem> UsuariosPorRol { get; set; } = [];
        public List<LibroRankingItem> LibrosMasPrestados { get; set; } = [];
        public List<LaboratorioRankingItem> LaboratoriosMasReservados { get; set; } = [];

        public List<ActividadPeriodoItem> ActividadPrestamos { get; set; } = [];
        public List<ActividadPeriodoItem> ActividadReservas { get; set; } = [];
    }

    public class ResumenUsuarios
    {
        public int Total { get; set; }
        public int Activos { get; set; }
        public int Inactivos { get; set; }
    }

    public class UsuarioPorRolItem
    {
        public string Rol { get; set; } = null!;
        public int Cantidad { get; set; }
    }

    public class ActividadPeriodoItem
    {
        public DateTime Periodo { get; set; }
        public int Cantidad { get; set; }
    }
}