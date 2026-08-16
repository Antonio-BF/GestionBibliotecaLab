using GestionBibliotecaLab.Dominio.Enums;
using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Libro
{
    public class UpdateLibroRequest
    {
        [Required, MaxLength(250)]
        public string Titulo { get; set; } = null!;

        [Required, MaxLength(150)]
        public string Autor { get; set; } = null!;

        [Required, MaxLength(20)]
        public string Isbn { get; set; } = null!;

        [MaxLength(150)]
        public string? Editorial { get; set; }

        [Range(1000, 2100, ErrorMessage = "El año de publicación debe estar entre 1000 y 2100")]
        public short? AnioPublicacion { get; set; }

        public int? CategoriaId { get; set; }

        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        [Required, Range(1, int.MaxValue, ErrorMessage = "La cantidad total debe ser mayor a 0")]
        public int CantidadTotal { get; set; }

        [Required (ErrorMessage = "El estado es requerido")]
        [EnumDataType(typeof(EstadoLibro), ErrorMessage = "El estado enviado no es válido.")]
        public EstadoLibro Estado { get; set; }

        [Required(ErrorMessage = "El RowVersion es requerido para controlar concurrencia")]
        public string RowVersion { get; set; } = null!;
    }
}
