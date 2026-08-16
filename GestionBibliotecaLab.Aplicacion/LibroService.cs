using GestionBibliotecaLab.Aplicacion.Dtos.Libro;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion
{
    public class LibroService : ILibroService
    {
        private readonly AppDbContext _context;
        private readonly IFileStorageService _fileStorage;

        public LibroService(AppDbContext context, IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        public async Task<List<LibroResponse>> GetAllAsync()
        {
            var libros = await _context.Libros.AsNoTracking()
                .Include(l => l.Categoria)
                .OrderBy(l => l.Titulo)
                .ToListAsync();

            return libros.Select(MapearAResponse).ToList();
        }

        public async Task<LibroResponse> GetByIdAsync(int id)
        {
            var libro = await _context.Libros.AsNoTracking()
                .Include(l => l.Categoria)
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el libro con el id {id}");

            return MapearAResponse(libro);
        }

        public async Task<LibroResponse> RegistrarAsync(CreateLibroRequest request)
        {
            var isbn = request.Isbn.Trim();
            await ValidarIsbnDisponibleAsync(isbn);
            await ValidarCategoriaExisteAsync(request.CategoriaId);

            var libro = new Libro
            {
                Titulo = request.Titulo.Trim(),
                Autor = request.Autor.Trim(),
                Isbn = isbn,
                Editorial = request.Editorial?.Trim(),
                AnioPublicacion = request.AnioPublicacion,
                CategoriaId = request.CategoriaId,
                Descripcion = request.Descripcion?.Trim(),
                CantidadTotal = request.CantidadTotal,
                CantidadDisponible = request.CantidadTotal,
                Estado = EstadoLibro.Activo.ToString()
            };

            _context.Libros.Add(libro);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException($"Ya existe un libro registrado con el ISBN {isbn}.");
            }

            await _context.Entry(libro).Reference(l => l.Categoria).LoadAsync();
            return MapearAResponse(libro);
        }

        public async Task ActualizarAsync(int id, UpdateLibroRequest request)
        {
            var libro = await _context.Libros
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el libro con el id {id}");

            var isbn = request.Isbn.Trim();
            await ValidarIsbnDisponibleAsync(isbn, idAExcluir: id);
            await ValidarCategoriaExisteAsync(request.CategoriaId);

            AplicarNuevaCantidadTotal(libro, request.CantidadTotal);

            libro.Titulo = request.Titulo.Trim();
            libro.Autor = request.Autor.Trim();
            libro.Isbn = isbn;
            libro.Editorial = request.Editorial?.Trim();
            libro.AnioPublicacion = request.AnioPublicacion;
            libro.CategoriaId = request.CategoriaId;
            libro.Descripcion = request.Descripcion?.Trim();
            libro.Estado = request.Estado.ToString();

            _context.Entry(libro).Property(l => l.RowVersion).OriginalValue =
                RowVersionConverter.FromBase64(request.RowVersion);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("El libro fue modificado por otro usuario. Vuelve a cargar los datos e inténtalo nuevamente.");
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException($"Ya existe un libro registrado con el ISBN {isbn}.");
            }
        }

        public async Task<LibroResponse> ActualizarPortadaAsync(int id, Stream contenido, string nombreArchivoOriginal)
        {
            var libro = await _context.Libros
                .Include(l => l.Categoria)
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el libro con el id {id}");

            var rutaAnterior = libro.Portada;
            libro.Portada = await _fileStorage.GuardarAsync(contenido, nombreArchivoOriginal, subcarpeta: "libros");

            await _context.SaveChangesAsync();

            _fileStorage.Eliminar(rutaAnterior);

            return MapearAResponse(libro);
        }

        public async Task CambiarEstadoAsync(int id)
        {
            var libro = await _context.Libros
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el libro con el id {id}");

            var seVaADesactivar = !libro.IsDeleted;
            if (seVaADesactivar)
                await ValidarSinPrestamosActivosAsync(id);

            libro.IsDeleted = !libro.IsDeleted;
            await _context.SaveChangesAsync();
        }

        // ---------------------------------------------------------------
        private async Task ValidarIsbnDisponibleAsync(string isbn, int? idAExcluir = null)
        {
            var yaExiste = await _context.Libros
                .AnyAsync(l => l.Isbn == isbn && (idAExcluir == null || l.Id != idAExcluir));

            if (yaExiste)
                throw new DuplicateResourceException($"Ya existe un libro registrado con el ISBN {isbn}.");
        }

        private async Task ValidarCategoriaExisteAsync(int? categoriaId)
        {
            if (categoriaId is null) return;

            var existe = await _context.Categorias.AnyAsync(c => c.Id == categoriaId);
            if (!existe)
                throw new ResourceNotFoundException($"No se encontró la categoría con el ID {categoriaId}.");
        }

        private static void AplicarNuevaCantidadTotal(Libro libro, int nuevoCantidadTotal)
        {
            var prestados = libro.CantidadTotal - libro.CantidadDisponible;
            var diferencia = nuevoCantidadTotal - libro.CantidadTotal;
            var nuevaCantidadDisponible = libro.CantidadDisponible + diferencia;

            if (nuevaCantidadDisponible < 0)
                throw new ConflictException(
                    $"No se puede reducir la cantidad total a {nuevoCantidadTotal}: hay {prestados} ejemplar(es) prestado(s).");

            libro.CantidadTotal = nuevoCantidadTotal;
            libro.CantidadDisponible = nuevaCantidadDisponible;
        }

        private async Task ValidarSinPrestamosActivosAsync(int libroId)
        {
            var tienePrestamosActivos = await _context.Prestamos
                .AnyAsync(p => p.LibroId == libroId && p.Estado != EstadoPrestamo.Devuelto.ToString());

            if (tienePrestamosActivos)
                throw new ConflictException("No se puede dar de baja el libro porque tiene préstamos activos o en mora.");
        }

        private static LibroResponse MapearAResponse(Libro libro) => new()
        {
            Id = libro.Id,
            Titulo = libro.Titulo,
            Autor = libro.Autor,
            Isbn = libro.Isbn,
            Editorial = libro.Editorial,
            AnioPublicacion = libro.AnioPublicacion,
            CategoriaId = libro.CategoriaId,
            NombreCategoria = libro.Categoria?.Nombre,
            Descripcion = libro.Descripcion,
            Portada = libro.Portada,
            CantidadTotal = libro.CantidadTotal,
            CantidadDisponible = libro.CantidadDisponible,
            Estado = libro.Estado,
            RowVersion = RowVersionConverter.ToBase64(libro.RowVersion),
            FechaCreacion = libro.FechaCreacion,
            FechaActualizacion = libro.FechaActualizacion,
            IsDeleted = libro.IsDeleted
        };

    }
}
