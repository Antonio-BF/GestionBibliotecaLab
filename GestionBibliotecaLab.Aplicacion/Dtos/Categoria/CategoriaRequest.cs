using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Categoria
{
    public class CategoriaRequest
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El campo solo acepta 100 caracteres")]
        public string Nombre { get; set; } = null!;

        [MaxLength(300, ErrorMessage = "El campo solo acepta 300 caracteres")]
        public string? Descripcion { get; set; }
    }
}
