using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab
{
    public class CreateReservaRequest
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        public int UsuarioId { get; set; }

        [Required(ErrorMessage = "El laboratorio es requerido")]
        public int LaboratorioId { get; set; }

        [Required(ErrorMessage = "La fecha es requerida")]
        public DateOnly Fecha { get; set; }

        [Required(ErrorMessage = "La hora de inicio es requerida")]
        public TimeOnly HoraInicio { get; set; }

        [Required(ErrorMessage = "La hora de fin es requerida")]
        public TimeOnly HoraFin { get; set; }
    }
}
