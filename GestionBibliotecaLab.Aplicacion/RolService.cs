using GestionBibliotecaLab.Aplicacion.Dtos.Rol;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion
{
    public class RolService : IRolService
    {
        private readonly AppDbContext _context;

        public RolService(AppDbContext appDbContext)
        {
            _context = appDbContext;
        }

        public async Task<List<RolResponse>> GetAllRol()
        {
            return await _context.Roles.AsNoTracking()
                .Select(x => new RolResponse { 
                    Id = x.Id, 
                    Nombre = x.Nombre, 
                    Descripcion = x.Descripcion })
                .ToListAsync();
        }

        public async Task<RolResponse> GetById(int id)
        {
            var rol = await _context.Roles.FirstOrDefaultAsync(x => x.Id == id);

            if (rol == null) throw new ResourceNotFoundException($"No se pudo encontrar el rol con le ID {id}");

            return new RolResponse
            {
                Id = rol.Id,
                Nombre = rol.Nombre,
                Descripcion = rol.Descripcion
            };
        }

        public Task<RolResponse> SaveRol(RolRequest request)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateRol(int id, RolRequest request)
        {
            throw new NotImplementedException();
        }
        public Task<bool> DeleteRol(int id)
        {
            throw new NotImplementedException();
        }



    }
}
