using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Dominio.Enums;

namespace GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab
{
    public class ReservaFiltroRequest : FiltroPaginadoBase
    {
        public int? UsuarioId { get; set; }
        public int? LaboratorioId { get; set; }
        public string? BuscarUsuario { get; set; }
        public string? BuscarLaboratorio { get; set; }
        public EstadoReserva? Estado { get; set; }
        public DateOnly? Fecha { get; set; }
    }
}
