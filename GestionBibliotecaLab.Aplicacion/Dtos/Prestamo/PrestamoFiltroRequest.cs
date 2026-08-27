using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Dominio.Enums;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Prestamo
{
    public class PrestamoFiltroRequest : FiltroPaginadoBase
    {
        public int? UsuarioId { get; set; }
        public int? LibroId { get; set; }
        public EstadoPrestamo? Estado { get; set; }
        public string? BuscarUsuario { get; set; }
        public string? BuscarLibro { get; set; }
        public DateTime? FechaDesde { get; set; }
        public DateTime? FechaHasta { get; set; }
    }
}
