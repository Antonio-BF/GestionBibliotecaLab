using GestionBibliotecaLab.Aplicacion.Dtos.Rol;

namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IRolService 
    {
        Task<List<RolResponse>> GetAllRol();
        Task<RolResponse> GetById(int id);
        Task<RolResponse> SaveRol(RolRequest request);
        Task UpdateRol(int id, RolRequest request);
        Task DeleteRol (int id);
    }
}
