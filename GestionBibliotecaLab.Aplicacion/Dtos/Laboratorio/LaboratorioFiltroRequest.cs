using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Dominio.Enums;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio
{
    public class LaboratorioFiltroRequest : FiltroPaginadoBase
    {
        public string? Nombre { get; set; }
        public string? Ubicacion { get; set; }
        public EstadoLaboratorio? Estado { get; set; }
    }
}
