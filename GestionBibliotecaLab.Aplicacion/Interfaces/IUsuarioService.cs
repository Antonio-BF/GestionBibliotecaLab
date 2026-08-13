using GestionBibliotecaLab.Aplicacion.Dtos.Usuario;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IUsuarioService
    {
        Task<List<UsuarioResponse>> GetAllUsuarioAsync();
        Task<UsuarioResponse> GetByIdAsync(int id);
        Task<UsuarioResponse> RegistrarUsuarioAsync(CreateUsuarioRequest request);
        Task ActualizarUsuarioAsync(int id, UpdateUsuarioRequest request);
        Task CambiarEstadoAsync(int id);
    }
}
