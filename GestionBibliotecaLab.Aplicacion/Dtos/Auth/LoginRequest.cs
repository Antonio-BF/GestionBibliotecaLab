using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Auth
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Password { get; set; } = null!;
    }
}
