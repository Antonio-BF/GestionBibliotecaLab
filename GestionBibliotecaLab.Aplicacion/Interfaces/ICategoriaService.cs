using GestionBibliotecaLab.Aplicacion.Dtos.Categoria;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface ICategoriaService
    {
        Task<List<CategoriaResponse>> GetAllAsync();
        Task<CategoriaResponse> GetByIdAsync(int id);
        Task<CategoriaResponse> RegistrarAsync(CategoriaRequest request);
        Task ActualizarAsync(int id, CategoriaRequest request);
        Task EliminarAsync(int id);
    }
}
