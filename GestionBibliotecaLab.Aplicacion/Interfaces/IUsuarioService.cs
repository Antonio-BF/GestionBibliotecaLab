using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Usuario;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IUsuarioService
    {
        Task<PaginacionResultado<UsuarioResponse>> GetAllUsuarioAsync(UsuarioFiltroRequest filtro);
        Task<PaginacionResultado<UsuarioResponse>> GetEliminadosAsync(UsuarioFiltroRequest filtro);
        Task<UsuarioResponse> GetByIdAsync(int id);
        Task<UsuarioResponse> RegistrarUsuarioAsync(CreateUsuarioRequest request);
        Task ActualizarUsuarioAsync(int id, UpdateUsuarioRequest request);
        Task CambiarEstadoAsync(int id);
    }
}
