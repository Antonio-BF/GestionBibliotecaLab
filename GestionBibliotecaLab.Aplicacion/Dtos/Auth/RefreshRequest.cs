using System.ComponentModel.DataAnnotations;

namespace GestionBibliotecaLab.Aplicacion.Dtos.Auth
{
    public class RefreshRequest
    {
        [Required(ErrorMessage = "El refresh token es requerido")]
        public string RefreshToken { get; set; } = null!;
    }
}
