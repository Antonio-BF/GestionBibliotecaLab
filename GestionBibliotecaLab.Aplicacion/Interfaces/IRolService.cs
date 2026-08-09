using GestionBibliotecaLab.Aplicacion.Dtos.Rol;
using System;
using System.Collections.Generic;
using System.Text;

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
