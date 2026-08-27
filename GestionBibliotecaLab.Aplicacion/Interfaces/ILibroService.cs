using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Libro;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface ILibroService
    {
        Task<PaginacionResultado<LibroResponse>> GetAllAsync(LibroFiltroRequest filtro);
        Task<PaginacionResultado<LibroResponse>> GetEliminadosAsync(LibroFiltroRequest filtro);
        Task<LibroResponse> GetByIdAsync(int id);
        Task<LibroResponse> RegistrarAsync(CreateLibroRequest request);
        Task ActualizarAsync(int id, UpdateLibroRequest request);
        Task<LibroResponse> ActualizarPortadaAsync(int id, Stream contenido, string nombreArchivoOriginal);
        Task CambiarEstadoAsync(int id);
    }
}
