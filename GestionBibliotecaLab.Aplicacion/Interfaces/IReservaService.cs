using GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IReservaService
    {
        Task<List<ReservaResponse>> GetAllAsync();
        Task<ReservaResponse> GetByIdAsync(int id);
        Task<List<ReservaResponse>> GetPorUsuarioAsync(int usuarioId);
        Task<bool> VerificarDisponibilidadAsync(int laboratorioId, DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin);
        Task<ReservaResponse> RegistrarAsync(CreateReservaRequest request);
        Task ConfirmarAsync(int id);
        Task CancelarAsync(int id, int usuarioIdSolicitante, bool esStaff);
        Task ActualizarEstadosVencidosAsync();
    }
}
