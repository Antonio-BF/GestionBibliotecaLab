using GestionBibliotecaLab.Aplicacion.Dtos.Rol;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using GestionBibliotecaLab.Dominio.Entidades;

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
                .Select(x => new RolResponse
                {
                    Id = x.Id,
                    Nombre = x.Nombre,
                    Descripcion = x.Descripcion
                })
                .ToListAsync();
        }

        public async Task<RolResponse> GetById(int id)
        {
            var rol = await _context.Roles.FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new ResourceNotFoundException($"No se pudo encontrar el rol con le ID {id}");

            return new RolResponse
            {
                Id = rol.Id,
                Nombre = rol.Nombre,
                Descripcion = rol.Descripcion
            };
        }

        public async Task<RolResponse> SaveRol(RolRequest request)
        {
            var NombreRol = request.Nombre.Trim();

            if (await _context.Roles.AnyAsync(x => x.Nombre == NombreRol))
                throw new DuplicateResourceException($"El nombre {NombreRol} ya se encuenta registrado en el sistema");

            var rol = new Rol
            {
                Nombre = NombreRol,
                Descripcion = request.Descripcion
            };

            _context.Roles.Add(rol);
            await _context.SaveChangesAsync();

            return new RolResponse
            {
                Id = rol.Id,
                Nombre = rol.Nombre,
                Descripcion = rol.Descripcion
            };
        }

        public async Task UpdateRol(int id, RolRequest request)
        {
            var rol = await _context.Roles.FindAsync(id)
               ?? throw new ResourceNotFoundException($"No se pudo encontrar el rol con le ID {id}");

            var NombreRol = request.Nombre.Trim();

            if (await _context.Roles.AnyAsync(x => x.Id != id && x.Nombre == NombreRol))
                throw new DuplicateResourceException($"El nombre {NombreRol} ya se encuenta registrado en el sistema");

            rol.Nombre = NombreRol;
            rol.Descripcion = request.Descripcion;

           await _context.SaveChangesAsync();
        }
        public async Task DeleteRol(int id)
        {
            var rol = await _context.Roles.FindAsync(id)
               ?? throw new ResourceNotFoundException($"No se pudo encontrar el rol con le ID {id}");

            if (await _context.Usuarios.IgnoreQueryFilters().AnyAsync(x => x.RolId == id))
                throw new ConflictException("No se puede eliminar el rol porque hay usuarios registrados con ese rol");

            _context.Roles.Remove(rol);
            await _context.SaveChangesAsync();
        }
    }
}
