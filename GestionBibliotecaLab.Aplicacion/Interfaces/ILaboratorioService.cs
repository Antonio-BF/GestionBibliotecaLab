using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface ILaboratorioService
    {
        Task<PaginacionResultado<LaboratorioResponse>> GetAllAsync(LaboratorioFiltroRequest filtro);
        Task<PaginacionResultado<LaboratorioResponse>> GetEliminadosAsync(LaboratorioFiltroRequest filtro);
        Task<LaboratorioResponse> GetByIdAsync(int id);
        Task<LaboratorioResponse> RegistrarAsync(CreateLaboratorioRequest request);
        Task ActualizarAsync(int id, UpdateLaboratorioRequest request);
        Task<LaboratorioResponse> ActualizarImagenAsync(int id, Stream contenido, string nombreArchivoOriginal);
        Task CambiarEstadoAsync(int id);
    }
}
