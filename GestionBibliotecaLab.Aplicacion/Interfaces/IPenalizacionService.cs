using GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IPenalizacionService
    {
        Task<List<PenalizacionResponse>> GetAllAsync();
        Task<PenalizacionResponse> GetByIdAsync(int id);
        Task<List<PenalizacionResponse>> GetPorUsuarioAsync(int usuarioId);
        Task<List<PenalizacionResponse>> GetPorPrestamoAsync(int prestamoId);  
        Task<List<PenalizacionResponse>> GetPorReservaAsync(int reservaLabId); 
        Task<PenalizacionResponse> RegistrarAsync(CreatePenalizacionRequest request); 
        Task GenerarPorDevolucionTardiaAsync(int prestamoId, int usuarioId);
        Task ResolverAsync(int id);
        Task AnularAsync(int id);
    }
}
