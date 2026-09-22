namespace GestionBibliotecaLab.Aplicacion.Dtos.Dashboard
{
    public class DashboardBibliotecarioResponse
    {
        public ResumenPrestamosGlobal Prestamos { get; set; } = new();
        public ResumenReservasGlobal Reservas { get; set; } = new();
        public ResumenPenalizacionesGlobal Penalizaciones { get; set; } = new();
        public ResumenLibros Libros { get; set; } = new();
        public ResumenLaboratorios Laboratorios { get; set; } = new();

        public List<PrestamoDashboardItem> ProximosVencimientos { get; set; } = [];
        public List<PrestamoMoraDashboardItem> PrestamosEnMora { get; set; } = [];
        public List<ReservaDashboardItem> ReservasPendientes { get; set; } = [];

        public List<LibroRankingItem> LibrosMasPrestados { get; set; } = [];
        public List<LaboratorioRankingItem> LaboratoriosMasReservados { get; set; } = [];
    }

    public class ResumenPrestamosGlobal
    {
        public int Total { get; set; }
        public int Activos { get; set; }
        public int EnMora { get; set; }
        public int Devueltos { get; set; }
    }

    public class ResumenReservasGlobal
    {
        public int Total { get; set; }
        public int Pendientes { get; set; }
        public int Confirmadas { get; set; }
        public int Finalizadas { get; set; }
        public int Canceladas { get; set; }
    }

    public class ResumenPenalizacionesGlobal
    {
        public int Total { get; set; }
        public int Pendientes { get; set; }
        public int Pagadas { get; set; }
        public int Anuladas { get; set; }
        public decimal MontoPendiente { get; set; }
    }

    public class ResumenLibros
    {
        public int TotalLibros { get; set; }
        public int EjemplaresTotales { get; set; }
        public int EjemplaresDisponibles { get; set; }
        public int EjemplaresPrestados { get; set; }
    }

    public class ResumenLaboratorios
    {
        public int Total { get; set; }
        public int Disponibles { get; set; }
        public int Mantenimiento { get; set; }
        public int Inactivos { get; set; }
    }

    public class PrestamoMoraDashboardItem
    {
        public int Id { get; set; }
        public string NombreUsuario { get; set; } = null!;
        public string TituloLibro { get; set; } = null!;
        public DateTime FechaDevolucionEsperada { get; set; }
        public int DiasMora { get; set; }
    }

    public class LibroRankingItem
    {
        public int LibroId { get; set; }
        public string Titulo { get; set; } = null!;
        public int CantidadPrestamos { get; set; }
    }

    public class LaboratorioRankingItem
    {
        public int LaboratorioId { get; set; }
        public string Nombre { get; set; } = null!;
        public int CantidadReservas { get; set; }
    }
}