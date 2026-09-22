namespace GestionBibliotecaLab.Aplicacion.Dtos.Dashboard
{
    public class DashboardUsuarioResponse
    {
        public string NombreUsuario { get; set; } = null!;
        public string Rol { get; set; } = null!;

        public ResumenPrestamosUsuario Prestamos { get; set; } = new();
        public ResumenReservasUsuario Reservas { get; set; } = new();
        public ResumenPenalizacionesUsuario Penalizaciones { get; set; } = new();

        public List<PrestamoDashboardItem> ProximosVencimientos { get; set; } = [];
        public List<ReservaDashboardItem> ProximasReservas { get; set; } = [];
        public List<ActividadDashboardItem> ProximasActividades { get; set; } = [];
    }

    public class ResumenPrestamosUsuario
    {
        public int Activos { get; set; }
        public int EnMora { get; set; }
        public int Devueltos { get; set; }
        public int Total { get; set; }
    }

    public class ResumenReservasUsuario
    {
        public int Pendientes { get; set; }
        public int Confirmadas { get; set; }
        public int Finalizadas { get; set; }
        public int Canceladas { get; set; }
        public int Total { get; set; }
    }

    public class ResumenPenalizacionesUsuario
    {
        public int Pendientes { get; set; }
        public int Pagadas { get; set; }
        public int Anuladas { get; set; }
        public int Total { get; set; }
    }

    public class PrestamoDashboardItem
    {
        public int Id { get; set; }
        public string TituloLibro { get; set; } = null!;
        public DateTime FechaDevolucionEsperada { get; set; }
        public string Estado { get; set; } = null!;
        public int DiasRestantes { get; set; }
    }

    public class ReservaDashboardItem
    {
        public int Id { get; set; }
        public int LaboratorioId { get; set; }
        public string NombreLaboratorio { get; set; } = null!;
        public DateOnly Fecha { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public string Estado { get; set; } = null!;
    }

    public class ActividadDashboardItem
    {
        public string Tipo { get; set; } = null!;
        public int ReferenciaId { get; set; }
        public string Descripcion { get; set; } = null!;
        public DateTime Fecha { get; set; }
    }
}