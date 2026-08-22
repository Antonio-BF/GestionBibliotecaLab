using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Prestamo
{
    public class CreatePrestamoRequest
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        public int UsuarioId { get; set; }

        [Required(ErrorMessage = "El libro es requerido")]
        public int LibroId { get; set; }

        [Range(1, 90, ErrorMessage = "El plazo debe estar entre 1 y 90 días")]
        public int DiasPlazo { get; set; } = 14;
    }
}
