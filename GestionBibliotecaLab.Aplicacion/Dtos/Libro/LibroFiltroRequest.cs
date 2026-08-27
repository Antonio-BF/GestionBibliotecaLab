using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Dominio.Enums;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Libro
{
    public class LibroFiltroRequest : FiltroPaginadoBase
    {
        public string? Titulo { get; set; }
        public string? Autor { get; set; }
        public string? Isbn { get; set; }
        public short? AnioPublicacion { get; set; }
        public int? CategoriaId { get; set; }
        public EstadoLibro? Estado { get; set; }
    }
}
