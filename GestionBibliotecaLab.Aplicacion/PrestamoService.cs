using GestionBibliotecaLab.Aplicacion.Dtos.Comun;
using GestionBibliotecaLab.Aplicacion.Dtos.Prestamo;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.utils;
using GestionBibliotecaLab.Aplicacion.Validaciones;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;

namespace GestionBibliotecaLab.Aplicacion
{
    public class PrestamoService : IPrestamoService
    {
        private readonly AppDbContext _context;
        private readonly IPenalizacionService _penalizacionService;

        public PrestamoService(AppDbContext context, IPenalizacionService penalizacionService)
        {
            _context = context;
            _penalizacionService = penalizacionService;
        }

        public async Task<PaginacionResultado<PrestamoResponse>> GetAllAsync(PrestamoFiltroRequest filtro)
        {
            var query = AplicarFiltros(_context.Prestamos.AsNoTracking(), filtro)
                .OrderByDescending(p => p.FechaPrestamo);

            return await query.ToPaginadoAsync(filtro.Pagina, filtro.TamanioPagina, MapearAResponseExpr);
        }

        public async Task<PrestamoResponse> GetByIdAsync(int id)
        {
            return await _context.Prestamos.AsNoTracking()
                    .Where(p => p.Id == id)
                    .Select(MapearAResponseExpr)
                    .FirstOrDefaultAsync()
                    ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {id}");
        }

        public async Task<PrestamoResponse> RegistrarAsync(CreatePrestamoRequest request)
        {
            var usuario = await PrestamoReglasValidacion.ObtenerUsuarioExistenteAsync(_context, request.UsuarioId);
            var libro = await PrestamoReglasValidacion.ObtenerLibroDisponibleParaPrestamoAsync(_context, request.LibroId);

            await PrestamoReglasValidacion.ValidarSinPenalizacionesPendientesAsync(_context, usuario.Id);
            await PrestamoReglasValidacion.ValidarLimiteDePrestamosAsync(_context, usuario.Id);
            await PrestamoReglasValidacion.ValidarNoTieneElMismoLibroPrestadoAsync(_context, usuario.Id, libro.Id);

            var fechaPrestamo = DateTime.UtcNow;

            var prestamo = new Prestamo
            {
                UsuarioId = usuario.Id,
                Usuario = usuario,
                LibroId = libro.Id,
                Libro = libro,
                FechaPrestamo = fechaPrestamo,
                FechaDevolucionEsperada = fechaPrestamo.AddDays(request.DiasPlazo),
                Estado = EstadoPrestamo.Prestado.ToString()
            };

            libro.CantidadDisponible--;

            _context.Prestamos.Add(prestamo);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("El libro fue modificado por otra operación. Vuelve a intentarlo.");
            }

            return PrestamoMapperCompilado(prestamo);
        }

        public async Task<PrestamoResponse> DevolverAsync(int id)
        {
            var prestamo = await _context.Prestamos
                .Include(p => p.Libro).Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {id}");

            PrestamoReglasValidacion.ValidarPuedeDevolver(prestamo);

            var fechaDevolucion = DateTime.UtcNow;
            var fueTardio = fechaDevolucion > prestamo.FechaDevolucionEsperada;

            prestamo.FechaDevolucionReal = fechaDevolucion;
            prestamo.Estado = EstadoPrestamo.Devuelto.ToString();
            prestamo.Libro.CantidadDisponible =
                Math.Min(prestamo.Libro.CantidadDisponible + 1, prestamo.Libro.CantidadTotal);

            await _context.SaveChangesAsync();

            var tienePenalizacion = await _context.Penalizaciones.AnyAsync(p => p.PrestamoId == prestamo.Id);
            if (fueTardio && !tienePenalizacion)
                await _penalizacionService.GenerarPorDevolucionTardiaAsync(prestamo.Id, prestamo.UsuarioId);

            return PrestamoMapperCompilado(prestamo);
        }

        public async Task<PrestamoResponse> RenovarAsync(int id, RenovarPrestamoRequest request)
        {
            var prestamo = await _context.Prestamos
                .Include(p => p.Libro).Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {id}");

            PrestamoReglasValidacion.ValidarPuedeRenovar(prestamo);

            prestamo.FechaDevolucionEsperada = prestamo.FechaDevolucionEsperada.AddDays(request.DiasAdicionales);
            await _context.SaveChangesAsync();

            return PrestamoMapperCompilado(prestamo);
        }

        // ---------------------------------------------------------------
        private static IQueryable<Prestamo> AplicarFiltros(IQueryable<Prestamo> query, PrestamoFiltroRequest filtro)
        {
            if (filtro.UsuarioId.HasValue)
                query = query.Where(p => p.UsuarioId == filtro.UsuarioId);

            if (filtro.LibroId.HasValue)
                query = query.Where(p => p.LibroId == filtro.LibroId);

            if (filtro.Estado.HasValue)
                query = query.Where(p => p.Estado == filtro.Estado.Value.ToString());

            if (!string.IsNullOrWhiteSpace(filtro.BuscarLibro))
            {
                var textoLibro = filtro.BuscarLibro.Trim();
                query = query.Where(p => p.Libro.Titulo.Contains(textoLibro) ||
                                         p.Libro.Isbn.Contains(textoLibro));
            }

            if (!string.IsNullOrWhiteSpace(filtro.BuscarUsuario))
            {
                var textoUsuario = filtro.BuscarUsuario.Trim();
                query = query.Where(p => p.Usuario.Nombres.Contains(textoUsuario) ||
                                         p.Usuario.Apellidos.Contains(textoUsuario) ||
                                         p.Usuario.Email.Contains(textoUsuario));
            }

            if (filtro.FechaDesde.HasValue)
                query = query.Where(p => p.FechaPrestamo >= filtro.FechaDesde.Value);

            if (filtro.FechaHasta.HasValue)
                query = query.Where(p => p.FechaPrestamo <= filtro.FechaHasta.Value);

            return query;
        }

        private static readonly Expression<Func<Prestamo, PrestamoResponse>> MapearAResponseExpr = p => new PrestamoResponse
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            NombreUsuario = p.Usuario.Nombres + " " + p.Usuario.Apellidos,
            EmailUsuario = p.Usuario.Email,
            LibroId = p.LibroId,
            IsbnLibro = p.Libro.Isbn,
            TituloLibro = p.Libro.Titulo,
            FechaPrestamo = p.FechaPrestamo,
            FechaDevolucionEsperada = p.FechaDevolucionEsperada,
            FechaDevolucionReal = p.FechaDevolucionReal,
            Estado = p.Estado
        };

        private static readonly Func<Prestamo, PrestamoResponse> PrestamoMapperCompilado = MapearAResponseExpr.Compile();
    }
}
