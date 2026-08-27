using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Seguridad;
using GestionBibliotecaLab.Aplicacion.utils;
using GestionBibliotecaLab.Aplicacion.Validaciones;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion
{
    public class LaboratorioService : ILaboratorioService
    {
        private readonly AppDbContext _context;
        private readonly IFileStorageService _fileStorage;
        public LaboratorioService(AppDbContext context, IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }
        public async Task<PaginacionResultado<LaboratorioResponse>> GetAllAsync(LaboratorioFiltroRequest filtro)
        {
            var query = AplicarFiltros(_context.Laboratorios.AsNoTracking(), filtro).OrderBy(l => l.Nombre);
            var paginado = await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina);
            return paginado.Mapear(MapearAResponse);
        }

        public async Task<PaginacionResultado<LaboratorioResponse>> GetEliminadosAsync(LaboratorioFiltroRequest filtro)
        {
            var query = AplicarFiltros(
                    _context.Laboratorios.IgnoreQueryFilters().AsNoTracking().Where(l => l.IsDeleted),
                    filtro)
                .OrderByDescending(l => l.FechaActualizacion);

            var paginado = await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina);
            return paginado.Mapear(MapearAResponse);
        }

        public async Task<LaboratorioResponse> GetByIdAsync(int id)
        {
            var laboratorio = await _context.Laboratorios.AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el laboratorio con el id {id}");

            return MapearAResponse(laboratorio);
        }

        public async Task<LaboratorioResponse> RegistrarAsync(CreateLaboratorioRequest request)
        {
            var nombre = request.Nombre.Trim();
            await ValidarNombreDisponibleAsync(nombre);

            var laboratorio = new Laboratorio
            {
                Nombre = nombre,
                Capacidad = request.Capacidad,
                Equipamiento = request.Equipamiento?.Trim(),
                Descripcion = request.Descripcion?.Trim(),
                Ubicacion = request.Ubicacion.Trim(),
                Estado = EstadoLaboratorio.Disponible.ToString()
            };

            _context.Laboratorios.Add(laboratorio);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException($"Ya existe un laboratorio registrado con el nombre {nombre}.");
            }

            return MapearAResponse(laboratorio);
        }

        public async Task ActualizarAsync(int id, UpdateLaboratorioRequest request)
        {
            var laboratorio = await _context.Laboratorios
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el laboratorio con el id {id}");
            var nombre = request.Nombre.Trim();

            await ValidarNombreDisponibleAsync(nombre, idAExcluir: id);

            laboratorio.Nombre = nombre;
            laboratorio.Capacidad = request.Capacidad;
            laboratorio.Equipamiento = request.Equipamiento?.Trim();
            laboratorio.Descripcion = request.Descripcion?.Trim();
            laboratorio.Ubicacion = request.Ubicacion.Trim();
            laboratorio.Estado = request.Estado.ToString();

            _context.Entry(laboratorio).Property(l => l.RowVersion).OriginalValue =
                RowVersionConverter.FromBase64(request.RowVersion);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException(
                    "El laboratorio fue modificado por otro usuario. Vuelve a cargar los datos e inténtalo nuevamente.");
            }
            catch (DbUpdateException)
            {
                throw new DuplicateResourceException($"Ya existe un laboratorio registrado con el nombre {nombre}.");
            }
        }

        public async Task<LaboratorioResponse> ActualizarImagenAsync(int id, Stream contenido, string nombreArchivoOriginal)
        {
            var laboratorio = await _context.Laboratorios
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el laboratorio con el id {id}");

            var rutaAnterior = laboratorio.Imagen;
            laboratorio.Imagen = await _fileStorage.GuardarAsync(contenido, nombreArchivoOriginal, subcarpeta: "laboratorios");

            await _context.SaveChangesAsync();
            _fileStorage.Eliminar(rutaAnterior);

            return MapearAResponse(laboratorio);
        }

        public async Task CambiarEstadoAsync(int id)
        {
            var laboratorio = await _context.Laboratorios
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(l => l.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el laboratorio con el id {id}");

            var seVaADesactivar = !laboratorio.IsDeleted;

            if (seVaADesactivar)
                await ValidarSinReservasActivasAsync(id);

            laboratorio.IsDeleted = !laboratorio.IsDeleted;
            await _context.SaveChangesAsync();
        }

        // ---------------------------------------------------------------
        private static IQueryable<Laboratorio> AplicarFiltros(IQueryable<Laboratorio> query, LaboratorioFiltroRequest filtro)
        {
            if (!string.IsNullOrWhiteSpace(filtro.Nombre))
                query = query.Where(l => l.Nombre.Contains(filtro.Nombre));

            if (!string.IsNullOrWhiteSpace(filtro.Ubicacion))
                query = query.Where(l => l.Ubicacion.Contains(filtro.Ubicacion));

            if (filtro.Estado.HasValue)
                query = query.Where(l => l.Estado == filtro.Estado.Value.ToString());

            return query;
        }

        private async Task ValidarSinReservasActivasAsync(int laboratorioId)
        {
            if (await EstadosActivosQueries.LaboratorioTieneReservasActivasAsync(_context, laboratorioId))
                throw new ConflictException("No se puede dar de baja el laboratorio porque tiene reservas pendientes o confirmadas.");
        }

        private async Task ValidarNombreDisponibleAsync(string nombre, int? idAExcluir = null)
        {
            var yaExiste = await _context.Laboratorios
                .AnyAsync(l => l.Nombre == nombre && (idAExcluir == null || l.Id != idAExcluir));

            if (yaExiste)
                throw new DuplicateResourceException($"Ya existe un laboratorio registrado con el nombre '{nombre}'.");
        }

        private static LaboratorioResponse MapearAResponse(Laboratorio laboratorio) => new()
        {
            Id = laboratorio.Id,
            Nombre = laboratorio.Nombre,
            Capacidad = laboratorio.Capacidad,
            Equipamiento = laboratorio.Equipamiento,
            Descripcion = laboratorio.Descripcion,
            Imagen = laboratorio.Imagen,
            Ubicacion = laboratorio.Ubicacion,
            Estado = laboratorio.Estado,
            RowVersion = RowVersionConverter.ToBase64(laboratorio.RowVersion),
            FechaCreacion = laboratorio.FechaCreacion,
            FechaActualizacion = laboratorio.FechaActualizacion,
            IsDeleted = laboratorio.IsDeleted
        };
    }
}
