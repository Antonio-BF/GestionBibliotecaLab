namespace GestionBibliotecaLab.Aplicacion.Seguridad
{
    public class JwtSettings
    {
        public string Issuer { get; set; } = null!;
        public string Audience { get; set; } = null!;
        public string SigningKey { get; set; } = null!;
        public int AccessTokenMinutos { get; set; } = 20;
        public int RefreshTokenDias { get; set; } = 7;
    }
}
