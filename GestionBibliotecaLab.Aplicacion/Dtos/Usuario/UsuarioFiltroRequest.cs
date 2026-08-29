using GestionBibliotecaLab.Aplicacion.Dtos.Comun;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Usuario
{
    public class UsuarioFiltroRequest : FiltroPaginadoBase
    {
        public string? Busqueda { get; set; }
        public int? RolId { get; set; }
    }
}
