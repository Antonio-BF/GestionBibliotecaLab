using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IReservaService
    {
        Task<PaginacionResultado<ReservaResponse>> GetAllAsync(ReservaFiltroRequest filtro);
        Task<ReservaResponse> GetByIdAsync(int id);
        Task<bool> VerificarDisponibilidadAsync(int laboratorioId, DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin);
        Task<ReservaResponse> RegistrarAsync(CreateReservaRequest request);
        Task ConfirmarAsync(int id);
        Task CancelarAsync(int id, int usuarioIdSolicitante, bool esStaff);
        Task ActualizarEstadosVencidosAsync();
    }
}
