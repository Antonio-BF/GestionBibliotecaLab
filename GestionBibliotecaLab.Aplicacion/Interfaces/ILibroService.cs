using GestionBibliotecaLab.Aplicacion.Dtos.Libro;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface ILibroService
    {
        Task<List<LibroResponse>> GetAllAsync();
        Task<LibroResponse> GetByIdAsync(int id);
        Task<LibroResponse> RegistrarAsync(CreateLibroRequest request);
        Task ActualizarAsync(int id, UpdateLibroRequest request);
        Task<LibroResponse> ActualizarPortadaAsync(int id, Stream contenido, string nombreArchivoOriginal);
        Task CambiarEstadoAsync(int id);
    }
}
