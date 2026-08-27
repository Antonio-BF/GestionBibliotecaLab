using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Prestamo;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IPrestamoService
    {
        Task<PaginacionResultado<PrestamoResponse>> GetAllAsync(PrestamoFiltroRequest filtro);
        Task<PrestamoResponse> GetByIdAsync(int id);
        Task<PrestamoResponse> RegistrarAsync(CreatePrestamoRequest request);
        Task<PrestamoResponse> DevolverAsync(int id);
        Task<PrestamoResponse> RenovarAsync(int id, RenovarPrestamoRequest request);
    }
}
