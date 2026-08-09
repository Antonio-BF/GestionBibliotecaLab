using GestionBibliotecaLab.Dominio.Entidades;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IJwtService
    {
        (string Token, DateTime Expiracion) GenerarAccessToken(Usuario usuario);
        string GenerarRefreshToken();
        string HashRefreshToken(string refreshTokenPlano);
    }
}
