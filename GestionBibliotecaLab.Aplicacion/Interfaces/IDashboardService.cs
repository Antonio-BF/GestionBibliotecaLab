using GestionBibliotecaLab.Aplicacion.Dtos.Dashboard;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardUsuarioResponse> ObtenerDashboardUsuarioAsync(CancellationToken cancellationToken = default);
        Task<DashboardBibliotecarioResponse> ObtenerDashboardBibliotecarioAsync(CancellationToken cancellationToken = default);
        Task<DashboardAdministradorResponse> ObtenerDashboardAdministradorAsync(CancellationToken cancellationToken = default);
    }
}