using GestionBibliotecaLab.Aplicacion.Dtos.Auth;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> RegistrarAsync(RegistroRequest request);
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<LoginResponse> RefrescarTokenAsync(RefreshRequest request);
        Task LogoutAsync(RefreshRequest request);
    }
}
