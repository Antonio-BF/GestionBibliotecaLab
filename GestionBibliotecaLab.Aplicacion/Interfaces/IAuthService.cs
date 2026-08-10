using GestionBibliotecaLab.Aplicacion.Dtos.Auth;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegistrarAsync(RegistroRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RefrescarTokenAsync(RefreshRequest request);
        Task LogoutAsync(RefreshRequest request);
    }
}
