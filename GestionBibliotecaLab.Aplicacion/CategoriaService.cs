using GestionBibliotecaLab.Aplicacion.Dtos.Categoria;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GestionBibliotecaLab.Aplicacion
{
    public class CategoriaService : ICategoriaService
    {
        private readonly AppDbContext _context;

        public CategoriaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoriaResponse>> GetAllAsync()
        {
            return await _context.Categorias.AsNoTracking()
                .Select(MapearAResponse)
                .ToListAsync();
        }

        public async Task<CategoriaResponse> GetByIdAsync(int id)
        {
            return await _context.Categorias.AsNoTracking()
                .Where(c => c.Id == id)
                .Select(MapearAResponse)
                .FirstOrDefaultAsync()
                ?? throw new ResourceNotFoundException($"No se encontró la categoría con el id {id}");
        }

        public async Task<CategoriaResponse> RegistrarAsync(CategoriaRequest request)
        {
            var nombre = request.Nombre.Trim();
            await ValidarNombreDisponibleAsync(nombre);

            var categoria = new Categoria { Nombre = nombre, Descripcion = request.Descripcion?.Trim() };

            _context.Categorias.Add(categoria);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException($"Ya existe una categoría registrada con el nombre '{nombre}'.");
            }

            return new CategoriaResponse { Id = categoria.Id, Nombre = categoria.Nombre, Descripcion = categoria.Descripcion };
        }

        public async Task ActualizarAsync(int id, CategoriaRequest request)
        {
            var categoria = await _context.Categorias.FindAsync(id)
                ?? throw new ResourceNotFoundException($"No se encontró la categoría con el id {id}");

            var nombre = request.Nombre.Trim();
            await ValidarNombreDisponibleAsync(nombre, idAExcluir: id);

            categoria.Nombre = nombre;
            categoria.Descripcion = request.Descripcion?.Trim();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException($"Ya existe una categoría registrada con el nombre '{nombre}'.");
            }
        }

        public async Task EliminarAsync(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id)
                ?? throw new ResourceNotFoundException($"No se encontró la categoría con el id {id}");

            if (await _context.Libros.AnyAsync(l => l.CategoriaId == id))
                throw new ConflictException("No se puede eliminar la categoría porque tiene libros asociados.");

            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
        }

        private async Task ValidarNombreDisponibleAsync(string nombre, int? idAExcluir = null)
        {
            var yaExiste = await _context.Categorias
                .AnyAsync(c => c.Nombre == nombre && (idAExcluir == null || c.Id != idAExcluir));

            if (yaExiste)
                throw new DuplicateResourceException($"Ya existe una categoría registrada con el nombre '{nombre}'.");
        }

        private static readonly Expression<Func<Categoria, CategoriaResponse>> MapearAResponse =
            c => new CategoriaResponse { Id = c.Id, Nombre = c.Nombre, Descripcion = c.Descripcion };
    }
}
