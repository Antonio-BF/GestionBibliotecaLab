using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Dominio.Enums;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion
{
    public class PenalizacionFiltroRequest : FiltroPaginadoBase
    {
        public int? UsuarioId { get; set; }
        public string? BuscarUsuario { get; set; }
        public int? PrestamoId { get; set; }
        public int? ReservaLabId { get; set; }
        public OrigenPenalizacion? Origen { get; set; }
        public TipoPenalizacion? Tipo { get; set; }
        public EstadoPenalizacion? Estado { get; set; }
    }
}
