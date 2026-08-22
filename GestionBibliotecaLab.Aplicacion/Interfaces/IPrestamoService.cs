using GestionBibliotecaLab.Aplicacion.Dtos.Prestamo;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IPrestamoService
    {
        Task<List<PrestamoResponse>> GetAllAsync();
        Task<PrestamoResponse> GetByIdAsync(int id);
        Task<List<PrestamoResponse>> GetPorUsuarioAsync(int usuarioId);
        Task<PrestamoResponse> RegistrarAsync(CreatePrestamoRequest request);
        Task<PrestamoResponse> DevolverAsync(int id);
        Task<PrestamoResponse> RenovarAsync(int id, RenovarPrestamoRequest request);
    }
}
