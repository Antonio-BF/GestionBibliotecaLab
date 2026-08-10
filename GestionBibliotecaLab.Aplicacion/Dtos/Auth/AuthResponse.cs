namespace GestionBibliotecaLab.Aplicacion.Dtos.Auth
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public DateTime FechaExpiracionAccessToken { get; set; }
        public string Nombres { get; set; } = null!;
        public string Apellidos { get; set; } = null!;
        public string Rol { get; set; } = null!;
    }
}
