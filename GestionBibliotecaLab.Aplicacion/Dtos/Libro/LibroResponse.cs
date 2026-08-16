namespace GestionBibliotecaLab.Aplicacion.Dtos.Libro
{
    public class LibroResponse
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = null!;
        public string Autor { get; set; } = null!;
        public string Isbn { get; set; } = null!;
        public string? Editorial { get; set; }
        public short? AnioPublicacion { get; set; }
        public int? CategoriaId { get; set; }
        public string? NombreCategoria { get; set; }
        public string? Descripcion { get; set; }
        public string? Portada { get; set; }
        public int CantidadTotal { get; set; }
        public int CantidadDisponible { get; set; }
        public string Estado { get; set; } = null!;
        public string RowVersion { get; set; } = null!;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public bool IsDeleted { get; set; }
    }
}
