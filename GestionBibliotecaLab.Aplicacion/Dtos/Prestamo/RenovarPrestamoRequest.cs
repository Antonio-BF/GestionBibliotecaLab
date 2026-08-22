using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Prestamo
{
    public class RenovarPrestamoRequest
    {
        [Range(1, 30, ErrorMessage = "La renovación debe ser entre 1 y 30 días")]
        public int DiasAdicionales { get; set; } = 7;
    }
}
