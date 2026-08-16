using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Libro
{
    public class CreateLibroRequest
    {
        [Required(ErrorMessage = "El título es requerido")]
        [MaxLength(250)]
        public string Titulo { get; set; } = null!;

        [Required(ErrorMessage = "El autor es requerido")]
        [MaxLength(150)]
        public string Autor { get; set; } = null!;

        [Required(ErrorMessage = "El ISBN es requerido")]
        [MaxLength(20)]
        public string Isbn { get; set; } = null!;

        [MaxLength(150)]
        public string? Editorial { get; set; }

        [Range(1000, 2100, ErrorMessage = "El año de publicación debe estar entre 1000 y 2100")]
        public short? AnioPublicacion { get; set; }

        public int? CategoriaId { get; set; }

        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "La cantidad total es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad total debe ser mayor a 0")]
        public int CantidadTotal { get; set; }
    }
}
