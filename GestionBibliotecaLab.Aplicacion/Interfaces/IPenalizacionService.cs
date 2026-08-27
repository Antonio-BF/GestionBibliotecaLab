using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IPenalizacionService
    {
        Task<PaginacionResultado<PenalizacionResponse>> GetAllAsync(PenalizacionFiltroRequest filtro);
        Task<PenalizacionResponse> GetByIdAsync(int id);
        Task<PenalizacionResponse> RegistrarAsync(CreatePenalizacionRequest request);
        Task GenerarPorDevolucionTardiaAsync(int prestamoId, int usuarioId);
        Task ResolverAsync(int id);
        Task AnularAsync(int id);
    }
}
