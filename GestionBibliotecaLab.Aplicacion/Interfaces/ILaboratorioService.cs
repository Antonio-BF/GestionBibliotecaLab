using GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface ILaboratorioService
    {
        Task<List<LaboratorioResponse>> GetAllAsync();
        Task<LaboratorioResponse> GetByIdAsync(int id);
        Task<LaboratorioResponse> RegistrarAsync(CreateLaboratorioRequest request);
        Task ActualizarAsync(int id, UpdateLaboratorioRequest request);
        Task<LaboratorioResponse> ActualizarImagenAsync(int id, Stream contenido, string nombreArchivoOriginal);
        Task CambiarEstadoAsync(int id);
    }
}
