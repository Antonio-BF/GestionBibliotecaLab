using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Auth
{
    public class RegistroRequest
    {
        [Required(ErrorMessage = "El campo Nombres es requerido")]
        [MaxLength(100, ErrorMessage = "El campo solo acepta 100 caracteres")]
        public string Nombres { get; set; } = null!;

        [Required(ErrorMessage = "El campo Apellidos es requerido")]
        [MaxLength(100, ErrorMessage = "El campo solo acepta 100 caracteres")]
        public string Apellidos { get; set; } = null!;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        [MaxLength(150, ErrorMessage = "El campo solo acepta 150 caracteres")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).+$",
            ErrorMessage = "La contraseña debe contener al menos una letra y un número")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "El rol es requerido")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe indicar un RolId válido")]
        public int RolId { get; set; }
    }
}
